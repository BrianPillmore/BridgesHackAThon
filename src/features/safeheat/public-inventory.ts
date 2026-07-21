import rawInventory from "../../../brainstorm/municipal/02-safeheat/data/processed/public_facility_inventory.json";

export type PublicInventoryRecord = {
  id: string;
  type: string;
  reliefClass: string;
  sourceName: string;
  sourceUrl: string;
  snapshotFile: string;
  snapshotDate: string;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  councilDistrict: string | null;
  publicUrl: string | null;
  datasetId: string;
  warning: string;
};

export type PublicFacilityInventory = {
  schemaVersion: number;
  generatedAt: string;
  source: string;
  disclosure: string;
  snapshotDate: string;
  recordCount: number;
  countsByType: Record<string, number>;
  records: PublicInventoryRecord[];
};

export const publicFacilityInventory = rawInventory as PublicFacilityInventory;
