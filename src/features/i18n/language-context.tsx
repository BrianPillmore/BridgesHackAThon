"use client";

/**
 * Language provider for SafeHeat.
 *
 * Dependency-free by design — see docs/I18N_APPROACH.md. Persists the choice in
 * localStorage under its own key so it survives a demo reset (resetting the
 * scenario should not silently flip the presenter back to English mid-demo).
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { DICTIONARY, isLanguage, type Copy, type CopyKey, type Language } from "./dictionary";
import { translateData } from "./data-translations";

const LANGUAGE_STORAGE_KEY = "safeheat-austin-demo:lang:v1";

type LanguageContextValue = {
  language: Language;
  setLanguage: (next: Language) => void;
  toggleLanguage: () => void;
  /** UI chrome strings. Compile-time checked key. */
  t: (key: CopyKey) => string;
  /** Fixture-sourced prose. Falls back to the English input when untranslated. */
  td: (value: string) => string;
  copy: Copy;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  children,
  initialLanguage = "en",
}: {
  children: ReactNode;
  initialLanguage?: Language;
}) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  // Read persisted choice after mount. Doing this in an effect rather than in
  // useState's initializer keeps server and first client render identical, which
  // avoids a hydration mismatch.
  useEffect(() => {
    try {
      const stored = window.localStorage?.getItem(LANGUAGE_STORAGE_KEY);
      if (isLanguage(stored)) setLanguageState(stored);
    } catch {
      // localStorage unavailable (private mode, embedded webview). English is fine.
    }
  }, []);

  // Keep <html lang> in sync so screen readers switch voice and pronunciation.
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    try {
      window.localStorage?.setItem(LANGUAGE_STORAGE_KEY, next);
    } catch {
      // Non-fatal: the toggle still works for this session.
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "en" ? "es" : "en");
  }, [language, setLanguage]);

  const value = useMemo<LanguageContextValue>(() => {
    const copy = DICTIONARY[language];
    return {
      language,
      setLanguage,
      toggleLanguage,
      t: (key: CopyKey) => copy[key],
      td: (raw: string) => translateData(raw, language),
      copy,
    };
  }, [language, setLanguage, toggleLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside a LanguageProvider");
  }
  return context;
}
