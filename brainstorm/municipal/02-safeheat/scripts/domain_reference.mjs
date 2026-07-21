#!/usr/bin/env node
/**
 * Dependency-free reference domain model for the SafeHeat demo.
 *
 * This is not a UI implementation. It provides executable truth rules and a
 * fallback smoke test that a one-hour build can adapt. All event-time data are
 * synthetic fixture values.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const FIXTURE_PATH = path.join(ROOT, "data", "processed", "demo_data.json");

export function loadFixture() {
  return JSON.parse(fs.readFileSync(FIXTURE_PATH, "utf8"));
}

export function clone(value) {
  return structuredClone(value);
}

export function instant(value) {
  const ms = Date.parse(value);
  if (!Number.isFinite(ms)) throw new Error(`Invalid ISO timestamp: ${value}`);
  return ms;
}

export function isFresh(status, currentDemoTime) {
  if (!status?.verifiedAt || !status?.expiresAt) return false;
  const now = instant(currentDemoTime);
  return instant(status.verifiedAt) <= now && now < instant(status.expiresAt);
}

export function facilityHasVerifiedEventRecord(facility, fixture, currentDemoTime) {
  if (!facility?.eligibleIndoorCooling) return false;
  if (facility.reliefClass !== "public_indoor_cooling_capable") return false;
  const status = facility.operationalStatus ?? {};
  if (!["open", "extended_hours"].includes(status.state)) return false;
  if (status.authorityClass !== "synthetic_demo") return false;
  if (!isFresh(status, currentDemoTime)) return false;
  if (!status.eventOpenAt || !status.eventCloseAt) return false;
  const dangerStart = instant(fixture.operationalPeriod.dangerWindowStart);
  const dangerEnd = instant(fixture.operationalPeriod.dangerWindowEnd);
  return instant(status.eventOpenAt) < dangerEnd && instant(status.eventCloseAt) > dangerStart;
}

export function facilityHasVerifiedEventAvailability(facility, fixture, currentDemoTime) {
  return (
    facilityHasVerifiedEventRecord(facility, fixture, currentDemoTime) &&
    facility.operationalStatus.capacity !== "full"
  );
}

export function facilityIsVerifiedOpenNow(facility, fixture, currentDemoTime) {
  if (!facilityHasVerifiedEventAvailability(facility, fixture, currentDemoTime)) return false;
  const status = facility.operationalStatus;
  const now = instant(currentDemoTime);
  return instant(status.eventOpenAt) <= now && now < instant(status.eventCloseAt);
}

// Backward-compatible alias for app implementations that copied the first draft.
export const facilityIsVerifiedOpen = facilityIsVerifiedOpenNow;

export function facilityQualifiesForLocalIndoorAccess(
  facility,
  relationship,
  fixture,
  currentDemoTime,
) {
  return Boolean(
    relationship?.withinIndoorAccessThreshold &&
    facilityIsVerifiedOpenNow(facility, fixture, currentDemoTime),
  );
}

function byId(items) {
  return new Map(items.map((item) => [item.id, item]));
}

export function deriveIndoorAccess(zone, facilities, fixture, currentDemoTime) {
  const facilitiesById = byId(facilities);
  return zone.relationships.some((relationship) =>
    facilityQualifiesForLocalIndoorAccess(
      facilitiesById.get(relationship.facilityId),
      relationship,
      fixture,
      currentDemoTime,
    ),
  )
    ? "covered"
    : "uncovered";
}

export function deriveAccessGap(zone, facilities, fixture, currentDemoTime) {
  const facilitiesById = byId(facilities);
  const openAlternates = [];
  let qualifyingCount = 0;

  for (const relationship of zone.relationships) {
    const facility = facilitiesById.get(relationship.facilityId);
    if (!facility) throw new Error(`Unknown facility ${relationship.facilityId}`);
    if (facilityQualifiesForLocalIndoorAccess(facility, relationship, fixture, currentDemoTime)) {
      qualifyingCount += 1;
    }
    if (facilityHasVerifiedEventRecord(facility, fixture, currentDemoTime)) {
      openAlternates.push({ facility, relationship });
    }
  }

  const factors = {
    noQualifyingIndoorFacility: qualifyingCount === 0,
    nearestClosesBeforeDangerEnd: Boolean(
      zone.baseAccessFactors.nearestQualifyingClosesBeforeDangerEnd,
    ),
    capacityRisk: Boolean(zone.baseAccessFactors.capacityRisk),
    transitPoorOrUnknown: Boolean(zone.baseAccessFactors.transitPoorOrUnknown),
    statusUnknownOrStale: Boolean(zone.baseAccessFactors.relevantStatusUnknownOrStale),
  };

  openAlternates.sort(
    (a, b) => a.relationship.distanceMilesApprox - b.relationship.distanceMilesApprox,
  );
  if (openAlternates.length) {
    const nearestStatus = openAlternates[0].facility.operationalStatus;
    factors.nearestClosesBeforeDangerEnd ||=
      instant(nearestStatus.eventCloseAt) < instant(fixture.operationalPeriod.dangerWindowEnd);
    factors.capacityRisk ||= ["limited", "full", "unknown"].includes(nearestStatus.capacity);
  }

  const points = fixture.methodology.accessGapPoints;
  const score = Object.entries(factors)
    .filter(([, active]) => active)
    .reduce((total, [name]) => total + Number(points[name]), 0);

  return { score: Math.max(0, Math.min(100, score)), factors };
}

export function derivePriorityScore(zone, accessGapScore, fixture) {
  if ([zone.heatPercentile, zone.sviPercentile, accessGapScore].some((value) => value == null)) {
    return null;
  }
  const w = fixture.methodology.weights;
  const value =
    zone.heatPercentile * w.heatPercentile +
    zone.sviPercentile * w.sviPercentile +
    accessGapScore * w.accessGapScore;
  return Math.round(value * 10) / 10;
}

export function derivePriorityBand(score, fixture) {
  if (score == null) return "incomplete";
  const b = fixture.methodology.bands;
  if (score >= b.criticalMin) return "critical";
  if (score >= b.highMin) return "high";
  if (score >= b.moderateMin) return "moderate";
  return "monitor";
}

export function deriveMitigationState(zoneId, tasks) {
  const relevant = tasks.filter(
    (task) => task.zoneId === zoneId && task.type === "transport_to_verified_site",
  );
  if (relevant.some((task) => task.status === "completed")) return "transport_completed";
  if (relevant.some((task) => ["assigned", "in_progress"].includes(task.status)))
    return "transport_active";
  return "none";
}

export function deriveZone(zone, state, fixture) {
  const gap = deriveAccessGap(zone, state.facilities, fixture, state.currentDemoTime);
  const score = derivePriorityScore(zone, gap.score, fixture);
  return {
    id: zone.id,
    indoorAccess: deriveIndoorAccess(zone, state.facilities, fixture, state.currentDemoTime),
    mitigationState: deriveMitigationState(zone.id, state.tasks),
    accessGapScore: gap.score,
    accessGapFactors: gap.factors,
    priorityScore: score,
    priorityBand: derivePriorityBand(score, fixture),
  };
}

export function createInitialState(fixture) {
  return {
    schemaVersion: fixture.schemaVersion,
    fixtureVersion: fixture.fixtureVersion,
    currentDemoTime: fixture.operationalPeriod.startsAt,
    facilities: clone(fixture.facilities),
    tasks: clone(fixture.tasks),
    auditEvents: clone(fixture.auditEvents),
  };
}

function appendAuditOnce(state, event) {
  if (!state.auditEvents.some((existing) => existing.id === event.id)) {
    state.auditEvents.push(event);
  }
}

export function applyScenarioDisruption(state, fixture) {
  const scenario = fixture.scenario;
  const alreadyApplied =
    state.facilities.find((f) => f.id === scenario.coveringFacilityId)?.operationalStatus?.state ===
    scenario.disruption.newState;
  if (alreadyApplied && state.tasks.some((task) => task.id === scenario.taskDraft.id)) return state;

  const next = clone(state);
  const facility = next.facilities.find((item) => item.id === scenario.coveringFacilityId);
  if (!facility) throw new Error("Scenario covering facility missing");
  facility.operationalStatus = {
    ...facility.operationalStatus,
    state: scenario.disruption.newState,
    reason: scenario.disruption.reason,
    verificationMethod: scenario.disruption.verificationMethod,
    verifierRole: scenario.disruption.verifierRole,
    verifiedAt: scenario.disruption.at,
    expiresAt: scenario.disruption.expiresAt,
  };
  next.currentDemoTime = scenario.disruption.at;

  if (!next.tasks.some((task) => task.id === scenario.taskDraft.id)) {
    next.tasks.push(clone(scenario.taskDraft));
  }
  appendAuditOnce(next, {
    id: "audit-demo-facility-disruption",
    at: scenario.disruption.at,
    type: "facility_status_changed",
    summary: `${facility.name} marked temporarily unavailable in synthetic scenario.`,
    actorRole: scenario.disruption.verifierRole,
    authorityClass: "synthetic_demo",
  });
  return next;
}

const TRANSITIONS = {
  unassigned: { next: "assigned", at: "assignedAt", audit: "audit-demo-task-assigned" },
  assigned: { next: "in_progress", at: "inProgressAt", audit: "audit-demo-task-started" },
  in_progress: { next: "completed", at: "completedAt", audit: "audit-demo-task-completed" },
};

export function advanceScenarioTask(state, fixture) {
  const id = fixture.scenario.taskDraft.id;
  const current = state.tasks.find((task) => task.id === id);
  if (!current) throw new Error("Scenario task not created");
  const transition = TRANSITIONS[current.status];
  if (!transition) return state;

  const next = clone(state);
  const task = next.tasks.find((item) => item.id === id);
  const at = fixture.scenario.deterministicTaskTimes[transition.at];
  task.status = transition.next;
  task.ownerRole =
    task.ownerRole === "Unassigned" ? "Transportation duty coordinator" : task.ownerRole;
  task[transition.at] = at;
  next.currentDemoTime = at;
  appendAuditOnce(next, {
    id: transition.audit,
    at,
    type: `task_${transition.next}`,
    summary: `${task.title}: ${transition.next}.`,
    actorRole: task.ownerRole,
    authorityClass: "synthetic_demo",
  });
  return next;
}

export function startAndCompleteScenarioTask(state, fixture) {
  const id = fixture.scenario.taskDraft.id;
  const current = state.tasks.find((task) => task.id === id);
  if (!current) throw new Error("Scenario task not created");
  if (current.status === "completed") return state;
  if (current.status !== "assigned") {
    throw new Error(`Composite transport action requires assigned task; found ${current.status}`);
  }
  const started = advanceScenarioTask(state, fixture);
  return advanceScenarioTask(started, fixture);
}

export function buildAfterActionReport(pristineFixture, state) {
  const target = pristineFixture.zones.find(
    (zone) => zone.id === pristineFixture.scenario.targetZoneId,
  );
  const baselineState = createInitialState(pristineFixture);
  const initial = deriveZone(target, baselineState, pristineFixture);
  const current = deriveZone(target, state, pristineFixture);
  const destination = state.facilities.find(
    (f) => f.id === pristineFixture.scenario.alternateFacilityId,
  );
  return {
    reportClass: "synthetic_demo_after_action",
    fixtureVersion: pristineFixture.fixtureVersion,
    currentDemoTime: state.currentDemoTime,
    operationalPeriod: pristineFixture.operationalPeriod,
    initialTarget: initial,
    currentTarget: current,
    unresolved: {
      localIndoorAccess: current.indoorAccess !== "covered",
      dangerWindowAfterDestinationClose:
        instant(destination.operationalStatus.eventCloseAt) <
        instant(pristineFixture.operationalPeriod.dangerWindowEnd),
    },
    facilityState: state.facilities.find(
      (f) => f.id === pristineFixture.scenario.coveringFacilityId,
    ).operationalStatus.state,
    tasks: clone(state.tasks),
    auditEvents: clone(state.auditEvents).sort((a, b) => instant(a.at) - instant(b.at)),
    limitations: [
      "All event-time statuses and tasks are synthetic demonstration data.",
      "Transport completion does not restore local indoor access.",
      "The alternate destination closes before the synthetic danger window ends.",
    ],
  };
}

function runSelfTest() {
  const fixture = loadFixture();
  const target = fixture.zones.find((zone) => zone.id === fixture.scenario.targetZoneId);
  assert.ok(target, "target zone exists");

  const initial = createInitialState(fixture);
  assert.equal(
    initial.currentDemoTime,
    fixture.operationalPeriod.startsAt,
    "scenario clock starts at fixture start",
  );
  assert.deepEqual(
    deriveZone(target, initial, fixture),
    {
      id: target.id,
      indoorAccess: "covered",
      mitigationState: "none",
      accessGapScore: 0,
      accessGapFactors: {
        noQualifyingIndoorFacility: false,
        nearestClosesBeforeDangerEnd: false,
        capacityRisk: false,
        transitPoorOrUnknown: false,
        statusUnknownOrStale: false,
      },
      priorityScore: 73.1,
      priorityBand: "high",
    },
    "initial target transition",
  );

  const disrupted = applyScenarioDisruption(initial, fixture);
  const afterDisruption = deriveZone(target, disrupted, fixture);
  assert.equal(afterDisruption.indoorAccess, "uncovered");
  assert.equal(afterDisruption.accessGapScore, 65);
  assert.equal(afterDisruption.priorityScore, 86.1);
  assert.equal(afterDisruption.priorityBand, "critical");
  assert.equal(disrupted.tasks.length, 1);

  const disruptedTwice = applyScenarioDisruption(disrupted, fixture);
  assert.deepEqual(disruptedTwice, disrupted, "disruption action is idempotent");

  const assigned = advanceScenarioTask(disrupted, fixture);
  assert.equal(
    assigned.tasks.find((task) => task.id === fixture.scenario.taskDraft.id).status,
    "assigned",
  );
  const completed = startAndCompleteScenarioTask(assigned, fixture);
  const completedAgain = startAndCompleteScenarioTask(completed, fixture);
  assert.deepEqual(completedAgain, completed, "composite completed task action is idempotent");
  assert.throws(
    () => startAndCompleteScenarioTask(disrupted, fixture),
    /requires assigned task/,
    "composite action cannot skip assignment",
  );

  const finalZone = deriveZone(target, completed, fixture);
  assert.equal(finalZone.mitigationState, "transport_completed");
  assert.equal(finalZone.indoorAccess, "uncovered");
  assert.equal(finalZone.priorityScore, 86.1);
  assert.equal(
    completed.facilities.find((f) => f.id === fixture.scenario.coveringFacilityId).operationalStatus
      .state,
    "temporarily_unavailable",
  );

  const report = buildAfterActionReport(fixture, completed);
  assert.equal(
    report.initialTarget.priorityScore,
    73.1,
    "baseline is recomputed from pristine fixture",
  );
  assert.equal(report.currentTarget.priorityScore, 86.1);
  assert.equal(report.unresolved.localIndoorAccess, true);
  assert.equal(report.unresolved.dangerWindowAfterDestinationClose, true);
  assert.equal(
    new Set(report.auditEvents.map((event) => event.id)).size,
    report.auditEvents.length,
  );

  // A full nearby facility does not qualify for access, but its capacity state
  // remains visible in the structural gap factors.
  const fullState = clone(initial);
  fullState.facilities.find(
    (f) => f.id === fixture.scenario.coveringFacilityId,
  ).operationalStatus.capacity = "full";
  const fullGap = deriveAccessGap(target, fullState.facilities, fixture, fullState.currentDemoTime);
  assert.equal(
    deriveIndoorAccess(target, fullState.facilities, fixture, fullState.currentDemoTime),
    "uncovered",
  );
  assert.equal(fullGap.factors.capacityRisk, true);

  // Wall-clock independence: fixture freshness still uses synthetic scenario time.
  const syntheticResult = deriveZone(target, initial, fixture);
  assert.equal(syntheticResult.indoorAccess, "covered");

  // Event-hours correctness: freshness alone cannot keep a closed destination open.
  const afterHoursState = clone(initial);
  afterHoursState.currentDemoTime = "2026-07-19T18:10:00-05:00";
  const destination = afterHoursState.facilities.find(
    (facility) => facility.id === fixture.scenario.alternateFacilityId,
  );
  assert.equal(
    facilityHasVerifiedEventAvailability(destination, fixture, afterHoursState.currentDemoTime),
    true,
  );
  assert.equal(
    facilityIsVerifiedOpenNow(destination, fixture, afterHoursState.currentDemoTime),
    false,
  );

  console.log("SafeHeat dependency-free domain reference: PASS");
  console.log(
    JSON.stringify(
      {
        tests: 22,
        initialTarget: deriveZone(target, initial, fixture),
        disruptedTarget: afterDisruption,
        finalTarget: finalZone,
        unresolved: report.unresolved,
        finalDemoTime: completed.currentDemoTime,
      },
      null,
      2,
    ),
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runSelfTest();
}
