"use client";

/**
 * Offline schematic map: City of Austin council districts plus real facility
 * locations, rendered as inline SVG.
 *
 * NO MAP LIBRARY AND NO BASEMAP, deliberately. A tile basemap would make runtime
 * requests to an external host, violating the "network-free demo state loads
 * with no runtime public-data requests" rule and creating a live failure mode on
 * conference wifi. Geometry is bundled.
 *
 * TRUTH BOUNDARY: only real geography is plotted. Council districts and facility
 * coordinates are real public data. Demo *zones* are synthetic and carry only an
 * abstract `schematic {x, y}`, so they are intentionally NOT drawn here — placing
 * them on real geography would imply boundaries that do not exist. Zones stay in
 * the ranked table, which remains the authoritative accessible view.
 *
 * Facility STATUS is synthetic even though facility LOCATION is real.
 */

import { useMemo } from "react";

// Stored with a .json extension (not .geojson) so `resolveJsonModule` can type it
// without a custom module declaration. Contents are still GeoJSON.
import districtsGeoJson from "../../../brainstorm/municipal/02-safeheat/data/processed/austin_council_districts.json";
import { facilityIsVerifiedOpenNow } from "./domain";
import type { Facility, Fixture } from "./types";

type Ring = number[][];
type DistrictFeature = {
  properties: { district: number };
  geometry: { type: string; coordinates: Ring[] | Ring[][] };
};

const geo = districtsGeoJson as unknown as { features: DistrictFeature[] };

const WIDTH = 620;
const HEIGHT = 720;
const PADDING = 12;

/** Every ring in the collection, flattened across Polygon and MultiPolygon. */
function ringsOf(feature: DistrictFeature): Ring[] {
  const { type, coordinates } = feature.geometry;
  if (type === "Polygon") return coordinates as Ring[];
  if (type === "MultiPolygon") return (coordinates as Ring[][]).flat();
  return [];
}

export function DistrictMap({
  facilities,
  fixture,
  currentDemoTime,
  highlightFacilityId,
}: {
  facilities: Facility[];
  fixture: Fixture;
  currentDemoTime: string;
  highlightFacilityId?: string | null;
}) {
  const { paths, project } = useMemo(() => {
    const allRings = geo.features.flatMap(ringsOf);
    const lons = allRings.flatMap((ring) => ring.map((p) => p[0]));
    const lats = allRings.flatMap((ring) => ring.map((p) => p[1]));
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    // Equirectangular with a cos(latitude) correction so Austin is not stretched
    // horizontally. Adequate for a city-scale schematic; this is not a projection
    // suitable for measurement, and no distance is derived from it.
    const latScale = Math.cos(((minLat + maxLat) / 2) * (Math.PI / 180));
    const spanX = (maxLon - minLon) * latScale;
    const spanY = maxLat - minLat;
    const scale = Math.min((WIDTH - PADDING * 2) / spanX, (HEIGHT - PADDING * 2) / spanY);
    const offsetX = (WIDTH - spanX * scale) / 2;
    const offsetY = (HEIGHT - spanY * scale) / 2;

    const projectPoint = (lon: number, lat: number): [number, number] => [
      offsetX + (lon - minLon) * latScale * scale,
      // SVG y grows downward; latitude grows upward.
      offsetY + (maxLat - lat) * scale,
    ];

    const built = geo.features.map((feature) => ({
      district: feature.properties.district,
      d: ringsOf(feature)
        .map(
          (ring) =>
            ring
              .map((point, index) => {
                const [x, y] = projectPoint(point[0], point[1]);
                return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
              })
              .join(" ") + " Z",
        )
        .join(" "),
    }));

    return { paths: built, project: projectPoint };
  }, []);

  const plotted = facilities
    .map((facility) => {
      const { latitude, longitude } = facility.inventory;
      if (latitude == null || longitude == null) return null;
      const [x, y] = project(longitude, latitude);
      return {
        facility,
        x,
        y,
        verifiedOpen: facilityIsVerifiedOpenNow(facility, fixture, currentDemoTime),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const openCount = plotted.filter((item) => item.verifiedOpen).length;

  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`Schematic map of ${paths.length} Austin council districts showing ${plotted.length} facilities, of which ${openCount} are synthetically verified open.`}
        className="h-auto w-full"
      >
        <g>
          {paths.map((path) => (
            <path
              key={path.district}
              d={path.d}
              fill="#e7e5e4"
              stroke="#78716c"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </g>

        <g>
          {plotted.map(({ facility, x, y, verifiedOpen }) => {
            const highlighted = facility.id === highlightFacilityId;
            return (
              <g key={facility.id}>
                {highlighted ? (
                  <circle cx={x} cy={y} r={13} fill="none" stroke="#0c4a6e" strokeWidth={2} />
                ) : null}
                {/* Status is encoded by SHAPE as well as fill, never colour alone:
                    verified-open is a circle, everything else a square. */}
                {verifiedOpen ? (
                  <circle cx={x} cy={y} r={7} fill="#047857" stroke="#ffffff" strokeWidth={2} />
                ) : (
                  <rect
                    x={x - 6}
                    y={y - 6}
                    width={12}
                    height={12}
                    fill="#b91c1c"
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                )}
                <title>
                  {`${facility.name} — ${verifiedOpen ? "synthetically verified open" : "does not qualify now"}`}
                </title>
              </g>
            );
          })}
        </g>
      </svg>

      <figcaption className="mt-2 text-xs leading-5 text-slate-600">
        Council districts and facility locations are real public data from the City of Austin.
        Facility status is synthetic. Demo areas are synthetic and are not drawn on this map. The
        ranked table is the authoritative view.
      </figcaption>
    </figure>
  );
}
