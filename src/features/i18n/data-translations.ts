/**
 * Translation memory for fixture prose.
 *
 * WHY THIS EXISTS
 * ---------------
 * Roughly 133 prose strings live in demo_data.json versus about 20 in the
 * dashboard component. A UI-only i18n layer would translate the chrome and
 * leave the majority of the screen in English — which reads as broken, not
 * bilingual. This module translates the fixture-sourced strings.
 *
 * Keyed by the exact English source string so that no existing type, component,
 * or fixture consumer has to change. `translateData()` falls back to the input,
 * so an untranslated string degrades to English rather than to a missing-key
 * placeholder or a crash.
 *
 * DELIBERATELY NOT TRANSLATED (proper nouns / identifiers):
 *   - facility names (Dottie Jordan Recreation Center)
 *   - street addresses
 *   - dataset names and owners (Austin Public Library Locations, City of Austin)
 *   - ISO timestamps and IDs
 * Translating those would make them impossible to match against official records.
 */

import type { Language } from "./dictionary";

const es: Record<string, string> = {
  // ---- disclosures ----
  "Synthetic operational scenario for conference demonstration; not an official City of Austin system.":
    "Escenario operativo sintético para una demostración de conferencia; no es un sistema oficial de la Ciudad de Austin.",
  "Facility names and locations may derive from public inventory, but all event-time statuses, hours, capacity, tasks, area scores, and relationships are synthetic unless explicitly labeled otherwise.":
    "Los nombres y las ubicaciones de las instalaciones pueden provenir de inventarios públicos, pero todos los estados durante el evento, los horarios, la capacidad, las tareas, las puntuaciones de área y las relaciones son sintéticos, salvo que se indique lo contrario.",
  "Emergency / Emergencia: call 9-1-1 for immediate danger. Use official Austin alerts for current public information.":
    "Emergencia: llame al 9-1-1 si hay peligro inmediato. Consulte las alertas oficiales de Austin para obtener información pública actualizada.",
  "No resident-level data are included.": "No se incluyen datos a nivel de residente.",

  // ---- zone reason labels ----
  "Very high historical heat-disparity percentile":
    "Percentil histórico de disparidad de calor muy alto",
  "High heat-disparity percentile": "Percentil de disparidad de calor alto",
  "Elevated heat-disparity percentile": "Percentil de disparidad de calor elevado",
  "Moderate historical heat-disparity percentile":
    "Percentil histórico de disparidad de calor moderado",
  "Very high social-vulnerability percentile": "Percentil de vulnerabilidad social muy alto",
  "High social-vulnerability percentile": "Percentil de vulnerabilidad social alto",
  "High area-level social-vulnerability percentile":
    "Percentil de vulnerabilidad social alto a nivel de área",
  "Lower relative social-vulnerability percentile in the demo fixture":
    "Percentil de vulnerabilidad social relativamente más bajo en los datos de demostración",
  "Nearest verified site closes before danger window ends":
    "El sitio verificado más cercano cierra antes de que termine la ventana de peligro",
  "One verified nearby indoor facility at scenario start":
    "Una instalación interior verificada cercana al inicio del escenario",
  "Verified facility has synthetic limited-capacity flag":
    "La instalación verificada tiene un indicador sintético de capacidad limitada",
  "Verified indoor facility through danger window":
    "Instalación interior verificada durante toda la ventana de peligro",

  // ---- geography disclosures ----
  "Synthetic conference operations area; not an official boundary.":
    "Área operativa sintética para la conferencia; no es un límite oficial.",
  "Synthetic conference operations area; not an official neighborhood or response boundary.":
    "Área operativa sintética para la conferencia; no es un barrio ni un límite oficial de respuesta.",

  // ---- facility demo disclosures ----
  "Event status and hours are synthetic.":
    "El estado durante el evento y los horarios son sintéticos.",
  "Event status, hours, and capacity are synthetic.":
    "El estado durante el evento, los horarios y la capacidad son sintéticos.",
  "Name/location derive from public inventory. Event status is synthetic.":
    "El nombre y la ubicación provienen de inventarios públicos. El estado durante el evento es sintético.",
  "Name/location derive from public inventory. Event status and hours are synthetic.":
    "El nombre y la ubicación provienen de inventarios públicos. El estado durante el evento y los horarios son sintéticos.",
  "Displayed as an aquatic amenity; never qualifies as indoor cooling access.":
    "Se muestra como instalación acuática; nunca cuenta como acceso a refugio climatizado interior.",
  "Candidate class only; does not count as cooling access.":
    "Solo categoría de candidato; no cuenta como acceso a refugio climatizado.",
  "No emergency participation agreement or current activation is implied.":
    "No se implica ningún acuerdo de participación en emergencias ni activación vigente.",

  // ---- situation context measure labels ----
  "Block groups with no cooling center within 1 mile":
    "Grupos de bloques sin ningún centro de enfriamiento a menos de 1 milla",
  "Block groups both hotter than +3 F above city average and uncovered at 1 mile":
    "Grupos de bloques que superan en +3 °F el promedio de la ciudad y no tienen cobertura a 1 milla",
  "NWS heat watches, warnings, and advisories per year, Travis County":
    "Avisos, alertas y advertencias de calor del Servicio Meteorológico Nacional por año, condado de Travis",
  "Austin 311 request categories for cooling or heat relief":
    "Categorías de solicitudes del 311 de Austin para enfriamiento o alivio del calor",

  // ---- completion / mitigation wording ----
  "Transport mitigation completed; local indoor-access gap remains.":
    "Mitigación por transporte completada; la brecha de acceso interior local persiste.",
};

const TABLES: Record<Language, Record<string, string>> = { en: {}, es };

/**
 * Translate a fixture-sourced string. Falls back to the original English when no
 * translation exists, so partial coverage degrades gracefully.
 */
export function translateData(value: string, language: Language): string {
  if (language === "en") return value;
  return TABLES[language][value] ?? value;
}

/** Coverage reporting, used by tests and the i18n audit script. */
export function translationCoverage(language: Language): number {
  return Object.keys(TABLES[language]).length;
}

export const SPANISH_DATA_KEYS = Object.keys(es);
