import { describe, expect, it } from "vitest";

import { DICTIONARY, LANGUAGES, isLanguage } from "@/features/i18n/dictionary";
import { SPANISH_DATA_KEYS, translateData } from "@/features/i18n/data-translations";
import fixture from "../../brainstorm/municipal/02-safeheat/data/processed/demo_data.json";

describe("i18n dictionary", () => {
  it("defines every UI key in every language", () => {
    const englishKeys = Object.keys(DICTIONARY.en).sort();
    for (const language of LANGUAGES) {
      expect(Object.keys(DICTIONARY[language]).sort()).toEqual(englishKeys);
    }
  });

  it("has no untranslated Spanish UI strings", () => {
    // A Spanish value identical to English usually means a forgotten translation.
    // Proper nouns and identifiers are the legitimate exceptions.
    const allowedIdentical = new Set(["appName"]);
    const identical = Object.entries(DICTIONARY.es)
      .filter(([key, value]) => value === DICTIONARY.en[key as keyof typeof DICTIONARY.en])
      .map(([key]) => key)
      .filter((key) => !allowedIdentical.has(key));
    expect(identical).toEqual([]);
  });

  it("validates language codes", () => {
    expect(isLanguage("es")).toBe(true);
    expect(isLanguage("fr")).toBe(false);
    expect(isLanguage(null)).toBe(false);
  });
});

describe("fixture data translation", () => {
  it("returns the input unchanged for English", () => {
    expect(translateData("No resident-level data are included.", "en")).toBe(
      "No resident-level data are included.",
    );
  });

  it("falls back to English rather than failing on an unknown string", () => {
    expect(translateData("a string nobody translated", "es")).toBe("a string nobody translated");
  });

  it("translates every top-level disclosure", () => {
    // Disclosures are the safety-critical strings. Partial coverage here would
    // leave a Spanish-speaking viewer reading English legal and emergency text.
    for (const disclosure of fixture.disclosures) {
      expect(translateData(disclosure, "es"), `untranslated disclosure: ${disclosure}`).not.toBe(
        disclosure,
      );
    }
  });

  it("translates every zone reason label", () => {
    const labels = new Set(fixture.zones.flatMap((zone) => zone.reasonLabels));
    for (const label of labels) {
      expect(translateData(label, "es"), `untranslated reason label: ${label}`).not.toBe(label);
    }
  });

  it("translates every facility demo disclosure", () => {
    const disclosures = new Set(fixture.facilities.map((facility) => facility.demoDisclosure));
    for (const disclosure of disclosures) {
      expect(
        translateData(disclosure, "es"),
        `untranslated facility disclosure: ${disclosure}`,
      ).not.toBe(disclosure);
    }
  });

  it("has meaningful Spanish data coverage", () => {
    expect(SPANISH_DATA_KEYS.length).toBeGreaterThanOrEqual(25);
  });
});
