import { readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

const root = process.cwd();
const sourceRoot = join(root, "brainstorm", "municipal", "02-safeheat", "data", "raw");
const outputPath = join(
  root,
  "brainstorm",
  "municipal",
  "02-safeheat",
  "data",
  "processed",
  "public_facility_inventory.json",
);

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  if (cell || row.length > 0) {
    row.push(cell);
    if (row.some((value) => value.trim() !== "")) rows.push(row);
  }

  const [header = [], ...records] = rows;

  return records.map((record) =>
    Object.fromEntries(header.map((field, index) => [field, record[index] ?? ""])),
  );
}

function slug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function numberOrNull(value) {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function fullAddress(record, streetKey = "address") {
  return [record[streetKey], record.city, record.state, record.zip].filter(Boolean).join(", ");
}

const sourceFiles = [
  {
    path: join(sourceRoot, "austin_public_library_locations_tc36-hn4j_normalized_2026-07-19.csv"),
    type: "library",
    reliefClass: "public_indoor_cooling_capable_inventory",
    sourceName: "Austin Public Library Locations",
    sourceUrl:
      "https://data.austintexas.gov/Locations-and-Maps/Austin-Public-Library-Locations/tc36-hn4j",
    map(record) {
      return {
        name: record.source_name,
        address: fullAddress(record),
        latitude: numberOrNull(record.latitude),
        longitude: numberOrNull(record.longitude),
        phone: record.phone || null,
        councilDistrict: record.council_district || null,
        publicUrl: record.location_url || null,
        datasetId: record.dataset_id,
        warning: record.operational_warning,
      };
    },
  },
  {
    path: join(sourceRoot, "austin_recreation_centers_8dff-2vkt_normalized_2026-07-19.csv"),
    type: "recreation_center",
    reliefClass: "public_indoor_cooling_capable_inventory",
    sourceName: "Austin Recreation Centers",
    sourceUrl: "https://data.austintexas.gov/Locations-and-Maps/Recreation-Centers/8dff-2vkt",
    map(record) {
      return {
        name: record.source_name,
        address: fullAddress(record),
        latitude: numberOrNull(record.latitude),
        longitude: numberOrNull(record.longitude),
        phone: record.phone || null,
        councilDistrict: null,
        publicUrl: record.location_url || null,
        datasetId: record.dataset_id,
        warning: record.operational_warning,
      };
    },
  },
  {
    path: join(sourceRoot, "austin_senior_activity_centers_2026-07-19.csv"),
    type: "senior_activity_center",
    reliefClass: "public_indoor_candidate_inventory",
    sourceName: "APR Senior Activity Centers",
    sourceUrl:
      "https://data.austintexas.gov/Recreation-and-Culture/APR-Senior-Activity-Centers/3yna-uh9e",
    map(record) {
      return {
        name: record.name,
        address: fullAddress(record, "street_address"),
        latitude: null,
        longitude: null,
        phone: record.phone || null,
        councilDistrict: null,
        publicUrl: record.source_url || null,
        datasetId: record.dataset_id,
        warning: record.operational_warning,
      };
    },
  },
  {
    path: join(sourceRoot, "travis_county_community_centers_2026-07-19.csv"),
    type: "county_community_center",
    reliefClass: "county_public_indoor_inventory",
    sourceName: "Travis County Community Centers",
    sourceUrl: "https://www.traviscountytx.gov/health-human-services/community-centers",
    map(record) {
      return {
        name: record.name,
        address: fullAddress(record, "street_address"),
        latitude: null,
        longitude: null,
        phone: record.phone || null,
        councilDistrict: null,
        publicUrl: record.source_url || null,
        datasetId: "travis-county-community-centers",
        warning: record.operational_warning,
      };
    },
  },
];

const records = sourceFiles.flatMap((source) => {
  const rows = parseCsv(readFileSync(source.path, "utf8"));

  return rows.map((row, index) => {
    const mapped = source.map(row);

    return {
      id: `${source.type}-${slug(mapped.name)}-${index + 1}`,
      type: source.type,
      reliefClass: source.reliefClass,
      sourceName: source.sourceName,
      sourceUrl: source.sourceUrl,
      snapshotFile: basename(source.path),
      snapshotDate: "2026-07-19",
      ...mapped,
    };
  });
});

const byType = Object.fromEntries(
  Object.entries(
    records.reduce((counts, record) => {
      counts[record.type] = (counts[record.type] ?? 0) + 1;
      return counts;
    }, {}),
  ).sort(([a], [b]) => a.localeCompare(b)),
);

const payload = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  source: "SafeHeat reviewed public facility inventory snapshots",
  disclosure:
    "Public inventory records only. They do not establish current hours, HVAC, capacity, event participation, or verified-open cooling access.",
  snapshotDate: "2026-07-19",
  recordCount: records.length,
  countsByType: byType,
  records,
};

writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log(`Wrote ${records.length} public inventory records to ${outputPath}`);
