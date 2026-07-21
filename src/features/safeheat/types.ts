export type Fixture = {
  schemaVersion: number;
  fixtureVersion: string;
  generatedAt: string;
  product: {
    name: string;
    city: string;
    timezone: string;
    mode: string;
  };
  disclosures: string[];
  operationalPeriod: OperationalPeriod;
  methodology: Methodology;
  sources: SourceReference[];
  healthSnapshot: HealthSnapshot;
  situationContext?: SituationContext;
  facilities: Facility[];
  zones: Zone[];
  partners: Partner[];
  tasks: Task[];
  auditEvents: AuditEvent[];
  scenario: Scenario;
};

export type OperationalPeriod = {
  id: string;
  title: string;
  startsAt: string;
  dangerWindowStart: string;
  dangerWindowEnd: string;
  warning: {
    headline: string;
    severity: string;
    effectiveAt: string;
    expiresAt: string;
    authorityClass: string;
    description: string;
  };
};

export type Methodology = {
  priorityFormula: string;
  weights: {
    heatPercentile: number;
    sviPercentile: number;
    accessGapScore: number;
  };
  bands: {
    criticalMin: number;
    highMin: number;
    moderateMin: number;
  };
  accessThresholdMilesApprox: number;
  accessGapPoints: Record<AccessGapFactorName, number>;
  healthContextScoreUse: string;
  geographicJoinNote: string;
  distanceNote: string;
};

export type SourceReference = {
  id: string;
  name: string;
  url: string;
  owner: string;
  authorityClass: string;
  sourceDate: string;
  fixtureUse: string;
  caveat: string;
};

export type HealthSnapshot = {
  source: string;
  sourceUrl: string;
  coverageStart: string;
  coverageEnd: string;
  publishedAt: string;
  retrievedDate: string;
  heatAdvisoriesOrWarnings: number;
  heatRelatedDeaths: number;
  emergencyDepartmentVisits: number;
  emsRecords: number;
  extendedHoursActivations: number;
  spatialLevel: string;
  caveat: string;
};

export type SituationContext = {
  dataClass: "public_and_derived";
  disclosure: string;
  retrievedDate: string;
  measures: SituationMeasure[];
};

export type SituationMeasure = {
  id: string;
  label: string;
  display: string;
  value: number;
  outOf?: number;
  rangeMin?: number;
  rangeMax?: number;
  periodCovered?: string;
  totalProducts?: number;
  owner: string;
  source: string;
  sourceUrl: string;
  attribution?: string;
  derivation: string;
  caveat: string;
};

export type Facility = {
  id: string;
  name: string;
  type: string;
  reliefClass: string;
  eligibleIndoorCooling: boolean;
  inventory: {
    address: string;
    latitude: number | null;
    longitude: number | null;
    phone: string | null;
    sourceId: string | null;
  };
  operationalStatus: OperationalStatus;
  demoDisclosure: string;
};

export type OperationalStatus = {
  state: string;
  eventOpenAt: string | null;
  eventCloseAt: string | null;
  capacity: string;
  verifiedAt: string | null;
  expiresAt: string | null;
  verificationMethod: string | null;
  verifierRole: string | null;
  authorityClass: string;
  reason?: string;
};

export type Zone = {
  id: string;
  name: string;
  geographyDisclosure: string;
  schematic: {
    x: number;
    y: number;
  };
  heatPercentile: number | null;
  sviPercentile: number | null;
  healthContext: {
    asthmaCrudePrevalence: number;
    disabilityCrudePrevalence: number;
    lackReliableTransportationCrudePrevalence: number;
    dataClass: string;
    scoreUse: string;
  };
  relationships: FacilityRelationship[];
  baseAccessFactors: {
    nearestQualifyingClosesBeforeDangerEnd: boolean;
    capacityRisk: boolean;
    transitPoorOrUnknown: boolean;
    relevantStatusUnknownOrStale: boolean;
  };
  reasonLabels: string[];
};

export type FacilityRelationship = {
  facilityId: string;
  distanceMilesApprox: number;
  withinIndoorAccessThreshold: boolean;
  transitContext: string;
};

export type Partner = {
  id: string;
  name: string;
  organizationType: string;
};

export type TaskStatus = "unassigned" | "assigned" | "in_progress" | "completed" | "cancelled";

export type Task = {
  id: string;
  type: string;
  title: string;
  zoneId: string;
  originFacilityId: string;
  destinationFacilityId: string;
  priority: string;
  dueAt: string;
  organizationId: string;
  ownerRole: string;
  status: TaskStatus;
  scope: string;
  createdAt: string;
  assignedAt?: string;
  inProgressAt?: string;
  completedAt?: string;
};

export type AuditEvent = {
  id: string;
  at: string;
  type: string;
  summary: string;
  actorRole: string;
  authorityClass: string;
};

export type Scenario = {
  targetZoneId: string;
  coveringFacilityId: string;
  alternateFacilityId: string;
  disruption: {
    newState: string;
    reason: string;
    verificationMethod: string;
    verifierRole: string;
    at: string;
    expiresAt: string;
  };
  taskDraft: Task;
  deterministicTaskTimes: {
    assignedAt: string;
    inProgressAt: string;
    completedAt: string;
  };
  completionMessage: string;
};

export type DemoState = {
  schemaVersion: number;
  fixtureVersion: string;
  currentDemoTime: string;
  facilities: Facility[];
  tasks: Task[];
  auditEvents: AuditEvent[];
};

export type IndoorAccessState = "covered" | "uncovered" | "unknown";

export type MitigationState = "none" | "transport_active" | "transport_completed" | "outreach_only";

export type PriorityBand = "critical" | "high" | "moderate" | "monitor" | "incomplete";

export type AccessGapFactorName =
  | "noQualifyingIndoorFacility"
  | "nearestClosesBeforeDangerEnd"
  | "capacityRisk"
  | "transitPoorOrUnknown"
  | "statusUnknownOrStale";

export type AccessGapFactors = Record<AccessGapFactorName, boolean>;

export type DerivedZone = {
  id: string;
  indoorAccess: IndoorAccessState;
  mitigationState: MitigationState;
  accessGapScore: number;
  accessGapFactors: AccessGapFactors;
  priorityScore: number | null;
  priorityBand: PriorityBand;
};

export type Metrics = {
  demoAreas: number;
  verifiedOpenIndoorFacilities: number;
  areasWithVerifiedIndoorAccess: number;
  uncoveredAreas: number;
  areasWithTransportMitigation: number;
  unassignedCriticalTasks: number;
};

export type AfterActionReport = {
  reportClass: "synthetic_demo_after_action";
  syntheticDisclosure: string[];
  fixtureVersion: string;
  generatedAtWallClock: string;
  currentDemoTime: string;
  elapsedDemoMinutes: number;
  operationalPeriod: OperationalPeriod;
  initialMetrics: Metrics;
  currentMetrics: Metrics;
  initialTarget: DerivedZone;
  currentTarget: DerivedZone;
  facilityChange: {
    facilityId: string;
    name: string;
    state: string;
    reason?: string;
  };
  taskTransitions: Task[];
  unresolved: {
    localIndoorAccess: boolean;
    dangerWindowAfterDestinationClose: boolean;
    statement: string;
  };
  auditEvents: AuditEvent[];
  methodology: Pick<
    Methodology,
    "priorityFormula" | "healthContextScoreUse" | "geographicJoinNote" | "distanceNote"
  >;
  dataSources: SourceReference[];
  limitations: string[];
};
