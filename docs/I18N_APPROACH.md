# Internationalization approach — SafeHeat

**Decided:** 2026-07-20
**Scope:** English and Spanish
**Implementation:** `src/features/i18n/`

## Decision

Use a **dependency-free typed dictionary plus React context**. Do not install
next-intl, react-i18next, LinguiJS, or any i18n framework.

## The finding that drove the decision

A string audit of the running app found the translation burden is overwhelmingly
in the **data**, not the UI:

| Location                             | Prose strings |
| ------------------------------------ | ------------: |
| `safeheat-dashboard.tsx` (UI chrome) |           ~20 |
| `demo_data.json` (fixture)           |           133 |

A UI-only i18n layer would translate the chrome and leave the majority of the
screen in English. Toggling to Spanish would look broken rather than bilingual —
worse than not offering the toggle at all, because it advertises a capability
the product does not have.

Of the 133 fixture strings, roughly 68 genuinely need translation. The rest are
proper nouns and identifiers that **must not** be translated:

- facility names (`Dottie Jordan Recreation Center`)
- street addresses
- dataset names and owners (`Austin Public Library Locations`, `City of Austin`)
- ISO timestamps and IDs

Translating those would make them impossible to match against official records —
an operator searching for a facility would not find it.

## Why not a framework

**next-intl** is the strongest option for Next.js generally, but it wants
`[locale]` route segments and middleware. SafeHeat is a single client-rendered
screen. Adopting it means restructuring routing the night before a timed build,
and it interacts badly with the static-export fallback documented in
`brainstorm/municipal/02-safeheat/LAUNCH_READINESS.md`.

**react-i18next** works without routing changes but adds a provider, a plugin
chain, and async resource loading for a bounded set of ~88 strings. The runtime
cost is not the problem; the integration surface is.

Two further constraints made a zero-dependency approach clearly correct:

1. **`npm install` is fragile on the build machine.** `.npmrc` sets
   `engine-strict=true` and `package.json` pins `node >=22 <23`, but the local
   runtime is Node 26. Every install fails with `EBADENGINE` unless overridden.
   Adding a dependency during the build hour is a real risk. See
   `LEARNING.md`.
2. **The one-shot prompt forbids i18n infrastructure** (§5) and asks only for key
   warning text in both languages. This implementation exceeds that requirement
   while honoring the constraint that produced it.

## Architecture

```text
src/features/i18n/
  dictionary.ts         UI chrome strings, typed. Missing key = compile error.
  data-translations.ts  Fixture prose, keyed by exact English source string.
  language-context.tsx  Provider, persistence, <html lang> sync.
  language-toggle.tsx   Top-right radiogroup control.
tests/unit/i18n.test.ts Enforces coverage of disclosures and reason labels.
```

### Two layers, two lookup styles

`t("demoAreas")` — UI chrome. Key-based, and `CopyKey` is derived from the
English dictionary, so adding an English key without a Spanish one fails
`tsc --noEmit`.

Note that `Copy` is `Record<CopyKey, string>`, **not** `typeof en`. Deriving it
from `typeof en` combined with `as const` makes every value a literal type and
forces each Spanish string to equal its English source — which is exactly the
compile error this implementation hit first time through.

`td(fixtureString)` — fixture prose. Keyed by the exact English source string, so
**no existing type, component, or fixture consumer has to change**. Unknown
strings fall back to the input, so partial coverage degrades to English rather
than to a crash or a `missing.key` placeholder on a projector.

### Accessibility

- The toggle is a `radiogroup` with `aria-checked`, not a single toggle button,
  so the current language is announced as state rather than inferred.
- Each option carries its own `lang` attribute so a screen reader pronounces
  "Español" in Spanish.
- `document.documentElement.lang` is kept in sync, which switches screen-reader
  voice and pronunciation for the whole page.
- Selection is conveyed by border, weight, and a checkmark — never color alone,
  per the project's existing accessibility rule.

### Persistence

Stored under `safeheat-austin-demo:lang:v1`, a **separate key** from the demo
state. Resetting the scenario must not flip the presenter back to English
mid-demo. The read happens in an effect rather than in `useState`'s initializer
so server and first client render match and hydration does not warn.

## Translation quality

Spanish was written for civic and emergency register, not literal translation:

- `Emergencia: llame al 9-1-1` matches standard US public-safety Spanish.
- `vulnerabilidad social` is the accepted rendering of CDC SVI.
- `refugio climatizado` / `acceso interior` avoid implying a shelter placement,
  which would be a meaningful accuracy error in a heat-response context.

**A native-speaker review is still required before any pilot.** These are
public-safety strings. Machine-adjacent translation is acceptable for a
conference demo and is not acceptable for residents in an actual heat event.
Do not describe the current state as professionally localized.

## Wiring notes (implemented 2026-07-20)

Two decisions worth preserving because they are easy to get wrong:

**Live-region messages store a key, not a string.** State holds `liveKey: CopyKey`
plus an optional `liveDetail` for values that are not dictionary entries (a zone
name, an export filename). Storing the _resolved_ string would freeze an
in-flight status message in whatever language was active when it fired, so
toggling mid-demo would leave a stale English announcement in the live region.

**The Spanish emergency instruction renders unconditionally.** It appears in its
own `lang="es"` paragraph in both languages. Gating it behind the toggle would
mean a Spanish-speaking resident in danger has to find and operate a language
control first. Safety text is not a localization feature.

## What is not covered yet

- Number, date, and percentage formatting still use `en-US` conventions. Use
  `Intl.NumberFormat(language)` and `Intl.DateTimeFormat(language)` when wiring
  the UI; the timezone must stay `America/Chicago` regardless of language.
- The after-action JSON export is English-only. That is defensible — it is an
  operational record, not a resident-facing artifact — but state it rather than
  leaving it ambiguous.
- Roughly 65 lower-priority fixture strings (source caveats, `fixtureUse`,
  verifier roles) are untranslated and will fall back to English.
