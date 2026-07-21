"use client";

import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ClipboardList,
  Download,
  Info,
  RotateCcw,
  ShieldAlert,
  Truck,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  applyScenarioDisruption,
  assignScenarioTask,
  buildAfterActionReport,
  createInitialState,
  deriveAllZones,
  deriveMetrics,
  deriveZone,
  factorLabel,
  facilityIsVerifiedOpenNow,
  formatLocalTime,
  getScenarioTask,
  getSource,
  loadStoredState,
  startAndCompleteScenarioTask,
  statusLabel,
  STORAGE_KEY,
} from "./domain";
import { safeHeatFixture } from "./fixture";
import { DistrictMap } from "./district-map";
import type { DemoState, Facility, Zone } from "./types";
import { publicFacilityInventory } from "./public-inventory";
import { LanguageProvider, useLanguage } from "@/features/i18n/language-context";
import { LanguageToggle } from "@/features/i18n/language-toggle";
import type { CopyKey } from "@/features/i18n/dictionary";

const afterActionFilename = "heatsafe-austin-demo-after-action.json";

const mitigationKeyByState: Record<string, CopyKey> = {
  none: "mitigationNone",
  transport_active: "mitigationTransportActive",
  transport_completed: "mitigationTransportCompleted",
  outreach_only: "mitigationOutreachOnly",
};

const bandKeyByBand: Record<string, CopyKey> = {
  critical: "bandCritical",
  high: "bandHigh",
  moderate: "bandModerate",
  monitor: "bandMonitor",
  incomplete: "bandIncomplete",
};

const accessKeyByState: Record<string, CopyKey> = {
  covered: "accessCovered",
  uncovered: "accessUncovered",
  unknown: "accessUnknown",
};

const badgeClassByBand = {
  critical: "border-red-300 bg-red-50 text-red-900",
  high: "border-amber-300 bg-amber-50 text-amber-950",
  moderate: "border-sky-300 bg-sky-50 text-sky-900",
  monitor: "border-emerald-300 bg-emerald-50 text-emerald-900",
  incomplete: "border-slate-300 bg-slate-50 text-slate-700",
};

const accessClassByState = {
  covered: "border-emerald-300 bg-emerald-50 text-emerald-900",
  uncovered: "border-red-300 bg-red-50 text-red-900",
  unknown: "border-slate-300 bg-slate-50 text-slate-700",
};

function metricItems(state: DemoState) {
  const metrics = deriveMetrics(state, safeHeatFixture);

  return [
    ["demoAreas", metrics.demoAreas],
    ["verifiedOpenFacilities", metrics.verifiedOpenIndoorFacilities],
    ["areasWithVerifiedAccess", metrics.areasWithVerifiedIndoorAccess],
    ["uncoveredAreas", metrics.uncoveredAreas],
    ["areasWithTransportMitigation", metrics.areasWithTransportMitigation],
    ["unassignedCriticalTasks", metrics.unassignedCriticalTasks],
  ] as const satisfies ReadonlyArray<readonly [CopyKey, number]>;
}

function getRelatedFacilities(zone: Zone, state: DemoState) {
  return zone.relationships
    .map((relationship) => ({
      relationship,
      facility: state.facilities.find((facility) => facility.id === relationship.facilityId),
    }))
    .filter((item): item is { relationship: Zone["relationships"][number]; facility: Facility } =>
      Boolean(item.facility),
    )
    .sort((a, b) => a.relationship.distanceMilesApprox - b.relationship.distanceMilesApprox);
}

function inventoryTypeLabel(type: string) {
  return statusLabel(type).replace("county community center", "county community center");
}

export function SafeHeatDashboard() {
  return (
    <LanguageProvider>
      <SafeHeatDashboardInner />
    </LanguageProvider>
  );
}

function SafeHeatDashboardInner() {
  const fixture = safeHeatFixture;
  const { t, td } = useLanguage();
  const [state, setState] = useState<DemoState>(() => createInitialState(fixture));
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  // Live-region text is stored as a dictionary KEY, not a rendered string, so an
  // in-flight status message re-renders in the new language when the user
  // switches. Storing the resolved string would freeze it in the old language.
  const [liveKey, setLiveKey] = useState<CopyKey>("liveDemoLoaded");
  const [liveDetail, setLiveDetail] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const exportLinkRef = useRef<HTMLAnchorElement | null>(null);

  const liveMessage = liveDetail ?? t(liveKey);

  function announce(key: CopyKey) {
    setLiveKey(key);
    setLiveDetail(null);
  }

  function scoreLabel(score: number | null) {
    return score == null ? t("bandIncomplete") : score.toFixed(1);
  }

  useEffect(() => {
    const storage = window.localStorage;
    const stored = storage ? loadStoredState(fixture, storage) : null;

    if (stored) {
      setState(stored);
      setLiveKey("liveDemoRestored");
      setLiveDetail(null);
    }

    setHydrated(true);
  }, [fixture]);

  useEffect(() => {
    if (!hydrated || !window.localStorage) return;

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  const rankedZones = useMemo(() => deriveAllZones(state, fixture), [fixture, state]);
  const selectedZone = selectedZoneId
    ? fixture.zones.find((zone) => zone.id === selectedZoneId)
    : null;
  const selectedDerived = selectedZone ? deriveZone(selectedZone, state, fixture) : null;
  const relatedFacilities = selectedZone ? getRelatedFacilities(selectedZone, state) : [];
  const scenarioTask = getScenarioTask(state, fixture);
  const scenarioFacility = state.facilities.find(
    (facility) => facility.id === fixture.scenario.coveringFacilityId,
  );
  const disruptionApplied =
    scenarioFacility?.operationalStatus.state === fixture.scenario.disruption.newState;

  function resetDemo() {
    setState(createInitialState(fixture));
    setSelectedZoneId(null);
    window.localStorage?.removeItem(STORAGE_KEY);
    announce("liveDemoReset");
  }

  function runDisruption() {
    setState((current) => applyScenarioDisruption(current, fixture));
    announce("liveDisruption");
  }

  function assignTask() {
    setState((current) => assignScenarioTask(current, fixture));
    announce("liveTaskAssigned");
  }

  function startAndCompleteTask() {
    setState((current) => startAndCompleteScenarioTask(current, fixture));
    // Completion wording comes from the fixture so the exact rehearsed sentence
    // is preserved; td() supplies the Spanish rendering of that same sentence.
    setLiveDetail(td(fixture.scenario.completionMessage));
  }

  function exportReport() {
    const report = buildAfterActionReport(fixture, state);
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    if (exportLinkRef.current) {
      exportLinkRef.current.href = url;
      exportLinkRef.current.download = afterActionFilename;
      exportLinkRef.current.click();
    }

    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setLiveDetail(`${t("exportAfterAction")}: ${afterActionFilename}`);
  }

  return (
    <main className="min-h-screen bg-stone-50 text-slate-950">
      <a className="skip-link" href="#main-content">
        Skip to SafeHeat operations
      </a>
      <div aria-live="polite" className="sr-only">
        {liveMessage}
      </div>

      <section className="border-b border-slate-200 bg-white" id="main-content">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold">{t("appName")}</h1>
                <span className="rounded border border-red-300 bg-red-50 px-2 py-1 text-sm font-semibold text-red-900">
                  {t("demoBadge")}
                </span>
              </div>
              <p className="mt-2 max-w-3xl text-base leading-7 text-slate-700">
                {t("locationLine")} · {fixture.operationalPeriod.title}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <LanguageToggle />
              <a
                className="inline-flex min-h-11 items-center gap-2 rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950"
                href="/api/health"
              >
                <CheckCircle2 aria-hidden="true" size={18} />
                Health
              </a>
              <button
                className="inline-flex min-h-11 items-center gap-2 rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950"
                onClick={resetDemo}
                type="button"
              >
                <RotateCcw aria-hidden="true" size={18} />
                {t("resetDemo")}
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
              <div className="flex gap-3">
                <ShieldAlert aria-hidden="true" className="mt-1 text-amber-900" size={22} />
                <div>
                  <h2 className="font-semibold text-amber-950">
                    {td(fixture.operationalPeriod.warning.headline)}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-amber-950">
                    {t("dangerWindow")}:{" "}
                    {formatLocalTime(fixture.operationalPeriod.dangerWindowStart)} –{" "}
                    {formatLocalTime(fixture.operationalPeriod.dangerWindowEnd)}.{" "}
                    {td(fixture.operationalPeriod.warning.description)}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-red-300 bg-red-50 p-4">
              <div className="flex gap-3">
                <AlertTriangle aria-hidden="true" className="mt-1 text-red-900" size={22} />
                <div>
                  {/* Emergency text stays bilingual regardless of the selected
                      language. A resident in danger must not have to find the
                      toggle first. */}
                  <h2 className="font-semibold text-red-950">Emergency / Emergencia</h2>
                  <p className="mt-1 text-sm leading-6 text-red-950">
                    {t("emergencyNotice")} {t("demoDataNotice")}{" "}
                    <a
                      className="font-semibold underline underline-offset-2"
                      href="https://www.austintexas.gov/emergency-management/active-emergency-information-hub"
                    >
                      {t("officialInfoLink")}
                    </a>
                  </p>
                  <p className="mt-1 text-sm leading-6 text-red-950" lang="es">
                    Emergencia: llame al 9-1-1 si hay peligro inmediato. Datos de demostración.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {fixture.situationContext ? (
            <section className="mt-5 rounded-lg border border-sky-200 bg-sky-50 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-sky-950">
                    {t("situationContextTitle")}
                  </h2>
                  <p className="mt-1 max-w-3xl text-sm leading-6 text-sky-950">
                    {t("situationContextDisclosure")} Retrieved{" "}
                    {fixture.situationContext.retrievedDate}.
                  </p>
                </div>
                <span className="inline-flex w-fit rounded border border-sky-300 bg-white px-2 py-1 text-xs font-semibold uppercase tracking-normal text-sky-950">
                  Public / derived
                </span>
              </div>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {fixture.situationContext.measures.map((measure) => (
                  <div className="rounded-lg border border-sky-200 bg-white p-3" key={measure.id}>
                    <dt className="text-sm leading-5 text-slate-700">{td(measure.label)}</dt>
                    <dd className="mt-2 text-2xl font-bold text-slate-950">{measure.display}</dd>
                    <dd className="mt-2 text-xs leading-5 text-slate-600">
                      <a
                        className="font-semibold underline underline-offset-2"
                        href={measure.sourceUrl}
                      >
                        {measure.source}
                      </a>{" "}
                      · {measure.owner}
                    </dd>
                    <dd className="mt-1 text-xs leading-5 text-slate-600">
                      {measure.attribution ? `${measure.attribution}. ` : ""}
                      {measure.caveat}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-800">
            Status: {liveMessage}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <h2 className="text-lg font-semibold">Operational scorecard</h2>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {metricItems(state).map(([labelKey, value]) => (
            <div className="rounded-lg border border-slate-200 bg-white p-4" key={labelKey}>
              <dt className="text-sm leading-5 text-slate-600">{t(labelKey)}</dt>
              <dd className="mt-2 text-3xl font-bold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 pb-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-4">
            <h2 className="text-xl font-semibold">Ranked area list</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              The table is the authoritative accessible view. Scores are demo review aids, not
              official policy decisions.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="border-b border-slate-200 px-3 py-3 font-semibold" scope="col">
                    {t("areaName")}
                  </th>
                  <th className="border-b border-slate-200 px-3 py-3 font-semibold" scope="col">
                    {t("priorityScore")}
                  </th>
                  <th className="border-b border-slate-200 px-3 py-3 font-semibold" scope="col">
                    {t("heatPercentile")}
                  </th>
                  <th className="border-b border-slate-200 px-3 py-3 font-semibold" scope="col">
                    {t("sviPercentile")}
                  </th>
                  <th className="border-b border-slate-200 px-3 py-3 font-semibold" scope="col">
                    {t("accessGapScore")}
                  </th>
                  <th className="border-b border-slate-200 px-3 py-3 font-semibold" scope="col">
                    {t("accessState")}
                  </th>
                  <th className="border-b border-slate-200 px-3 py-3 font-semibold" scope="col">
                    {t("mitigationState")}
                  </th>
                  <th className="border-b border-slate-200 px-3 py-3 font-semibold" scope="col">
                    {t("nextAction")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rankedZones.map(({ zone, derived }) => {
                  const isSelected = selectedZoneId === zone.id;

                  return (
                    <tr className={isSelected ? "bg-sky-50" : undefined} key={zone.id}>
                      <td className="border-b border-slate-200 px-3 py-3">
                        <button
                          className="min-h-11 text-left font-semibold text-slate-950 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950"
                          onClick={() => {
                            setSelectedZoneId(zone.id);
                            setLiveDetail(zone.name);
                          }}
                          type="button"
                        >
                          {zone.name}
                        </button>
                      </td>
                      <td className="border-b border-slate-200 px-3 py-3">
                        <span
                          className={`inline-flex rounded border px-2 py-1 font-semibold ${badgeClassByBand[derived.priorityBand]}`}
                        >
                          {scoreLabel(derived.priorityScore)} ·{" "}
                          {t(bandKeyByBand[derived.priorityBand])}
                        </span>
                      </td>
                      <td className="border-b border-slate-200 px-3 py-3">
                        {zone.heatPercentile ?? "—"}
                      </td>
                      <td className="border-b border-slate-200 px-3 py-3">
                        {zone.sviPercentile ?? "—"}
                      </td>
                      <td className="border-b border-slate-200 px-3 py-3">
                        {derived.accessGapScore}
                      </td>
                      <td className="border-b border-slate-200 px-3 py-3">
                        <span
                          className={`inline-flex rounded border px-2 py-1 font-semibold ${accessClassByState[derived.indoorAccess]}`}
                        >
                          {t(accessKeyByState[derived.indoorAccess])}
                        </span>
                      </td>
                      <td className="border-b border-slate-200 px-3 py-3">
                        {t(mitigationKeyByState[derived.mitigationState])}
                      </td>
                      <td className="border-b border-slate-200 px-3 py-3">
                        {derived.indoorAccess === "covered"
                          ? t("monitorVerifiedAccess")
                          : derived.mitigationState === "none"
                            ? t("assignMitigationOwner")
                            : t("trackUnresolvedGap")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-5">
          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-xl font-semibold">Austin council districts and facilities</h2>
            <p className="mt-1 mb-3 text-sm leading-6 text-slate-600">
              Offline schematic. No basemap and no network request.
            </p>
            <DistrictMap
              facilities={state.facilities}
              fixture={fixture}
              currentDemoTime={state.currentDemoTime}
              highlightFacilityId={fixture.scenario.coveringFacilityId}
            />
          </section>

          <aside className="rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-200 p-4">
              <h2 className="text-xl font-semibold">Selected-area detail</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Reset leaves this empty so the first demo control is selecting the target row.
              </p>
            </div>

            {!selectedZone || !selectedDerived ? (
              <div className="p-6 text-sm leading-6 text-slate-700">
                No area selected. Choose <strong>Northeast Austin demo area</strong> from the ranked
                list to start the five-control path.
              </div>
            ) : (
              <div className="space-y-5 p-4">
                <section>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-2xl font-bold">{selectedZone.name}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {td(selectedZone.geographyDisclosure)}
                      </p>
                    </div>
                    <span
                      className={`rounded border px-2 py-1 text-sm font-semibold ${badgeClassByBand[selectedDerived.priorityBand]}`}
                    >
                      {scoreLabel(selectedDerived.priorityScore)} ·{" "}
                      {t(bandKeyByBand[selectedDerived.priorityBand])}
                    </span>
                  </div>
                  <dl className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <dt className="text-sm text-slate-600">{t("heatPercentile")}</dt>
                      <dd className="mt-1 text-2xl font-bold">{selectedZone.heatPercentile}</dd>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <dt className="text-sm text-slate-600">{t("sviPercentile")}</dt>
                      <dd className="mt-1 text-2xl font-bold">{selectedZone.sviPercentile}</dd>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <dt className="text-sm text-slate-600">{t("accessGapScore")}</dt>
                      <dd className="mt-1 text-2xl font-bold">{selectedDerived.accessGapScore}</dd>
                    </div>
                  </dl>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{t("scoreFormula")}</p>
                  <ul className="mt-3 list-inside list-disc text-sm leading-6 text-slate-700">
                    {selectedZone.reasonLabels.map((reason) => (
                      <li key={reason}>{td(reason)}</li>
                    ))}
                  </ul>
                </section>

                <section className="rounded-lg border border-slate-200 p-4">
                  <h3 className="flex items-center gap-2 font-semibold">
                    <Info aria-hidden="true" size={18} />
                    Current access and mitigation
                  </h3>
                  <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm text-slate-600">{t("accessState")}</dt>
                      <dd className="mt-1 font-semibold">
                        {t(accessKeyByState[selectedDerived.indoorAccess])}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-slate-600">{t("mitigationState")}</dt>
                      <dd className="mt-1 font-semibold">
                        {t(mitigationKeyByState[selectedDerived.mitigationState])}
                      </dd>
                    </div>
                  </dl>
                  <ul className="mt-3 list-inside list-disc text-sm leading-6 text-slate-700">
                    {Object.entries(selectedDerived.accessGapFactors)
                      .filter(([, active]) => active)
                      .map(([name]) => (
                        <li key={name}>
                          {factorLabel(name as keyof typeof selectedDerived.accessGapFactors)}
                        </li>
                      ))}
                    {Object.values(selectedDerived.accessGapFactors).every((active) => !active) ? (
                      <li>
                        No structural access-gap factor is active at the current scenario time.
                      </li>
                    ) : null}
                  </ul>
                </section>

                <section className="rounded-lg border border-slate-200 p-4">
                  <h3 className="font-semibold">{t("placesContextOnly")}</h3>
                  <dl className="mt-3 grid gap-3 sm:grid-cols-3">
                    <div>
                      <dt className="text-sm text-slate-600">Asthma prevalence</dt>
                      <dd className="font-semibold">
                        {selectedZone.healthContext.asthmaCrudePrevalence}%
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-slate-600">Disability prevalence</dt>
                      <dd className="font-semibold">
                        {selectedZone.healthContext.disabilityCrudePrevalence}%
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-slate-600">Transportation gap</dt>
                      <dd className="font-semibold">
                        {selectedZone.healthContext.lackReliableTransportationCrudePrevalence}%
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    CDC PLACES-style values are area-level context only and excluded from the score.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold">Relevant facilities</h3>
                  <div className="mt-3 space-y-3">
                    {relatedFacilities.map(({ facility, relationship }) => {
                      const source = getSource(fixture, facility.inventory.sourceId);
                      const verifiedOpen = facilityIsVerifiedOpenNow(
                        facility,
                        fixture,
                        state.currentDemoTime,
                      );

                      return (
                        <article
                          className="rounded-lg border border-slate-200 p-4"
                          key={facility.id}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <h4 className="font-semibold">{facility.name}</h4>
                              <p className="mt-1 text-sm text-slate-600">
                                {statusLabel(facility.type)} · {relationship.distanceMilesApprox} mi
                                ·{" "}
                                {relationship.withinIndoorAccessThreshold
                                  ? "inside local threshold"
                                  : "outside local threshold"}
                              </p>
                            </div>
                            <span
                              className={`rounded border px-2 py-1 text-sm font-semibold ${
                                verifiedOpen
                                  ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                                  : "border-slate-300 bg-slate-50 text-slate-800"
                              }`}
                            >
                              {verifiedOpen ? t("verifiedOpenNow") : t("doesNotQualifyNow")}
                            </span>
                          </div>
                          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                            <div>
                              <dt className="text-slate-600">Synthetic status</dt>
                              <dd className="font-medium">
                                {statusLabel(facility.operationalStatus.state)} · capacity{" "}
                                {statusLabel(facility.operationalStatus.capacity)}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-slate-600">Verified</dt>
                              <dd className="font-medium">
                                {formatLocalTime(facility.operationalStatus.verifiedAt)}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-slate-600">Event hours</dt>
                              <dd className="font-medium">
                                {formatLocalTime(facility.operationalStatus.eventOpenAt)} to{" "}
                                {formatLocalTime(facility.operationalStatus.eventCloseAt)}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-slate-600">Source</dt>
                              <dd className="font-medium">
                                {source ? (
                                  <a className="underline underline-offset-2" href={source.url}>
                                    {source.name}
                                  </a>
                                ) : (
                                  t("syntheticCandidate")
                                )}
                              </dd>
                            </div>
                          </dl>
                          <p className="mt-3 text-sm leading-6 text-slate-600">
                            {td(facility.demoDisclosure)}
                          </p>
                        </article>
                      );
                    })}
                  </div>
                </section>

                {selectedZone.id === fixture.scenario.targetZoneId ? (
                  <section className="rounded-lg border border-slate-300 bg-slate-50 p-4">
                    <h3 className="flex items-center gap-2 font-semibold">
                      <Truck aria-hidden="true" size={18} />
                      Demo controls
                    </h3>
                    <div className="mt-4 grid gap-3">
                      <button
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 disabled:cursor-not-allowed disabled:bg-slate-400"
                        disabled={disruptionApplied}
                        onClick={runDisruption}
                        type="button"
                      >
                        <AlertTriangle aria-hidden="true" size={18} />
                        {disruptionApplied ? t("facilityDisruptionApplied") : t("runDisruption")}
                      </button>
                      <button
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 disabled:cursor-not-allowed disabled:bg-slate-400"
                        disabled={!scenarioTask || scenarioTask.status !== "unassigned"}
                        onClick={assignTask}
                        type="button"
                      >
                        <ClipboardList aria-hidden="true" size={18} />
                        {t("assignTask")}
                      </button>
                      <button
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 disabled:cursor-not-allowed disabled:bg-slate-400"
                        disabled={!scenarioTask || scenarioTask.status !== "assigned"}
                        onClick={startAndCompleteTask}
                        type="button"
                      >
                        <Truck aria-hidden="true" size={18} />
                        {t("startAndCompleteTransport")}
                      </button>
                      <button
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded border border-slate-400 bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950"
                        onClick={exportReport}
                        type="button"
                      >
                        <Download aria-hidden="true" size={18} />
                        {t("exportAfterAction")}
                      </button>
                      <a className="hidden" ref={exportLinkRef}>
                        Download after-action JSON
                      </a>
                    </div>
                  </section>
                ) : null}

                <section className="rounded-lg border border-slate-200 p-4">
                  <h3 className="font-semibold">Task and audit timeline</h3>
                  {scenarioTask ? (
                    <dl className="mt-3 grid gap-2 text-sm">
                      <div>
                        <dt className="text-slate-600">Task</dt>
                        <dd className="font-medium">{scenarioTask.title}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-600">Owner</dt>
                        <dd className="font-medium">{scenarioTask.ownerRole}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-600">Status</dt>
                        <dd className="font-medium">{statusLabel(scenarioTask.status)}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-600">Scope</dt>
                        <dd className="font-medium">{scenarioTask.scope}</dd>
                      </div>
                    </dl>
                  ) : (
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      No mitigation task exists until the synthetic facility disruption runs.
                    </p>
                  )}
                  <ol className="mt-4 space-y-3">
                    {state.auditEvents
                      .slice()
                      .sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
                      .map((event) => (
                        <li
                          className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                          key={event.id}
                        >
                          <p className="text-sm font-semibold">{formatLocalTime(event.at)}</p>
                          <p className="mt-1 text-sm leading-6 text-slate-700">{event.summary}</p>
                          <p className="mt-1 text-xs text-slate-600">
                            {event.actorRole} · {statusLabel(event.authorityClass)}
                          </p>
                        </li>
                      ))}
                  </ol>
                </section>
              </div>
            )}
          </aside>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <details className="mb-4 rounded-lg border border-slate-200 p-4">
            <summary className="cursor-pointer text-lg font-semibold">
              Public Austin-area facility inventory snapshot
            </summary>
            <div className="mt-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-4xl">
                  <p className="text-sm leading-6 text-slate-700">
                    {publicFacilityInventory.recordCount} public inventory records from complete
                    reviewed snapshots dated {publicFacilityInventory.snapshotDate}.{" "}
                    {publicFacilityInventory.disclosure}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    These rows help Austin coordinators see the inventory universe; only records
                    with separate synthetic event-time verification count in the operational
                    scorecard above.
                  </p>
                </div>
                <Building2
                  aria-hidden="true"
                  className="hidden text-slate-500 lg:block"
                  size={28}
                />
              </div>
              <dl className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {Object.entries(publicFacilityInventory.countsByType).map(([type, count]) => (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3" key={type}>
                    <dt className="text-sm text-slate-600">{inventoryTypeLabel(type)}</dt>
                    <dd className="mt-1 text-2xl font-bold">{count}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-4 max-h-96 overflow-auto rounded-lg border border-slate-200">
                <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
                  <thead className="sticky top-0 bg-slate-100 text-slate-700">
                    <tr>
                      <th className="border-b border-slate-200 px-3 py-3 font-semibold" scope="col">
                        Facility
                      </th>
                      <th className="border-b border-slate-200 px-3 py-3 font-semibold" scope="col">
                        Type
                      </th>
                      <th className="border-b border-slate-200 px-3 py-3 font-semibold" scope="col">
                        Address
                      </th>
                      <th className="border-b border-slate-200 px-3 py-3 font-semibold" scope="col">
                        Source
                      </th>
                      <th className="border-b border-slate-200 px-3 py-3 font-semibold" scope="col">
                        Caveat
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {publicFacilityInventory.records.map((record) => (
                      <tr key={record.id}>
                        <td className="border-b border-slate-200 px-3 py-3 font-semibold">
                          {record.publicUrl ? (
                            <a className="underline underline-offset-2" href={record.publicUrl}>
                              {record.name}
                            </a>
                          ) : (
                            record.name
                          )}
                        </td>
                        <td className="border-b border-slate-200 px-3 py-3">
                          {inventoryTypeLabel(record.type)}
                        </td>
                        <td className="border-b border-slate-200 px-3 py-3">{record.address}</td>
                        <td className="border-b border-slate-200 px-3 py-3">
                          <a className="underline underline-offset-2" href={record.sourceUrl}>
                            {record.sourceName}
                          </a>
                        </td>
                        <td className="border-b border-slate-200 px-3 py-3 text-slate-700">
                          {record.warning}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </details>
          <details className="rounded-lg border border-slate-200 p-4">
            <summary className="cursor-pointer text-lg font-semibold">{t("methodology")}</summary>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="text-sm leading-6 text-slate-700">
                <p>
                  Priority formula: {fixture.methodology.priorityFormula}. PLACES is contextual, not
                  scored. Block-group heat and tract-level SVI/PLACES were joined offline; no
                  runtime browser join or public-data request is performed.
                </p>
                <p className="mt-3">{fixture.methodology.distanceNote}</p>
                <p className="mt-3">
                  Public facility inventory names and source links are shown for context. Event-time
                  statuses, hours, capacity, tasks, and audit events are synthetic demo values and
                  do not provide live official status.
                </p>
              </div>
              <ul className="grid gap-2 text-sm leading-6 text-slate-700">
                {fixture.sources.slice(0, 6).map((source) => (
                  <li key={source.id}>
                    <a className="font-semibold underline underline-offset-2" href={source.url}>
                      {source.name}
                    </a>{" "}
                    · {source.sourceDate} · {source.caveat}
                  </li>
                ))}
              </ul>
            </div>
          </details>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Current scenario clock: {formatLocalTime(state.currentDemoTime)}. Fixture version{" "}
            {fixture.fixtureVersion}. No resident-level data is collected or stored.
          </p>
        </div>
      </section>
    </main>
  );
}
