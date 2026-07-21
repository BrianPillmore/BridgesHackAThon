export type IdeaCategory = "Municipality" | "Public education";

export type ShortlistedIdea = {
  slug: string;
  name: string;
  category: IdeaCategory;
  promise: string;
  mvp: string;
  score: number;
};

export const ideaShortlist: ShortlistedIdea[] = [
  {
    slug: "municipal/01-311-signal",
    name: "311 Signal",
    category: "Municipality",
    promise: "Turn noisy service requests into a ranked, explainable action queue.",
    mvp: "Upload or fetch a sample, cluster duplicates, map hotspots, and show next actions.",
    score: 94,
  },
  {
    slug: "public-education/01-attendance-recovery",
    name: "Attendance Recovery Board",
    category: "Public education",
    promise: "Help attendance teams identify barriers and coordinate supportive outreach.",
    mvp: "Synthetic roster, risk bands, barrier intake, owner assignment, and follow-up log.",
    score: 93,
  },
  {
    slug: "municipal/02-safeheat",
    name: "SafeHeat",
    category: "Municipality",
    promise: "Help residents and outreach teams find safe, actionable heat resources.",
    mvp: "Address-free neighborhood risk view, cooling centers, checklist, and outreach queue.",
    score: 92,
  },
  {
    slug: "public-education/05-multilingual-family-digest",
    name: "Family Digest",
    category: "Public education",
    promise: "Convert fragmented school notices into clear multilingual action lists.",
    mvp: "Paste notices, extract dates/actions, translate, and generate a family-ready digest.",
    score: 91,
  },
  {
    slug: "municipal/07-vendor-payment-radar",
    name: "Vendor Payment Radar",
    category: "Municipality",
    promise: "Make delayed contracts and payments visible before providers hit a crisis.",
    mvp: "Load public contract data, flag aging items, explain bottlenecks, and export a queue.",
    score: 88,
  },
  {
    slug: "public-education/04-iep-service-tracker",
    name: "IEP Service Tracker",
    category: "Public education",
    promise: "Give teams a simple operational view of scheduled versus delivered services.",
    mvp: "Synthetic service plan, weekly delivery log, gap alerts, and family-safe summary.",
    score: 87,
  },
];
