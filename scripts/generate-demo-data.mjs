#!/usr/bin/env node

import { mkdirSync, writeFileSync } from "node:fs";

const output = "data/demo";
mkdirSync(output, { recursive: true });

const serviceRequests = [
  ["SR-1001", "Street Condition", "Pothole", "Queens", 40.744, -73.918, 46],
  ["SR-1002", "Street Condition", "Pothole", "Queens", 40.7441, -73.9182, 43],
  ["SR-1003", "Heat or Hot Water", "No Hot Water", "Bronx", 40.846, -73.879, 12],
  ["SR-1004", "Traffic Signal Condition", "Pedestrian Signal", "Brooklyn", 40.674, -73.997, 28],
  ["SR-1005", "Sanitation Condition", "Missed Collection", "Manhattan", 40.812, -73.949, 7],
].map(([id, complaintType, descriptor, borough, latitude, longitude, ageHours]) => ({
  id,
  complaintType,
  descriptor,
  borough,
  latitude,
  longitude,
  ageHours,
  source: "synthetic",
}));

const attendance = [
  ["STU-001", 0.94, "none", "monitor"],
  ["STU-002", 0.88, "transportation", "outreach"],
  ["STU-003", 0.79, "health", "support-plan"],
  ["STU-004", 0.91, "caregiving", "check-in"],
  ["STU-005", 0.83, "unknown", "outreach"],
].map(([studentId, attendanceRate, barrier, recommendedAction]) => ({
  studentId,
  attendanceRate,
  barrier,
  recommendedAction,
  source: "synthetic",
}));

writeFileSync(
  `${output}/311-service-requests.json`,
  JSON.stringify(serviceRequests, null, 2) + "\n",
);
writeFileSync(`${output}/attendance-students.json`, JSON.stringify(attendance, null, 2) + "\n");
console.log(`Generated synthetic demo data in ${output}`);
