# SafeHeat - Facility Landscape and Cooling-Asset Research

**Research date:** July 19, 2026  
**Geography:** Austin and the immediately relevant Travis County service area  
**Purpose:** Define the facility universe that SafeHeat can ingest, distinguish inventory from event-time availability, identify public and private expansion candidates, and specify the verification workflow required before a site counts as heat-response coverage.

## Executive finding

Austin has a comparatively strong facility-data foundation:

- 23 Austin Public Library records in the City's open-data inventory;
- 20 Parks and Recreation community recreation centers;
- 3 dedicated senior activity centers;
- 46 pools and splash pads with schedule and status fields;
- 6 Travis County community centers on the County roster;
- a City-operated Open Now resource finder for daytime cooling, water, healthcare, nutrition, hygiene, and related services; and
- public CapMetro fixed-route schedule data for access analysis.

The core unmet need is **not discovering that these buildings exist**. The missing operational layer is determining, for a specific heat-response period:

1. whether a site is actually participating;
2. whether it is open for the required danger window;
3. whether air conditioning and essential services are functioning;
4. whether the public may enter without a fee, appointment, membership, or purchase;
5. what accessibility, seating, water, restroom, language, service-animal, charging, and transit conditions are available;
6. whether the site has capacity or restrictions;
7. who verified the status and when; and
8. which high-priority areas lack verified local indoor access, and which separate transport or outreach mitigations are active.

Austin Emergency Management currently states that all Austin Public Library and Austin Parks facilities can serve as cooling centers during normal operating hours, and it distinguishes normal hours, extended hours, and temporarily unavailable sites. Travis County community centers are listed for normal weekday cooling-center service. Those policies create a strong base network, but they do not eliminate the need for event-time verification, ownership, and gap management.

## The rule that governs the system

> A facility inventory record is a candidate asset. It becomes qualifying coverage only after a current, source-linked operational status confirms that it is open, eligible, accessible for the intended use, and available during the relevant danger window.

Unknown, stale, unverified, or merely scheduled status must never count as confirmed coverage.

## Facility universe at a glance

| Facility class                      |              Identified inventory | Machine-readable?                                                | Baseline role                                                                 | Counts as indoor cooling coverage automatically?                                      | Primary gap                                                                    |
| ----------------------------------- | --------------------------------: | ---------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Austin Public Library               |                        23 records | Yes - Socrata JSON/GeoJSON                                       | Public indoor cooling network during normal hours under current City guidance | Only after current hours/status are confirmed                                         | Open-data inventory does not prove today's hours, closure, HVAC, or capacity   |
| Austin community recreation centers |                        20 records | Yes - Socrata JSON/GeoJSON                                       | Public indoor cooling network during normal hours under current City guidance | Only after current hours/status are confirmed                                         | Event-time state is separate from the inventory                                |
| Austin senior activity centers      |                         3 records | Yes - Socrata JSON/GeoJSON                                       | Aging-services resource and possible public indoor asset                      | No; require authoritative confirmation for the operational period                     | Dedicated center status is not the same as cooling-center activation           |
| Pools and splash pads               |                        46 records | Yes - Socrata JSON/GeoJSON                                       | Aquatic or hydration-related amenity                                          | No; never equivalent to air-conditioned indoor relief                                 | Weather closures, lifeguards, fees, water safety, and exposure while traveling |
| Travis County community centers     |                         6 centers | Web roster; no stable simple API identified                      | County cooling centers during listed normal weekday hours                     | Only for the stated period after current verification                                 | Cross-jurisdiction status, holidays, closures, and extended hours              |
| Open Now resources                  |    Dynamic curated service points | Public ArcGIS point FeatureServer found; item reports no license | Daytime cooling and supportive services, especially for unhoused residents    | Only after separate event-time verification                                           | Obtain reuse terms; administrative status/hours are not operational proof      |
| Private indoor facilities and malls |                   Candidate layer | Mixed; OSM plus facility websites and partner submissions        | Potential surge or gap-filling capacity                                       | No; explicit agreement and event-time verification required                           | Public hours are not a cooling-center agreement                                |
| CapMetro access                     | Fixed-route bus and rail schedule | Yes - GTFS ZIP                                                   | Access context and transportation planning                                    | Transportation is mitigation, not local indoor coverage and not facility availability | Static GTFS does not prove a real-time trip or free-ride activation            |

## 1. Austin Public Library

### Data availability

- **Dataset:** Austin Public Library Locations
- **Socrata ID:** `tc36-hn4j`
- **Rows reported by the catalog:** 23
- **Fields reported by the catalog:** name, address/location, phone, district, Wi-Fi, public-computer count, technology lending, and digital-literacy training
- **JSON:** `https://data.austintexas.gov/resource/tc36-hn4j.json?$limit=5000`
- **GeoJSON:** `https://data.austintexas.gov/resource/tc36-hn4j.geojson?$limit=5000`
- **Locations and hours:** `https://library.austintexas.gov/locations`

The library locations page exposes individual operating hours and closure information. It also includes library-affiliated destinations that may not function like a normal branch, such as the Austin History Center, APL Shop, or Recycled Reads. The ingestion pipeline must therefore retain the source's facility type and support a `suitability_review_required` flag rather than assuming every library-related record offers equivalent cooling capacity.

### Operational role

Current City emergency guidance identifies Austin Public Library facilities as cooling centers during normal operating hours and allows for a separate extended-hours state. This makes libraries the strongest immediately usable public indoor class for SafeHeat.

### Required operational fields beyond open data

- today's opening and closing times;
- holiday or emergency closure;
- extended-hours activation;
- HVAC and power status;
- public-entry restrictions;
- seating availability and approximate usable capacity band;
- accessible entrance and restroom confirmation;
- service-animal policy;
- water availability;
- language and communication support;
- device charging and Wi-Fi where confirmed;
- last verifier, method, and timestamp.

### Product treatment

Import every open-data record into the base inventory. Join hours separately. Create a facility-operational-status record for each response period. A missing status is `unknown`, never `open`.

## 2. Austin Parks and Recreation community recreation centers

### Data availability

- **Dataset:** Recreation Centers
- **Socrata ID:** `8dff-2vkt`
- **Rows reported by the catalog:** 20
- **Fields:** name, address, ZIP code, phone, website, and geolocation
- **JSON:** `https://data.austintexas.gov/resource/8dff-2vkt.json?$limit=5000`
- **GeoJSON:** `https://data.austintexas.gov/resource/8dff-2vkt.geojson?$limit=5000`
- **Official locations page:** `https://www.austintexas.gov/parks/locations/community-recreation-centers`

### Current roster

1. Alamo Recreation Center
2. Austin Recreation Center
3. Danny G. McBeth Recreation Center
4. Delores Duffie Recreation Center
5. Dittmar Recreation Center
6. Dottie Jordan Recreation Center
7. George Morales Dove Springs Recreation Center
8. Givens Recreation Center
9. Gustavo "Gus" L. Garcia Recreation Center
10. Hancock Recreation Center
11. Lorraine "Grandma" Camacho Activity Center
12. Rodolfo "Rudy" Mendez Recreation Center
13. Montopolis Recreation and Community Center
14. Northwest Recreation Center
15. Oswaldo A.B. Cantu/Pan American Recreation Center
16. Parque Zaragoza Recreation Center
17. Pickfair Community Center
18. South Austin Recreation Center
19. Turner-Roberts Recreation Center
20. Virginia L. Brown Recreation Center

### Operational role

Current City emergency guidance says Austin Parks facilities can serve as cooling centers during normal operating hours, with separate map states for normal hours, extended hours, and temporary unavailability. Recreation centers therefore belong in the primary public indoor network.

### Important limitation

The dataset's existence and normal program schedule do not establish that a center is open during a particular heat emergency. SafeHeat must maintain an event-time status overlay. A temporary HVAC interruption at one center should immediately remove that center from qualifying coverage without changing its underlying inventory record.

## 3. Senior activity centers and aging-services assets

### Dedicated open-data inventory

- **Dataset:** APR Senior Activity Centers
- **Socrata ID:** `3yna-uh9e`
- **Rows reported by the catalog:** 3
- **JSON:** `https://data.austintexas.gov/resource/3yna-uh9e.json?$limit=5000`
- **GeoJSON:** `https://data.austintexas.gov/resource/3yna-uh9e.geojson?$limit=5000`
- **Programs page:** `https://www.austintexas.gov/parks/seniors-programs-and-services`

| Facility                               | Address                                      | Public phone |
| -------------------------------------- | -------------------------------------------- | ------------ |
| Conley-Guerrero Senior Activity Center | 808 Nile St., Austin, TX 78702               | 512-978-2660 |
| Senior Activity Center - Lamar         | 2874 Shoal Crest Ave., Austin, TX 78705      | 512-978-2480 |
| South Austin Senior Activity Center    | 3911 Menchaca/Manchaca Rd., Austin, TX 78704 | 512-978-2400 |

The broader senior-services page also points to age-focused programs at other activity and community centers. SafeHeat should keep the dedicated three-center inventory separate from general recreation centers to avoid duplication.

### Product treatment

Default these records to `public_indoor_candidate` unless the authoritative emergency status feed explicitly includes them through the Parks cooling-center network. Add aging-services and senior-transportation contacts as organizational roles, not personal contact details.

## 4. Pools and splash pads

### Data availability

- **Parent dataset:** Austin Pool Schedule
- **Socrata ID:** `xaxa-886r`
- **Rows reported by the catalog:** 46
- **Map view:** `jfqh-bqzu`
- **Fields:** pool name, status, seasonal open date, weekday hours, weekend hours, closure days, pool type, phone, location, and website
- **JSON:** `https://data.austintexas.gov/resource/xaxa-886r.json?$limit=5000`
- **GeoJSON:** `https://data.austintexas.gov/resource/xaxa-886r.geojson?$limit=5000`
- **Official page:** `https://www.austintexas.gov/parks/locations/pools-and-splash-pads`

### Product treatment

Classify these as `water_or_aquatic_amenity`, never as indoor cooling centers. Preserve the source status and schedule, but attach explicit caveats:

- outdoor travel and waiting may increase exposure;
- admission or program rules may apply;
- lifeguard and staffing status matter;
- thunderstorms, water quality, maintenance, or staffing can close a site;
- pools may not be appropriate for all residents or for people experiencing heat illness;
- a pool does not replace air-conditioned seating, restrooms, water, and medical escalation guidance.

Pools may be displayed as separate aquatic amenities, but they never reduce or eliminate the local indoor-access gap in the proof of concept.

## 5. Travis County community centers

### Official roster

The County page identifies six centers:

| Center                          | Address                                                   | Public phone |
| ------------------------------- | --------------------------------------------------------- | ------------ |
| Del Valle Community Center      | 3518 FM 973 S., Del Valle, TX 78617                       | 512-854-1520 |
| Manor Community Center          | 600 W. Carrie Manor St., Manor, TX 78653                  | 512-854-1550 |
| Jonestown Community Center      | 18649 FM 1431, Suite 6A, Jonestown, TX 78645              | 512-854-1500 |
| Oak Hill Community Center       | 8656-A State Highway 71 W., Suite 100, Austin, TX 78735   | 512-854-2130 |
| Pflugerville Community Center   | 15822 Foothill Farm Loop, Suite D, Pflugerville, TX 78660 | 512-854-1530 |
| Central Austin Community Center | 5325 Airport Blvd., Austin, TX 78751                      | 512-854-4120 |

- **Official roster:** `https://www.traviscountytx.gov/health-human-services/community-centers`
- **Current City emergency guidance at research time:** listed County centers as cooling centers during normal operating hours, 8:00 a.m.-5:00 p.m. Monday-Friday, excluding County holidays.

### Data gap and recommendation

No simple stable public API was identified. For the proof of concept, bundle a dated, manually transcribed fixture with source links. For a pilot, request a County-maintained CSV, ArcGIS feature service, or shared status form that includes closures, extended hours, capacity band, and current contact role.

## 6. Open Now and community-service resources

- **Platform:** `https://opennow.maps.austintexas.gov/`
- **Instant App item:** `a301351f1c3049c6ad9d5571d0dd1428`
- **Public data item:** `bbe3d11e5ee74cb1a132ad952e58fda4`
- **Feature layer:** `https://services.arcgis.com/0L95CJ0VTaxqcmED/ArcGIS/rest/services/HSO_Open_Now_Facilities/FeatureServer/3`
- **Owner:** City of Austin Homeless Strategy Office / City of Austin

The discovered public point layer includes resource name/location, type, coarse status, weekday flags, detailed daily opening and closing strings, accessibility, pet-friendly status, notes, coordinates, and edit metadata. Its resource-type domain includes `cooling_center`.

Open Now is complementary rather than duplicative. It is resident-facing service discovery, while SafeHeat is an operator-facing coverage, ownership, and after-action system.

### Integration rule

The earlier `do not scrape` conclusion remains correct, but the technical reason is now more precise: a supported public FeatureServer exists, yet its GeoHub item reports no license and its administrative `status=open` value does not establish event-time heat-relief availability. A pilot should request reuse terms and an owner/refresh contract, then use a reviewed offline import. Every imported location must still obtain a separate operational status with verifier, method, event hours, capacity, `verifiedAt`, and `expiresAt` before it counts as coverage.

### Statewide cross-check

TDEM's Local Shelter & Seasonal Relief Centers app (`063f8332ed024ebe8cf0760576311d0f`) can help discover statewide or cross-jurisdiction resources and links an accessibility spreadsheet. The map says it is not real time and directs users to 2-1-1, so it remains a supporting source rather than Austin event-time authority.

## 7. Private indoor facilities and shopping malls

### Market finding

Austin has many prominent retail districts, but much of the retail landscape is open-air. A heat-response candidate must provide genuinely enclosed, conditioned common space; public entry; usable seating; restrooms; water; accessibility; and a verified willingness to participate. Retail presence alone is insufficient.

### Candidate A - Barton Creek Square

- **Address:** 2901 S. Capital of Texas Hwy., Austin, TX 78746
- **Owner/operator source:** `https://www.simon.com/mall/barton-creek-square/about`
- **Why it is notable:** the property describes itself as Austin's largest indoor shopping center with more than 180 shops and eateries.
- **Publicly listed amenities relevant to a heat partnership:** accessible parking, family restrooms, soft seating, device charging, complimentary wheelchairs, Wi-Fi, early mall-walking access, management/security contacts, and severe-weather preparedness designation.
- **SafeHeat status:** `private_partner_candidate` / `candidate_unverified`

Barton Creek Square is the best private-facility conversation starter inside Austin because it offers large enclosed common space and multiple resident-support amenities. It must not count as a cooling center unless the City and property operator establish participation, public-access conditions, hours, liability and security arrangements, communications procedures, and an event-time verifier.

### Candidate B - Lakeline Mall

- **Address:** 11200 Lakeline Mall Dr., Cedar Park, TX 78613
- **Owner/operator source:** `https://www.simon.com/mall/lakeline-mall/about`
- **Service geography:** Cedar Park and the North Austin metropolitan area; it is not a City of Austin facility.
- **Publicly listed amenities relevant to a heat partnership:** accessible parking, family restrooms, drinking fountains, seating, device charging, complimentary wheelchairs, Wi-Fi, service-animal access, management/security contacts, and published bus/rail access information.
- **SafeHeat status:** `private_partner_candidate` / `candidate_unverified` / `cross_jurisdiction`

Lakeline may matter to a regional Austin-Travis-Williamson response, but it should not be shown as an Austin official resource without a cross-jurisdiction agreement and current activation.

### Candidate-screening checklist

A private or nonprofit site may move from `candidate_unverified` to an active partner state only when all required fields are confirmed:

- written participation or an approved emergency protocol;
- named verifying organization and role;
- event dates and public hours;
- free public entry without purchase, membership, or appointment;
- functional air conditioning and power;
- accessible route and restroom;
- seating and capacity band;
- drinking-water availability;
- service-animal policy;
- security and behavioral expectations;
- language and communication access;
- phone charging or outlet availability, where offered;
- transit and accessible-transport options;
- closure and escalation contacts;
- permission to publish the site;
- verification time-to-live.

## 8. Transportation and geographic access

### CapMetro data

- **Dataset:** CapMetro GTFS
- **Download:** `https://data.austintexas.gov/download/r4v4-vz24/application/zip`
- **Coverage:** fixed-route MetroBus and MetroRail schedules
- **Developer resources:** `https://www.capmetro.org/metrolabs`

For the conference build, use a bundled GTFS snapshot to compute:

- nearest stop to each facility;
- nearest stop to each priority zone centroid;
- approximate walking distance;
- route identifiers serving the facility vicinity; and
- a simple `transit_context_available` flag.

Do not present a static schedule as a guaranteed trip. Any complimentary-ride activation, paratransit eligibility, disruption, or event-specific transport service requires an authoritative event-time source.

## 9. Operational truth hierarchy

SafeHeat should rank sources in this order:

1. **Current incident-command or emergency-management status record** - highest authority.
2. **Current verification by an authorized facility or partner role** - valid until its configured expiry.
3. **Current official facility hours/closure source** - useful but does not prove special-event participation or capacity.
4. **Authoritative base inventory** - proves the facility exists; does not prove availability.
5. **Partner submission awaiting approval** - candidate only.
6. **OpenStreetMap or general web discovery** - candidate discovery only.

When sources conflict, show the conflict and require review. Do not silently select the more optimistic status.

## 10. Required facility data model

Every normalized facility should support:

```ts
interface Facility {
  id: string;
  sourceId: string;
  sourceRecordId?: string;
  name: string;
  facilityType:
    | "public_library"
    | "recreation_center"
    | "senior_activity_center"
    | "pool"
    | "splash_pad"
    | "county_community_center"
    | "mall"
    | "faith_site"
    | "nonprofit"
    | "other";
  reliefClass:
    | "official_cooling_center"
    | "enhanced_cooling_center"
    | "public_indoor_candidate"
    | "private_partner_candidate"
    | "water_or_aquatic_amenity"
    | "outreach_service_point"
    | "overnight_shelter";
  authority: string;
  jurisdiction: string;
  address: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  website?: string;
  baseInventoryRetrievedAt: string;
  attributes: {
    accessibleEntrance?: boolean | "unknown";
    accessibleRestroom?: boolean | "unknown";
    serviceAnimals?: boolean | "unknown";
    seating?: boolean | "unknown";
    drinkingWater?: boolean | "unknown";
    restrooms?: boolean | "unknown";
    wifi?: boolean | "unknown";
    charging?: boolean | "unknown";
    languages?: string[];
    capacityBand?: "small" | "medium" | "large" | "unknown";
    entryCost?: "free" | "fee" | "unknown";
  };
}
```

Operational status must be a separate, time-bounded record:

```ts
interface FacilityOperationalStatus {
  id: string;
  operationalPeriodId: string;
  facilityId: string;
  status:
    | "open"
    | "closed"
    | "extended_hours"
    | "temporarily_unavailable"
    | "candidate_unverified"
    | "unknown";
  opensAt?: string;
  closesAt?: string;
  unavailableReason?: string;
  participationConfirmed: boolean;
  publicEntryConfirmed: boolean;
  hvacConfirmed: boolean | "unknown";
  capacityStatus: "available" | "limited" | "full" | "unknown";
  verificationMethod:
    | "incident_command"
    | "official_alert"
    | "staff_entry"
    | "phone_confirmation"
    | "partner_portal"
    | "demo_fixture";
  verifiedByOrganization: string;
  verifiedByRole: string;
  verifiedAt: string;
  expiresAt: string;
  sourceUrl?: string;
  notes?: string;
  synthetic: boolean;
}
```

## 11. Verification workflow

1. Import or create the base facility record.
2. Default its operational state to `unknown` or `candidate_unverified`.
3. Assign a verification task to an authorized role.
4. Require participation, public entry, hours, HVAC, capacity, accessibility, water/restrooms, and source confirmation.
5. Save a timestamped status with an expiry.
6. Recalculate zone coverage immediately.
7. Create a gap event and task when a high-priority zone loses its only qualifying coverage.
8. Preserve every prior state in the audit log.
9. Expire the status automatically back to `unknown` unless reverified.

Suggested default freshness for the proof of concept:

- incident-command update: until explicitly superseded or the operational period ends;
- staff/phone/partner verification: 4 hours;
- official normal-hours schedule: through the listed closing time, subject to event override;
- candidate website information: never qualifies as active status.

## 12. Conference-build facility subset

The deterministic demo should use 12-20 facilities drawn from a dated public snapshot:

- 4-6 libraries;
- 4-6 recreation centers;
- 1 senior activity center;
- 1 County community center;
- 1 pool or splash pad;
- 1 Open Now-linked or nonprofit service point;
- Barton Creek Square as an unverified private candidate; and
- optionally Lakeline Mall as an unverified cross-jurisdiction candidate.

Use actual coordinates from the public source snapshot when using real facility names. Do not invent a distance between real sites. Every operational status, closure, capacity value, partner assignment, and task in the stage demo must be labeled synthetic.

## 13. Highest-value pilot questions

### Public facilities

- Which system or person knows that a facility is unexpectedly closed?
- How quickly does that information reach Emergency Management, 3-1-1, Public Health, Library/Parks leadership, and the public map?
- Who can authorize extended hours?
- Is HVAC/power status tracked anywhere other than phone calls or email?
- Can staff report capacity, accessibility problems, or water/restroom outages?
- What verification expiry is operationally realistic?

### County and community partners

- Can Travis County publish a machine-readable center-status feed?
- Which nonprofit sites already provide enhanced cooling, hydration, transportation, or outreach?
- Which data may be shared publicly versus only inside an operations view?
- Who owns closure and escalation updates after normal business hours?

### Private facilities

- Would Barton Creek Square or another enclosed venue sign a pre-event participation agreement?
- Is public entry free and unconditional during activation?
- What hours, security, seating, restroom, water, service-animal, and accessibility conditions apply?
- Can the facility publish a simple `open / limited / full / unavailable` status?
- Who may activate, suspend, or terminate participation?

## 14. Sources

### City and County operations

- Austin Active Emergency Information Hub: `https://www.austintexas.gov/emergency-management/active-emergency-information-hub`
- Austin Heat Awareness: `https://www.austintexas.gov/ready-central-texas/heat-awareness`
- Travis County community centers: `https://www.traviscountytx.gov/health-human-services/community-centers`
- Open Now: `https://opennow.maps.austintexas.gov/`
- Open Now launch description: `https://www.austintexas.gov/homeless-strategies/news/homeless-strategy-offices-new-open-now-platform-connects-unhoused`

### City facility data

- Libraries: `https://data.austintexas.gov/d/tc36-hn4j`
- Library hours: `https://library.austintexas.gov/locations`
- Recreation centers: `https://data.austintexas.gov/d/8dff-2vkt`
- Recreation-center roster: `https://www.austintexas.gov/parks/locations/community-recreation-centers`
- Senior activity centers: `https://data.austintexas.gov/d/3yna-uh9e`
- Senior programs and locations: `https://www.austintexas.gov/parks/seniors-programs-and-services`
- Pool schedule: `https://data.austintexas.gov/d/xaxa-886r`
- Pool map: `https://data.austintexas.gov/d/jfqh-bqzu`

### Transportation

- CapMetro GTFS: `https://data.austintexas.gov/download/r4v4-vz24/application/zip`
- CapMetro developer resources: `https://www.capmetro.org/metrolabs`

### Private candidates

- Barton Creek Square: `https://www.simon.com/mall/barton-creek-square/about`
- Lakeline Mall: `https://www.simon.com/mall/lakeline-mall/about`
- Visit Austin shopping overview: `https://www.austintexas.org/things-to-do/shop/malls/`

## Bottom line

Austin already has a large and partly machine-readable network of public relief assets. SafeHeat creates value by turning that fragmented network into a **current, auditable operating picture**. The system must never confuse a location record, a published schedule, or a retail website with verified emergency capacity.
