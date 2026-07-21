import type {
  AccessGapFactors,
  AfterActionReport,
  AuditEvent,
  DemoState,
  DerivedZone,
  Facility,
  FacilityRelationship,
  Fixture,
  Metrics,
  PriorityBand,
  Task,
  TaskStatus,
  Zone,
} from "./types";

export const STORAGE_KEY = "safeheat-austin-demo:v2";

export function clone<T>(value: T): T {
  return structuredClone(value);
}

export function instant(value: string): number {
  const milliseconds = Date.parse(value);

  if (!Number.isFinite(milliseconds)) {
    throw new Error(`Invalid ISO timestamp: ${value}`);
  }

  return milliseconds;
}

export function formatLocalTime(value: string | null | undefined): string {
  if (!value) return "Not verified";

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(value));
}

export function minutesBetween(start: string, end: string): number {
  return Math.round((instant(end) - instant(start)) / 60000);
}

export function isFresh(status: Facility["operationalStatus"], currentDemoTime: string): boolean {
  if (!status.verifiedAt || !status.expiresAt) return false;

  const now = instant(currentDemoTime);

  return instant(status.verifiedAt) <= now && now < instant(status.expiresAt);
}

export function facilityHasVerifiedEventRecord(
  facility: Facility | undefined,
  fixture: Fixture,
  currentDemoTime: string,
): boolean {
  if (!facility?.eligibleIndoorCooling) return false;
  if (facility.reliefClass !== "public_indoor_cooling_capable") return false;

  const status = facility.operationalStatus;

  if (!["open", "extended_hours"].includes(status.state)) return false;
  if (status.authorityClass !== "synthetic_demo") return false;
  if (!isFresh(status, currentDemoTime)) return false;
  if (!status.eventOpenAt || !status.eventCloseAt) return false;

  return (
    instant(status.eventOpenAt) < instant(fixture.operationalPeriod.dangerWindowEnd) &&
    instant(status.eventCloseAt) > instant(fixture.operationalPeriod.dangerWindowStart)
  );
}

export function facilityHasVerifiedEventAvailability(
  facility: Facility | undefined,
  fixture: Fixture,
  currentDemoTime: string,
): boolean {
  return (
    facilityHasVerifiedEventRecord(facility, fixture, currentDemoTime) &&
    facility?.operationalStatus.capacity !== "full"
  );
}

export function facilityIsVerifiedOpenNow(
  facility: Facility | undefined,
  fixture: Fixture,
  currentDemoTime: string,
): boolean {
  if (!facilityHasVerifiedEventAvailability(facility, fixture, currentDemoTime)) return false;
  if (!facility) return false;

  const status = facility.operationalStatus;
  const now = instant(currentDemoTime);

  return Boolean(
    status.eventOpenAt &&
    status.eventCloseAt &&
    instant(status.eventOpenAt) <= now &&
    now < instant(status.eventCloseAt),
  );
}

export function facilityQualifiesForLocalIndoorAccess(
  facility: Facility | undefined,
  relationship: FacilityRelationship | undefined,
  fixture: Fixture,
  currentDemoTime: string,
): boolean {
  return Boolean(
    relationship?.withinIndoorAccessThreshold &&
    facilityIsVerifiedOpenNow(facility, fixture, currentDemoTime),
  );
}

function byId<T extends { id: string }>(items: T[]): Map<string, T> {
  return new Map(items.map((item) => [item.id, item]));
}

export function deriveIndoorAccess(
  zone: Zone,
  facilities: Facility[],
  fixture: Fixture,
  currentDemoTime: string,
): "covered" | "uncovered" {
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

export function deriveAccessGap(
  zone: Zone,
  facilities: Facility[],
  fixture: Fixture,
  currentDemoTime: string,
): { score: number; factors: AccessGapFactors } {
  const facilitiesById = byId(facilities);
  const verifiedEventRecords: Array<{ facility: Facility; relationship: FacilityRelationship }> =
    [];
  let qualifyingCount = 0;

  for (const relationship of zone.relationships) {
    const facility = facilitiesById.get(relationship.facilityId);

    if (!facility) {
      throw new Error(`Unknown facility ${relationship.facilityId}`);
    }

    if (facilityQualifiesForLocalIndoorAccess(facility, relationship, fixture, currentDemoTime)) {
      qualifyingCount += 1;
    }

    if (facilityHasVerifiedEventRecord(facility, fixture, currentDemoTime)) {
      verifiedEventRecords.push({ facility, relationship });
    }
  }

  const factors: AccessGapFactors = {
    noQualifyingIndoorFacility: qualifyingCount === 0,
    nearestClosesBeforeDangerEnd: Boolean(
      zone.baseAccessFactors.nearestQualifyingClosesBeforeDangerEnd,
    ),
    capacityRisk: Boolean(zone.baseAccessFactors.capacityRisk),
    transitPoorOrUnknown: Boolean(zone.baseAccessFactors.transitPoorOrUnknown),
    statusUnknownOrStale: Boolean(zone.baseAccessFactors.relevantStatusUnknownOrStale),
  };

  verifiedEventRecords.sort(
    (a, b) => a.relationship.distanceMilesApprox - b.relationship.distanceMilesApprox,
  );

  if (verifiedEventRecords.length > 0) {
    const nearestStatus = verifiedEventRecords[0].facility.operationalStatus;

    factors.nearestClosesBeforeDangerEnd ||=
      Boolean(nearestStatus.eventCloseAt) &&
      instant(nearestStatus.eventCloseAt as string) <
        instant(fixture.operationalPeriod.dangerWindowEnd);
    factors.capacityRisk ||= ["limited", "full", "unknown"].includes(nearestStatus.capacity);
  }

  const score = Object.entries(factors)
    .filter(([, active]) => active)
    .reduce(
      (total, [name]) =>
        total + Number(fixture.methodology.accessGapPoints[name as keyof AccessGapFactors]),
      0,
    );

  return {
    score: Math.max(0, Math.min(100, score)),
    factors,
  };
}

export function derivePriorityScore(
  zone: Pick<Zone, "heatPercentile" | "sviPercentile">,
  accessGapScore: number | null,
  fixture: Fixture,
): number | null {
  if ([zone.heatPercentile, zone.sviPercentile, accessGapScore].some((value) => value == null)) {
    return null;
  }

  const weights = fixture.methodology.weights;
  const value =
    Number(zone.heatPercentile) * weights.heatPercentile +
    Number(zone.sviPercentile) * weights.sviPercentile +
    Number(accessGapScore) * weights.accessGapScore;

  return Math.round(value * 10) / 10;
}

export function derivePriorityBand(score: number | null, fixture: Fixture): PriorityBand {
  if (score == null) return "incomplete";

  const bands = fixture.methodology.bands;

  if (score >= bands.criticalMin) return "critical";
  if (score >= bands.highMin) return "high";
  if (score >= bands.moderateMin) return "moderate";

  return "monitor";
}

export function deriveMitigationState(zoneId: string, tasks: Task[]) {
  const relevantTasks = tasks.filter(
    (task) => task.zoneId === zoneId && task.type === "transport_to_verified_site",
  );

  if (relevantTasks.some((task) => task.status === "completed")) return "transport_completed";
  if (relevantTasks.some((task) => ["assigned", "in_progress"].includes(task.status))) {
    return "transport_active";
  }

  return "none";
}

export function deriveZone(zone: Zone, state: DemoState, fixture: Fixture): DerivedZone {
  const accessGap = deriveAccessGap(zone, state.facilities, fixture, state.currentDemoTime);
  const priorityScore = derivePriorityScore(zone, accessGap.score, fixture);

  return {
    id: zone.id,
    indoorAccess: deriveIndoorAccess(zone, state.facilities, fixture, state.currentDemoTime),
    mitigationState: deriveMitigationState(zone.id, state.tasks),
    accessGapScore: accessGap.score,
    accessGapFactors: accessGap.factors,
    priorityScore,
    priorityBand: derivePriorityBand(priorityScore, fixture),
  };
}

export function deriveAllZones(state: DemoState, fixture: Fixture) {
  return fixture.zones
    .map((zone) => ({
      zone,
      derived: deriveZone(zone, state, fixture),
    }))
    .sort((a, b) => {
      const scoreA = a.derived.priorityScore ?? -1;
      const scoreB = b.derived.priorityScore ?? -1;

      return scoreB - scoreA;
    });
}

export function createInitialState(fixture: Fixture): DemoState {
  return {
    schemaVersion: fixture.schemaVersion,
    fixtureVersion: fixture.fixtureVersion,
    currentDemoTime: fixture.operationalPeriod.startsAt,
    facilities: clone(fixture.facilities),
    tasks: clone(fixture.tasks),
    auditEvents: clone(fixture.auditEvents),
  };
}

function appendAuditOnce(events: AuditEvent[], event: AuditEvent) {
  if (!events.some((existing) => existing.id === event.id)) {
    events.push(event);
  }
}

export function applyScenarioDisruption(state: DemoState, fixture: Fixture): DemoState {
  const scenario = fixture.scenario;
  const currentFacility = state.facilities.find((item) => item.id === scenario.coveringFacilityId);
  const alreadyApplied =
    currentFacility?.operationalStatus.state === scenario.disruption.newState &&
    state.tasks.some((task) => task.id === scenario.taskDraft.id);

  if (alreadyApplied) return state;

  const next = clone(state);
  const facility = next.facilities.find((item) => item.id === scenario.coveringFacilityId);

  if (!facility) {
    throw new Error("Scenario covering facility missing");
  }

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

  appendAuditOnce(next.auditEvents, {
    id: "audit-demo-facility-disruption",
    at: scenario.disruption.at,
    type: "facility_status_changed",
    summary: `${facility.name} marked temporarily unavailable in synthetic scenario.`,
    actorRole: scenario.disruption.verifierRole,
    authorityClass: "synthetic_demo",
  });

  return next;
}

const taskTransition: Record<
  Exclude<TaskStatus, "cancelled" | "completed">,
  { next: TaskStatus; atKey: "assignedAt" | "inProgressAt"; auditId: string; type: string }
> = {
  unassigned: {
    next: "assigned",
    atKey: "assignedAt",
    auditId: "audit-demo-task-assigned",
    type: "task_assigned",
  },
  assigned: {
    next: "in_progress",
    atKey: "inProgressAt",
    auditId: "audit-demo-task-started",
    type: "task_in_progress",
  },
  in_progress: {
    next: "completed",
    atKey: "inProgressAt",
    auditId: "audit-demo-task-completed",
    type: "task_completed",
  },
};

export function assignScenarioTask(state: DemoState, fixture: Fixture): DemoState {
  return advanceScenarioTask(state, fixture, "unassigned");
}

function advanceScenarioTask(
  state: DemoState,
  fixture: Fixture,
  expectedStatus?: TaskStatus,
): DemoState {
  const taskId = fixture.scenario.taskDraft.id;
  const currentTask = state.tasks.find((task) => task.id === taskId);

  if (!currentTask) {
    throw new Error("Scenario task not created");
  }

  if (expectedStatus && currentTask.status !== expectedStatus) {
    return state;
  }

  if (currentTask.status === "completed" || currentTask.status === "cancelled") {
    return state;
  }

  const transition = taskTransition[currentTask.status];
  const next = clone(state);
  const task = next.tasks.find((item) => item.id === taskId);

  if (!task) {
    throw new Error("Scenario task not found after clone");
  }

  const at =
    transition.next === "completed"
      ? fixture.scenario.deterministicTaskTimes.completedAt
      : fixture.scenario.deterministicTaskTimes[transition.atKey];

  task.status = transition.next;
  task.ownerRole =
    task.ownerRole === "Unassigned" ? "Transportation duty coordinator" : task.ownerRole;

  if (transition.next === "assigned") task.assignedAt = at;
  if (transition.next === "in_progress") task.inProgressAt = at;
  if (transition.next === "completed") task.completedAt = at;

  next.currentDemoTime = at;
  appendAuditOnce(next.auditEvents, {
    id: transition.auditId,
    at,
    type: transition.type,
    summary: `${task.title}: ${transition.next}.`,
    actorRole: task.ownerRole,
    authorityClass: "synthetic_demo",
  });

  return next;
}

export function startAndCompleteScenarioTask(state: DemoState, fixture: Fixture): DemoState {
  const taskId = fixture.scenario.taskDraft.id;
  const currentTask = state.tasks.find((task) => task.id === taskId);

  if (!currentTask) {
    throw new Error("Scenario task not created");
  }

  if (currentTask.status === "completed") return state;

  if (currentTask.status !== "assigned") {
    throw new Error(
      `Composite transport action requires assigned task; found ${currentTask.status}`,
    );
  }

  const next = clone(state);
  const task = next.tasks.find((item) => item.id === taskId);

  if (!task) {
    throw new Error("Scenario task not found after clone");
  }

  const startedAt = fixture.scenario.deterministicTaskTimes.inProgressAt;
  const completedAt = fixture.scenario.deterministicTaskTimes.completedAt;

  task.status = "completed";
  task.ownerRole =
    task.ownerRole === "Unassigned" ? "Transportation duty coordinator" : task.ownerRole;
  task.inProgressAt = startedAt;
  task.completedAt = completedAt;
  next.currentDemoTime = completedAt;

  appendAuditOnce(next.auditEvents, {
    id: "audit-demo-task-started",
    at: startedAt,
    type: "task_in_progress",
    summary: `${task.title}: in_progress.`,
    actorRole: task.ownerRole,
    authorityClass: "synthetic_demo",
  });
  appendAuditOnce(next.auditEvents, {
    id: "audit-demo-task-completed",
    at: completedAt,
    type: "task_completed",
    summary: `${task.title}: completed.`,
    actorRole: task.ownerRole,
    authorityClass: "synthetic_demo",
  });

  return next;
}

export function getScenarioTask(state: DemoState, fixture: Fixture): Task | undefined {
  return state.tasks.find((task) => task.id === fixture.scenario.taskDraft.id);
}

export function getSource(fixture: Fixture, sourceId: string | null | undefined) {
  return fixture.sources.find((source) => source.id === sourceId);
}

export function deriveMetrics(state: DemoState, fixture: Fixture): Metrics {
  const zones = fixture.zones.map((zone) => deriveZone(zone, state, fixture));

  return {
    demoAreas: fixture.zones.length,
    verifiedOpenIndoorFacilities: state.facilities.filter((facility) =>
      facilityIsVerifiedOpenNow(facility, fixture, state.currentDemoTime),
    ).length,
    areasWithVerifiedIndoorAccess: zones.filter((zone) => zone.indoorAccess === "covered").length,
    uncoveredAreas: zones.filter((zone) => zone.indoorAccess === "uncovered").length,
    areasWithTransportMitigation: zones.filter((zone) =>
      ["transport_active", "transport_completed"].includes(zone.mitigationState),
    ).length,
    unassignedCriticalTasks: state.tasks.filter(
      (task) => task.priority === "critical" && task.status === "unassigned",
    ).length,
  };
}

export function loadStoredState(
  fixture: Fixture,
  storage: Pick<Storage, "getItem">,
): DemoState | null {
  const raw = storage.getItem(STORAGE_KEY);

  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<DemoState>;

    if (
      parsed.schemaVersion !== fixture.schemaVersion ||
      parsed.fixtureVersion !== fixture.fixtureVersion ||
      !parsed.currentDemoTime ||
      !Array.isArray(parsed.facilities) ||
      !Array.isArray(parsed.tasks) ||
      !Array.isArray(parsed.auditEvents)
    ) {
      return null;
    }

    return parsed as DemoState;
  } catch {
    return null;
  }
}

export function buildAfterActionReport(
  pristineFixture: Fixture,
  state: DemoState,
): AfterActionReport {
  const targetZone = pristineFixture.zones.find(
    (zone) => zone.id === pristineFixture.scenario.targetZoneId,
  );
  const facility = state.facilities.find(
    (item) => item.id === pristineFixture.scenario.coveringFacilityId,
  );
  const destination = state.facilities.find(
    (item) => item.id === pristineFixture.scenario.alternateFacilityId,
  );

  if (!targetZone || !facility || !destination) {
    throw new Error("Scenario report target is incomplete");
  }

  const baselineState = createInitialState(pristineFixture);
  const initialTarget = deriveZone(targetZone, baselineState, pristineFixture);
  const currentTarget = deriveZone(targetZone, state, pristineFixture);
  const elapsedDemoMinutes = minutesBetween(
    pristineFixture.operationalPeriod.startsAt,
    state.currentDemoTime,
  );

  return {
    reportClass: "synthetic_demo_after_action",
    syntheticDisclosure: pristineFixture.disclosures,
    fixtureVersion: pristineFixture.fixtureVersion,
    generatedAtWallClock: new Date().toISOString(),
    currentDemoTime: state.currentDemoTime,
    elapsedDemoMinutes,
    operationalPeriod: pristineFixture.operationalPeriod,
    initialMetrics: deriveMetrics(baselineState, pristineFixture),
    currentMetrics: deriveMetrics(state, pristineFixture),
    initialTarget,
    currentTarget,
    facilityChange: {
      facilityId: facility.id,
      name: facility.name,
      state: facility.operationalStatus.state,
      reason: facility.operationalStatus.reason,
    },
    taskTransitions: clone(state.tasks),
    unresolved: {
      localIndoorAccess: currentTarget.indoorAccess !== "covered",
      dangerWindowAfterDestinationClose: Boolean(
        destination.operationalStatus.eventCloseAt &&
        instant(destination.operationalStatus.eventCloseAt) <
          instant(pristineFixture.operationalPeriod.dangerWindowEnd),
      ),
      statement: pristineFixture.scenario.completionMessage,
    },
    auditEvents: clone(state.auditEvents).sort((a, b) => instant(a.at) - instant(b.at)),
    methodology: {
      priorityFormula: pristineFixture.methodology.priorityFormula,
      healthContextScoreUse: pristineFixture.methodology.healthContextScoreUse,
      geographicJoinNote: pristineFixture.methodology.geographicJoinNote,
      distanceNote: pristineFixture.methodology.distanceNote,
    },
    dataSources: clone(pristineFixture.sources),
    limitations: [
      "All event-time statuses and tasks are synthetic demonstration data.",
      "Transport completion does not restore local indoor access.",
      "The alternate destination closes before the synthetic danger window ends.",
      "Facility inventory does not establish current availability.",
      "Priority score is a transparent demo review aid, not an official policy or automated allocation decision.",
    ],
  };
}

export function factorLabel(name: keyof AccessGapFactors): string {
  const labels: Record<keyof AccessGapFactors, string> = {
    noQualifyingIndoorFacility: "No qualifying indoor facility within the local threshold",
    nearestClosesBeforeDangerEnd: "Nearest relevant verified site closes before danger window end",
    capacityRisk: "Nearest relevant verified site has limited, full, or unknown capacity",
    transitPoorOrUnknown: "Transit access is poor or unknown",
    statusUnknownOrStale: "Relevant status is unknown or stale",
  };

  return labels[name];
}

export function statusLabel(value: string): string {
  return value.replaceAll("_", " ");
}
