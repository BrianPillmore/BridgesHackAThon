import {
  applyScenarioDisruption,
  assignScenarioTask,
  buildAfterActionReport,
  clone,
  createInitialState,
  deriveAccessGap,
  deriveIndoorAccess,
  derivePriorityBand,
  derivePriorityScore,
  deriveZone,
  facilityHasVerifiedEventAvailability,
  facilityIsVerifiedOpenNow,
  loadStoredState,
  startAndCompleteScenarioTask,
} from "@/features/safeheat/domain";
import { safeHeatFixture } from "@/features/safeheat/fixture";

function targetZone() {
  const zone = safeHeatFixture.zones.find(
    (item) => item.id === safeHeatFixture.scenario.targetZoneId,
  );

  if (!zone) throw new Error("Missing target zone");

  return zone;
}

describe("SafeHeat domain", () => {
  it("derives the exact initial target transition", () => {
    const state = createInitialState(safeHeatFixture);

    expect(deriveZone(targetZone(), state, safeHeatFixture)).toMatchObject({
      indoorAccess: "covered",
      mitigationState: "none",
      accessGapScore: 0,
      priorityScore: 73.1,
      priorityBand: "high",
    });
  });

  it("derives the exact post-disruption target transition", () => {
    const state = applyScenarioDisruption(createInitialState(safeHeatFixture), safeHeatFixture);

    expect(deriveZone(targetZone(), state, safeHeatFixture)).toMatchObject({
      indoorAccess: "uncovered",
      mitigationState: "none",
      accessGapScore: 65,
      priorityScore: 86.1,
      priorityBand: "critical",
    });
    expect(state.tasks).toHaveLength(1);
  });

  it("uses the weighted score formula and bands", () => {
    expect(derivePriorityScore(targetZone(), 65, safeHeatFixture)).toBe(86.1);
    expect(derivePriorityBand(86.1, safeHeatFixture)).toBe("critical");
    expect(derivePriorityBand(73.1, safeHeatFixture)).toBe("high");
  });

  it("returns incomplete when a score component is missing", () => {
    expect(
      derivePriorityScore({ heatPercentile: null, sviPercentile: 80 }, 40, safeHeatFixture),
    ).toBeNull();
    expect(derivePriorityBand(null, safeHeatFixture)).toBe("incomplete");
  });

  it("excludes stale or unknown facilities from verified access", () => {
    const state = createInitialState(safeHeatFixture);
    const facility = state.facilities.find(
      (item) => item.id === safeHeatFixture.scenario.coveringFacilityId,
    );

    if (!facility) throw new Error("Missing scenario facility");

    facility.operationalStatus.state = "unknown";
    facility.operationalStatus.verifiedAt = null;

    expect(
      deriveIndoorAccess(targetZone(), state.facilities, safeHeatFixture, state.currentDemoTime),
    ).toBe("uncovered");
  });

  it("excludes fresh records outside event hours", () => {
    const state = createInitialState(safeHeatFixture);
    const destination = state.facilities.find(
      (item) => item.id === safeHeatFixture.scenario.alternateFacilityId,
    );

    if (!destination) throw new Error("Missing destination facility");

    state.currentDemoTime = "2026-07-19T18:10:00-05:00";

    expect(
      facilityHasVerifiedEventAvailability(destination, safeHeatFixture, state.currentDemoTime),
    ).toBe(true);
    expect(facilityIsVerifiedOpenNow(destination, safeHeatFixture, state.currentDemoTime)).toBe(
      false,
    );
  });

  it("excludes full facilities from access while keeping capacity risk visible", () => {
    const state = createInitialState(safeHeatFixture);
    const facility = state.facilities.find(
      (item) => item.id === safeHeatFixture.scenario.coveringFacilityId,
    );

    if (!facility) throw new Error("Missing scenario facility");

    facility.operationalStatus.capacity = "full";

    const gap = deriveAccessGap(
      targetZone(),
      state.facilities,
      safeHeatFixture,
      state.currentDemoTime,
    );

    expect(
      deriveIndoorAccess(targetZone(), state.facilities, safeHeatFixture, state.currentDemoTime),
    ).toBe("uncovered");
    expect(gap.factors.capacityRisk).toBe(true);
  });

  it("keeps transport mitigation separate from local indoor access", () => {
    const disrupted = applyScenarioDisruption(createInitialState(safeHeatFixture), safeHeatFixture);
    const assigned = assignScenarioTask(disrupted, safeHeatFixture);
    const completed = startAndCompleteScenarioTask(assigned, safeHeatFixture);

    expect(deriveZone(targetZone(), completed, safeHeatFixture)).toMatchObject({
      mitigationState: "transport_completed",
      indoorAccess: "uncovered",
      priorityScore: 86.1,
    });
    expect(
      completed.facilities.find((item) => item.id === safeHeatFixture.scenario.coveringFacilityId)
        ?.operationalStatus.state,
    ).toBe("temporarily_unavailable");
  });

  it("keeps disruption and completed task actions idempotent", () => {
    const disrupted = applyScenarioDisruption(createInitialState(safeHeatFixture), safeHeatFixture);
    const disruptedAgain = applyScenarioDisruption(disrupted, safeHeatFixture);
    const completed = startAndCompleteScenarioTask(
      assignScenarioTask(disrupted, safeHeatFixture),
      safeHeatFixture,
    );
    const completedAgain = startAndCompleteScenarioTask(completed, safeHeatFixture);

    expect(disruptedAgain).toEqual(disrupted);
    expect(completedAgain).toEqual(completed);
    expect(new Set(completed.auditEvents.map((event) => event.id)).size).toBe(
      completed.auditEvents.length,
    );
  });

  it("reset creates a deterministic initial state independent of wall clock", () => {
    const state = createInitialState(safeHeatFixture);

    expect(state.currentDemoTime).toBe(safeHeatFixture.operationalPeriod.startsAt);
    expect(deriveZone(targetZone(), state, safeHeatFixture).indoorAccess).toBe("covered");
  });

  it("rejects invalid or mismatched stored state", () => {
    expect(
      loadStoredState(safeHeatFixture, {
        getItem: () => JSON.stringify({ fixtureVersion: "old" }),
      }),
    ).toBeNull();
  });

  it("builds an after-action report from pristine baseline and current state", () => {
    const completed = startAndCompleteScenarioTask(
      assignScenarioTask(
        applyScenarioDisruption(createInitialState(safeHeatFixture), safeHeatFixture),
        safeHeatFixture,
      ),
      safeHeatFixture,
    );
    const report = buildAfterActionReport(safeHeatFixture, completed);

    expect(report.initialTarget.priorityScore).toBe(73.1);
    expect(report.currentTarget.priorityScore).toBe(86.1);
    expect(report.unresolved.localIndoorAccess).toBe(true);
    expect(report.unresolved.dangerWindowAfterDestinationClose).toBe(true);
    expect(report.elapsedDemoMinutes).toBe(98);
  });

  it("protects the source fixture when states are cloned and mutated", () => {
    const state = clone(createInitialState(safeHeatFixture));

    state.facilities[0].operationalStatus.state = "temporarily_unavailable";

    expect(safeHeatFixture.facilities[0].operationalStatus.state).toBe("open");
  });
});
