#!/usr/bin/env node
/**
 * Patches data/mock/members.json in place to add a `role` field on
 * every record (default "member") and to seed three staff members
 * (GM, F&B Director, Director of Golf).
 *
 * Idempotent — safe to re-run.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = join(__dirname, "..", "data", "mock", "members.json");

const members = JSON.parse(readFileSync(FILE, "utf-8"));

// Default role on every member.
for (const m of members) {
  if (!m.role) m.role = "member";
}

// Specific staff seeds. We pick well-known demo member ids and assign
// roles + recognisable names so the demo reads naturally.
const staffSeeds = [
  {
    id: "M-0003",
    role: "gm",
    firstName: "Augusta",
    lastName: "Cavendish",
    preferredName: "Augusta",
    email: "augusta.cavendish@chapelhillcc.com",
  },
  {
    id: "M-0004",
    role: "fnb",
    firstName: "Frances",
    lastName: "Rutherford",
    preferredName: "Frances",
    email: "frances.rutherford@chapelhillcc.com",
  },
  {
    id: "M-0005",
    role: "golf-pro",
    email: "golf-pro@chapelhillcc.com",
  },
];

for (const seed of staffSeeds) {
  const idx = members.findIndex((m) => m.id === seed.id);
  if (idx === -1) continue;
  members[idx] = { ...members[idx], ...seed };
}

writeFileSync(FILE, JSON.stringify(members, null, 2) + "\n");

const counts = members.reduce((acc, m) => {
  acc[m.role] = (acc[m.role] ?? 0) + 1;
  return acc;
}, {});
console.log("Member roles:", counts);
