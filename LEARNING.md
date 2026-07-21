# LEARNING.md

Durable, hard-won findings from building SafeHeat. Each entry exists because
something was **not** what it appeared to be. `CONTINUE.md` is the chronological
log; this file is the distilled version worth re-reading before touching a
related area.

---

## 1. Verification traps

### `cmd | tail` hides failure

`npm run check 2>&1 | tail -30` reports **`tail`'s** exit status, not npm's. A
red gate looked green, and `format:check` had actually failed at step three so
lint, typecheck, and tests never ran.

**Rule:** never pipe a command whose exit code matters. Redirect to a file and
read `$?`.

```bash
npm run check > /tmp/check.log 2>&1; echo "EXIT=$?"
```

### An implausible number is a bug report

Querying the NWS heat-warning archive returned **zero Extreme Heat Warnings
statewide in Texas for 2025**. Texas always has extreme heat. The zero was real
output from a working query — and completely wrong, because the VTEC phenomena
code changed from `EH` to `XH` in 2025.

**Rule:** when a result contradicts basic domain knowledge, treat it as a defect
in the query before publishing it. Two queries would have shipped a false
statistic into a pitch deck.

### Empty is not an error

`firebase apphosting:backends:list` prints `Error: Unable to list backends` when
the list is simply **empty**. The underlying API returns `200 {}`. This made a
successful Blaze upgrade look like it had failed.

**Rule:** on a confusing CLI error, check the wire response (`--debug`) before
believing the message.

---

## 2. Data discovery

### The catalog documented 2 of 2,128 services

`DATA_SOURCE_CATALOG.md` listed two City of Austin ArcGIS services. Enumerating
the directory returned **2,128**:

```text
https://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services?f=json
```

`austin.maps.arcgis.com` **is** org `0L95CJ0VTaxqcmED`. The map-viewer URL and
the service host are the same tenant.

Two discovery paths, and the second is better:

- **Service directory** — names and types only.
- **Item search** — `/sharing/rest/search?q=orgid:0L95CJ0VTaxqcmED AND heat`,
  which also returns `licenseInfo`, descriptions, and web maps.

`owner:"CTM.Publisher"` (269 items) is Austin's **authoritative GIS publishing
account** — the canonical `BOUNDARIES_*`, `STRUCTURE_*`, and
`IMAGERYBASEMAPSEARTHCOVER_*` layers. Prefer it over ad-hoc departmental items.

### The City already publishes the analysis

`Cooling_Centers_Census_Block_Groups` has a GEOID set **byte-identical** to the
heat-disparity layer's 789 block groups, already joined with ACS
elderly/disability, tree canopy, shade, Tree Equity Score, and precomputed
`Cooling_Center_Half_Mi` / `Cooling_Center_1_Mi` counts.

That is SafeHeat's access-gap score, published by the City. It is both a
shortcut and prior art. The product's differentiator must be **event-time
verified status, ownership, mitigation, and audit** — never the map or the
ranked list. See `DEMO_REFRAME.md`.

### Layer IDs are not zero-indexed by convention

`Heat_Disparity_by_Park` exposes its only layer at **id 1**. Layer 0 does not
exist and returns `{"error":{"code":400,"message":"Invalid URL"}}` for every
query, including `returnCountOnly`.

**Rule:** always enumerate `layers[]` from the FeatureServer root.

### Two unrelated things are both called "GeoHub"

Esri/ArcGIS Hub and UNDP GeoHub (`geohub.data.undp.org`) share a name and
nothing else. A note about "the GeoHub item reports no license" meant the
**ArcGIS** item, and cost real user effort chasing a UNDP account that could
never have unblocked it.

**Rule:** name the vendor, never the generic product word.

UNDP GeoHub itself: public read API, no auth required, but its heat data is
global CC-BY rasters at Admin_2 (county) resolution from 2013 — far coarser than
Austin's own block-group layer. Not useful here.

### Absence of data is itself a finding

Austin 311 holds **2.5M requests** with **zero** heat-relief or cooling
categories. That is not a dead end; it is the strongest evidence in the pitch.
Residents have no channel to report a cooling need, and operators have no channel
to receive one.

**Rule:** when a search comes back empty, ask whether the emptiness is the
answer.

### Geographic filters silently undercount

`DATA_SOURCE_CATALOG.md` says to filter SVI to Travis County (`48453`). But the
heat layer spans **four** counties — Travis 696, Williamson 74, Hays 13,
Bastrop 6 block groups. A Travis-only filter joins 263 of 308 tracts (85%) and
drops the rest without error. Using the full Texas SVI release joins 308/308.

### Sentinel values invert meaning

Two Travis tracts carry `RPL_THEMES = -999`, one with a real population of 2,340.
Coercing sentinels to zero ranks a populated tract as _least vulnerable_ and
bottom-prioritizes it for outreach. SVI is 35% of the priority score.

---

## 3. Licensing

An ArcGIS item's `licenseInfo` is the field that matters, and it is often empty.
Both `HSO_Open_Now_Facilities` and `Cooling_Centers_Census_Block_Groups` report
**no license**. `BOUNDARIES_single_member_districts` **does** carry Austin's
standard GIS informational-use disclaimer.

Working distinction used throughout this project:

- **Citing an aggregate statistic** from a public layer — fine.
- **Bundling or redistributing its rows** — needs stated terms or written
  permission.

Draft request: `docs/OPEN_NOW_DATA_REQUEST.md`.

---

## 4. Build and tooling

### `npm install` is broken on this machine

`.npmrc` sets `engine-strict=true`; `package.json` pins `node >=22 <23`; the
local runtime is **Node 26**. Every install fails:

```text
npm error code EBADENGINE  Required: {"node":">=22 <23"}  Actual: {"node":"v26.3.0"}
```

Workaround used: `npm install <pkg> --engine-strict=false`. The dependency itself
does not care; deployment still runs Node 22 on App Hosting.

**Implication:** adding a dependency during a timed build is a real risk. Prefer
zero-dependency solutions, and install anything you might need _beforehand_.

### Generated artifacts break the format gate

Raw snapshots and manifests failed `prettier --check`, which is step three of
`npm run check`. Immutable provenance artifacts **must not** be reformatted —
doing so invalidates their recorded checksums. They belong in `.prettierignore`.

### Deploys cannot run concurrently

Two simultaneous `firebase deploy` runs produce:

```text
Error: Unexpected error occurred while testing for IAM service account permissions
```

The first invocation succeeded; the second collided with it. Also allow a moment
after `apphosting:backends:create` for the compute service account to provision —
the CLI warns about this and means it.

First rollout took ~7 minutes and served **404** until the container was ready.
A 404 during a first deploy is not a failure.

### Local DNS is flaky in this environment

`getaddrinfo failed` / `curl exit 6` appeared repeatedly against hosts that were
fine on retry. It caused one wrong conclusion (`austin.maps.arcgis.com` reported
as non-existent when it resolves fine).

**Rule:** retry with backoff before concluding a host is unreachable.

---

## 5. Domain and product

### NWS renamed its heat products

"Excessive Heat Warning" is retired. Current types, per
`https://api.weather.gov/alerts/types`:

```text
Extreme Heat Warning, Extreme Heat Watch, Heat Advisory
```

VTEC phenomena code moved `EH` → `XH` in 2025. Archive queries must sum **both**
codes or they undercount every year from 2025 onward.

### Frequency justifies the product

Austin/Travis County averaged **10.9** NWS heat products per year across
2016-2025 (109 total), ranging from 1 in 2021 to 41 in 2023. Used ten-plus times
a year, this is operations rather than research.

### Offline is a feature, not a limitation

The definition of done requires "network-free demo state loads with no runtime
public-data requests." That rules out a tile basemap. It also removes CORS,
rate-limit, schema-drift, licensing, and venue-wifi failure modes from a live
demo. Bundled geometry rendered as inline SVG satisfies "add a map" without
reintroducing any of them.

### Translation burden lives in the data

133 prose strings in the fixture versus ~20 in the UI. A UI-only i18n layer would
leave most of a "Spanish" screen in English. See `docs/I18N_APPROACH.md`.

### Only plot geometry you can honestly plot

The demo zones carry an abstract `schematic {x, y}` (values like `70, 25`), not
coordinates. Facilities carry real lat/lon. Drawing zones on a real district map
would imply boundaries that do not exist — a truth violation in a product whose
entire argument is about not overstating what data supports.

The map therefore plots **real districts and real facility locations only**.
Zones stay in the ranked table. This also turned out to be the better demo: when
the scenario facility goes unavailable, its marker changes shape on real
geography.

### Store live-region text as a key, not a rendered string

An `aria-live` message held as a resolved string freezes in the language that was
active when it fired. Hold the dictionary **key** and resolve at render, so a
mid-demo language switch re-announces correctly.

### Safety text should not be behind a toggle

The Spanish emergency instruction renders unconditionally in both languages. A
resident in danger must not have to find a language control first. Localization
is a preference; emergency instructions are not.

### `as const` fights translation dictionaries

Deriving `type Copy = typeof en` from an `as const` object makes every value a
**literal type**, so each Spanish string must equal its English source. Use
`Record<CopyKey, string>` — keys stay compile-checked, values stay free.

---

## 6. Process

- **Prefer empirical probes to reasoning about APIs.** Nearly every finding here
  came from calling the endpoint, not from reading documentation.
- **Do not re-derive a rehearsed fixture the night before a demo.** Fresher data
  is not worth trading a known-good, validated fixture for an unvalidated one.
- **Record provenance for anything quoted publicly.** Every statistic in
  `situationContext` carries `owner`, `sourceUrl`, `derivation`, and `caveat`.
- **Separate "cite" from "bundle"** when licensing is unclear. It usually unblocks
  the immediate need without taking on redistribution risk.
