# SafeHeat — demo reframing: turn the prior art into the setup

**Date:** 2026-07-20
**Status:** proposed change to the opening of `DEMO_SCRIPT.md`. The five controls do not change.

## Why reframe

Discovery on 2026-07-20 found that the City of Austin already publishes `Cooling_Centers_Census_Block_Groups`: 789 block groups — a GEOID set byte-identical to the heat-disparity layer — already joined with heat difference, ACS elderly/disability, tree canopy, shade, Tree Equity Score, and **precomputed cooling-center counts within 0.5 and 1.0 miles**.

That is the City's own version of SafeHeat's access-gap score.

If a knowledgeable Austin attendee sees SafeHeat's ranked list cold, the natural reaction is _"we already have this."_ The current script opens on the ranked list and the score formula, which is exactly the overlapping surface.

The fix is not to hide the overlap. It is to **open on it**, credit it, and use it to define the boundary of what published data can and cannot do. The City's data becomes the setup for the gap rather than a competing claim.

## The three-act arc

### Act 1 — "Austin already knows where the risk is" (~45 seconds)

Lead with the City's own numbers, presented as strength, not as SafeHeat's output.

> Austin has genuinely good heat data. The City publishes a block-group layer that already joins land-surface heat disparity, elderly and disability population, tree canopy, and how many cooling centers sit within a half mile and within a mile. It is real planning infrastructure.

Then the numbers, all derived from the City's published layer:

- **66%** of block groups (522 of 789) have no cooling center within a half mile.
- **45%** (355 of 789) have none within a mile.
- **107** block groups are both hotter than +3 °F above the city average **and** have no cooling center within a mile.

> So the siting question is largely answered. Austin knows where the gaps are.

This is a credibility move. You are demonstrably current on the City's own work and you are not claiming to have invented the analysis.

### Act 2 — "But planning data is not operational truth" (~60 seconds)

This is the pivot, and it rests on three verified facts.

**Fact 1 — this is a recurring operational event, not a hypothetical.**

Austin/Travis County was under an NWS heat watch, warning, or advisory an average of **10.9 times per year** across 2016-2025 (109 products). The range is extreme: **1** product in 2021, **41** in 2023 (25 of them Extreme Heat Warnings). A system used once a decade is a research project; one used ten-plus times a year is operations.

**Fact 2 — residents have no channel to report a cooling need.**

Austin 311 carries **2.5 million service requests** and is updated daily. Grouping every request type returns **no heat-relief or cooling category at all**. The closest matches are street lights, trees in the right-of-way, debris, and water-waste violations.

> There are two and a half million 311 records and not one category for "I need somewhere cool to go" or "the cooling center on my corner is closed." The demand signal is not weak. It does not exist. There is nowhere to put it.

This is the strongest single line in the deck. It is a verified absence, and absence of a reporting channel is exactly the gap an operational layer fills.

**Fact 3 — no published feed carries event-time status.**

Every relevant City ArcGIS service is read-only (`capabilities=Query`, no Create/Update/Delete). Open Now's administrative `status` field distinguishes open, permanently closed, and temporarily inactive — it does not establish whether a site is staffed, cooled, and accepting people at 4 p.m. today.

> The City can tell you where a cooling center should be. Nothing published tells you whether one is open right now, who owns the problem when it closes, or what happened afterward.

### Act 3 — the existing five-control demo (unchanged)

Run the current script exactly as written. It now lands as the answer to a question the audience has already accepted, rather than as an unprompted claim.

The existing closing line becomes stronger:

> The reusable open-source layer is the operational model: verified status, local access, mitigation, ownership, and an auditable record. Public-data adapters can change city by city without changing those truth rules.

## What changes in the app

Almost nothing. This is presenter narrative plus **one small static context panel**. Do not build live adapters for it.

Add a `situationContext` block to `demo_data.json` holding four verified constants, and render them in a compact strip near the header:

- block groups with no cooling center within 1 mile: `355 of 789 (45%)`
- hot **and** uncovered block groups: `107`
- NWS heat products per year, Travis County, 2016-2025 mean: `10.9` (range 1-41)
- Austin 311 request categories for cooling or heat relief: `0` (of 2.5M requests)

Each needs a source label and date, exactly like every other number in the fixture. These are **public/derived** values, not synthetic — label them accordingly, because the rest of the screen is correctly labeled synthetic and mixing the two silently would undermine the whole disclosure discipline.

## Terminology correction — do this regardless

`demo_data.json` says **"Synthetic Excessive Heat Warning."**

NWS retired that product name. `https://api.weather.gov/alerts/types` returns, as of 2026-07-20:

```text
Extreme Heat Warning, Extreme Heat Watch, Heat Advisory
```

The VTEC phenomena code also moved from `EH` to `XH` in 2025. Change the fixture headline to **"Synthetic Extreme Heat Warning."** An emergency manager in the room will notice the old name, and it is a one-word fix that costs nothing.

## Guardrail additions for the presenter

Add to the existing "Do not say" list:

- do not present the 66%/45%/107 figures as SafeHeat's analysis — they are the City of Austin's published layer;
- do not say Austin has no heat plan or no cooling centers; it has both, plus 47 named relief sites;
- do not say 311 is broken — say it has no cooling category, which is a design gap, not a failure;
- do not describe the heat-product counts as a climate trend; product names and thresholds changed over the period.

Add to the approved phrases:

- `the City already publishes the siting analysis`;
- `no published feed carries event-time status`;
- `there is no 311 category for this`;
- `ten to eleven heat products a year, not a hypothetical`.

## Licensing caution

`Cooling_Centers_Census_Block_Groups` reports **no license** on its ArcGIS item, the same as Open Now. Quoting its aggregate statistics in a presentation is ordinary fair use of public information and is fine. **Redistributing its rows inside the app is not cleared.** Keep the four numbers as cited constants; do not bundle the layer.
