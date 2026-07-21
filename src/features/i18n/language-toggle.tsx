"use client";

/**
 * Language toggle for the top-right of the operations screen.
 *
 * Rendered as a radiogroup rather than a single toggle button so that the
 * current language is announced as a state, not inferred from a label. Both
 * options are always visible, which matters on a projector where a presenter
 * needs to see the choice at a glance.
 */

import { LANGUAGES, LANGUAGE_LABELS, type Language } from "./dictionary";
import { useLanguage } from "./language-context";

export function LanguageToggle({ className }: { className?: string }) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div
      role="radiogroup"
      aria-label={t("languageLabel")}
      className={className}
      style={{ display: "inline-flex", gap: "0.25rem" }}
    >
      {LANGUAGES.map((code: Language) => {
        const selected = code === language;
        return (
          <button
            key={code}
            type="button"
            role="radio"
            aria-checked={selected}
            lang={code}
            onClick={() => setLanguage(code)}
            style={{
              padding: "0.35rem 0.75rem",
              borderRadius: "0.375rem",
              cursor: "pointer",
              // Selection is conveyed by aria-checked, border, and weight —
              // never by color alone.
              border: selected ? "2px solid currentColor" : "1px solid rgba(0,0,0,0.35)",
              fontWeight: selected ? 700 : 400,
            }}
          >
            {LANGUAGE_LABELS[code]}
            {selected ? <span aria-hidden="true"> ✓</span> : null}
          </button>
        );
      })}
    </div>
  );
}
