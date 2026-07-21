/**
 * SafeHeat UI string dictionary — English and Spanish.
 *
 * Deliberately dependency-free. See docs/I18N_APPROACH.md for why a framework
 * (next-intl, react-i18next) was rejected for this build.
 *
 * The `Copy` type is derived from the English dictionary, so adding an English
 * key without a Spanish translation is a compile-time error under strict TS.
 * That is the whole point: missing translations fail the build, not the demo.
 */

export const LANGUAGES = ["en", "es"] as const;
export type Language = (typeof LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: "English",
  es: "Español",
};

const en = {
  // Language control
  languageLabel: "Language",
  languageSwitchTo: "Cambiar a español",

  // Header and disclosure
  appName: "SafeHeat",
  demoBadge: "DEMO — synthetic operational scenario",
  locationLine: "Austin, Texas · America/Chicago",
  emergencyNotice: "Emergency: call 9-1-1 for immediate danger.",
  demoDataNotice: "Demo data.",
  officialInfoLink: "Official Austin emergency information",
  dangerWindow: "Danger window",
  resetDemo: "Reset demo",

  // Scorecard
  demoAreas: "Demo areas",
  verifiedOpenFacilities: "Verified-open indoor facilities",
  areasWithVerifiedAccess: "Areas with verified indoor access",
  uncoveredAreas: "Uncovered areas",
  areasWithTransportMitigation: "Areas with transport mitigation",
  unassignedCriticalTasks: "Unassigned critical tasks",

  // Ranked list columns
  areaName: "Area",
  priorityScore: "Priority score",
  priorityBand: "Band",
  heatPercentile: "Heat percentile",
  sviPercentile: "SVI percentile",
  accessGapScore: "Access gap",
  accessState: "Indoor access",
  mitigationState: "Mitigation",
  nextAction: "Next action",

  // Priority bands
  bandCritical: "Critical",
  bandHigh: "High",
  bandModerate: "Moderate",
  bandMonitor: "Monitor",
  bandIncomplete: "Incomplete",

  // Access states
  accessCovered: "Covered",
  accessUncovered: "Uncovered",
  accessUnknown: "Unknown",

  // Mitigation states
  mitigationNone: "No transport mitigation",
  mitigationTransportActive: "Transport mitigation active",
  mitigationTransportCompleted: "Transport completed",
  mitigationOutreachOnly: "Outreach only",

  // Facility status
  verifiedOpenNow: "Verified open now",
  doesNotQualifyNow: "Does not qualify now",
  syntheticCandidate: "Synthetic candidate",

  // Next actions
  assignMitigationOwner: "Assign mitigation owner",
  monitorVerifiedAccess: "Monitor verified access",
  trackUnresolvedGap: "Track unresolved gap",

  // Controls
  runDisruption: "Run demo: mark facility unavailable",
  assignTask: "Assign task",
  startAndCompleteTransport: "Start and complete transport",
  exportAfterAction: "Export after-action JSON",
  facilityDisruptionApplied: "Facility disruption applied",

  // Live-region messages
  liveDemoLoaded: "Demo loaded from bundled fixture.",
  liveDemoRestored: "Restored saved synthetic demo state.",
  liveDemoReset: "Demo reset. Select Northeast Austin demo area to begin.",
  liveDisruption:
    "Dottie Jordan Recreation Center marked temporarily unavailable. One critical transport task is ready for assignment.",
  liveTaskAssigned: "Transport task assigned to the transportation duty coordinator.",

  // Methodology drawer
  methodology: "Methodology and sources",
  scoreFormula: "priority = 0.45 × heat percentile + 0.35 × SVI percentile + 0.20 × access gap",
  placesContextOnly: "Community health context — not used in score",
  joinedOffline: "Block-group heat and tract-level SVI were joined offline, never in the browser.",
  noLiveStatus: "This application does not provide live official facility status.",

  // Situation context strip
  situationContextTitle: "Why an operational layer is needed",
  situationContextDisclosure:
    "Public and offline-derived values. Unlike operational status on this screen, these are not synthetic.",
} as const;

/**
 * Keys come from the English dictionary (so a missing key is a compile error),
 * but values are plain `string`. Deriving `Copy` as `typeof en` would make each
 * value a literal type and force every translation to equal its English source.
 */
export type CopyKey = keyof typeof en;
export type Copy = Record<CopyKey, string>;

/**
 * Spanish. Reviewed for civic/emergency register rather than literal translation:
 * - "Emergencia: llame al 9-1-1" matches standard US public-safety Spanish.
 * - "Vulnerabilidad social" is the accepted rendering of CDC SVI.
 * - "Refugio climatizado"/"acceso interior" avoid implying a shelter placement.
 * A native-speaker review is still recommended before any pilot. See docs/I18N_APPROACH.md.
 */
const es: Copy = {
  languageLabel: "Idioma",
  languageSwitchTo: "Switch to English",

  appName: "SafeHeat",
  demoBadge: "DEMOSTRACIÓN — escenario operativo sintético",
  locationLine: "Austin, Texas · América/Chicago",
  emergencyNotice: "Emergencia: llame al 9-1-1 si hay peligro inmediato.",
  demoDataNotice: "Datos de demostración.",
  officialInfoLink: "Información oficial de emergencias de Austin",
  dangerWindow: "Ventana de peligro",
  resetDemo: "Reiniciar demostración",

  demoAreas: "Áreas de demostración",
  verifiedOpenFacilities: "Instalaciones interiores verificadas como abiertas",
  areasWithVerifiedAccess: "Áreas con acceso interior verificado",
  uncoveredAreas: "Áreas sin cobertura",
  areasWithTransportMitigation: "Áreas con mitigación por transporte",
  unassignedCriticalTasks: "Tareas críticas sin asignar",

  areaName: "Área",
  priorityScore: "Puntuación de prioridad",
  priorityBand: "Categoría",
  heatPercentile: "Percentil de calor",
  sviPercentile: "Percentil de vulnerabilidad social",
  accessGapScore: "Brecha de acceso",
  accessState: "Acceso interior",
  mitigationState: "Mitigación",
  nextAction: "Próxima acción",

  bandCritical: "Crítica",
  bandHigh: "Alta",
  bandModerate: "Moderada",
  bandMonitor: "Vigilancia",
  bandIncomplete: "Incompleta",

  accessCovered: "Con cobertura",
  accessUncovered: "Sin cobertura",
  accessUnknown: "Desconocido",

  mitigationNone: "Sin mitigación por transporte",
  mitigationTransportActive: "Mitigación por transporte activa",
  mitigationTransportCompleted: "Transporte completado",
  mitigationOutreachOnly: "Solo acercamiento comunitario",

  verifiedOpenNow: "Verificado como abierto ahora",
  doesNotQualifyNow: "No califica en este momento",
  syntheticCandidate: "Candidato sintético",

  assignMitigationOwner: "Asignar responsable de mitigación",
  monitorVerifiedAccess: "Supervisar el acceso verificado",
  trackUnresolvedGap: "Dar seguimiento a la brecha no resuelta",

  runDisruption: "Demostración: marcar instalación como no disponible",
  assignTask: "Asignar tarea",
  startAndCompleteTransport: "Iniciar y completar el transporte",
  exportAfterAction: "Exportar informe posterior a la acción (JSON)",
  facilityDisruptionApplied: "Interrupción de la instalación aplicada",

  liveDemoLoaded: "Demostración cargada desde los datos incluidos.",
  liveDemoRestored: "Se restauró el estado sintético guardado.",
  liveDemoReset:
    "Demostración reiniciada. Seleccione el área de demostración del noreste de Austin para comenzar.",
  liveDisruption:
    "El Centro Recreativo Dottie Jordan se marcó como temporalmente no disponible. Hay una tarea crítica de transporte lista para asignar.",
  liveTaskAssigned: "Tarea de transporte asignada al coordinador de turno de transporte.",

  methodology: "Metodología y fuentes",
  scoreFormula:
    "prioridad = 0.45 × percentil de calor + 0.35 × percentil de vulnerabilidad social + 0.20 × brecha de acceso",
  placesContextOnly: "Contexto de salud comunitaria — no se usa en la puntuación",
  joinedOffline:
    "Los datos de calor por grupo de bloques y de vulnerabilidad social por sector censal se combinaron sin conexión, nunca en el navegador.",
  noLiveStatus:
    "Esta aplicación no proporciona el estado oficial en tiempo real de las instalaciones.",

  situationContextTitle: "Por qué se necesita una capa operativa",
  situationContextDisclosure:
    "Valores públicos y derivados sin conexión. A diferencia del estado operativo en esta pantalla, estos no son sintéticos.",
};

export const DICTIONARY: Record<Language, Copy> = { en, es };

export function isLanguage(value: unknown): value is Language {
  return typeof value === "string" && (LANGUAGES as readonly string[]).includes(value);
}
