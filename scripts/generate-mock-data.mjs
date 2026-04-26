#!/usr/bin/env node
/**
 * Generates deterministic mock data into /data/mock/.
 *
 * Run with: node scripts/generate-mock-data.mjs
 *
 * Deterministic seeding ensures the demo data is identical across
 * machines and re-runs. Edit the constants below to tune scale.
 *
 * NOTE: The spec asks for placeholder member names following
 * "last name, first name" — Adelaide will replace with real names from
 * the club directory in a follow-up message.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "data", "mock");
mkdirSync(OUT, { recursive: true });

// ---- Deterministic PRNG (mulberry32) ----------------------------
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(19220926); // CHCC + founding year, deterministic
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const range = (n) => Array.from({ length: n }, (_, i) => i);
const intBetween = (a, b) => a + Math.floor(rand() * (b - a + 1));

// ---- Source name pools (placeholders) ---------------------------
// Common Carolina names — neutral placeholders pending real directory.
const FIRST_NAMES = [
  "James","Margaret","Robert","Catherine","William","Elizabeth","Thomas",
  "Mary","Charles","Sarah","Richard","Anne","David","Patricia","Henry",
  "Susan","Edward","Linda","Frederick","Caroline","Andrew","Helen",
  "George","Diana","Walter","Eleanor","Frances","Theodore","Virginia",
  "Samuel","Beatrice","Phillip","Constance","Arthur","Charlotte","Lewis",
  "Madeline","Vincent","Harriet","Nathaniel","Genevieve","Bennett",
  "Adelaide","Whitfield","Cordelia","Sterling","Augusta","Ellis","Hadley",
];
const LAST_NAMES = [
  "Ashworth","Bennett","Caldwell","Donnelly","Ellsworth","Fairchild",
  "Granville","Hawthorne","Inglewood","Jameson","Kingsley","Linwood",
  "Montgomery","Northrop","Osgood","Pemberton","Quincy","Radcliffe",
  "Sterling","Thornton","Underwood","Vanderbilt","Whitfield","Yardley",
  "Abernathy","Beauchamp","Cavendish","Davenport","Easterbrook","Fenwick",
  "Galbraith","Holloway","Iverson","Kensington","Langdon","Marlowe",
  "Norwood","Ormsby","Penhaligon","Rutherford","Saltonstall","Thackeray",
];

const TIERS = [
  "founder","resident","resident","resident","resident","non-resident",
  "non-resident","social","social","young-executive","corporate","honorary",
];

const DIETARY = [
  "gluten-free","vegetarian","vegan","pescatarian","dairy-free","nut-allergy",
  "shellfish-allergy","kosher","halal","low-sodium",
];

const VENUES = ["main-dining","grill-room","terrace"];

// ---- Members ----------------------------------------------------
const HOUSEHOLD_COUNT = 130;
const households = range(HOUSEHOLD_COUNT).map((i) => ({
  id: `HH-${String(i + 1).padStart(4, "0")}`,
  city: pick(["Chapel Hill","Carrboro","Hillsborough","Pittsboro","Durham"]),
  state: "NC",
  postalCode: pick(["27514","27516","27517","27278","27510"]),
  addressLine1: `${intBetween(100, 9999)} ${pick(LAST_NAMES)} ${pick(["Lane","Drive","Road","Way","Court","Place"])}`,
}));

const members = [];
let memberSeq = 0;
for (const hh of households) {
  const lastName = pick(LAST_NAMES);
  const adultCount = intBetween(1, 2);
  const childCount = rand() < 0.55 ? intBetween(1, 3) : 0;

  for (let a = 0; a < adultCount && members.length < 200; a += 1) {
    memberSeq += 1;
    const firstName = pick(FIRST_NAMES);
    const joinedYear = intBetween(1985, 2024);
    members.push({
      id: `M-${String(memberSeq).padStart(4, "0")}`,
      memberNumber: String(1000 + memberSeq),
      householdId: hh.id,
      firstName,
      lastName,
      preferredName: rand() < 0.25 ? firstName : undefined,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      phone: `(919) ${intBetween(200, 999)}-${String(intBetween(1000, 9999))}`,
      tier: pick(TIERS),
      status: rand() < 0.97 ? "active" : pick(["leave-of-absence","inactive"]),
      joinedOn: `${joinedYear}-${String(intBetween(1, 12)).padStart(2, "0")}-${String(intBetween(1, 28)).padStart(2, "0")}`,
      anniversaryDate: rand() < 0.7
        ? `${intBetween(1975, 2018)}-${String(intBetween(1, 12)).padStart(2, "0")}-${String(intBetween(1, 28)).padStart(2, "0")}`
        : undefined,
      birthday: `${intBetween(1940, 1995)}-${String(intBetween(1, 12)).padStart(2, "0")}-${String(intBetween(1, 28)).padStart(2, "0")}`,
      dietaryPreferences: rand() < 0.3
        ? [pick(DIETARY), ...(rand() < 0.2 ? [pick(DIETARY)] : [])]
        : [],
    });
  }
  for (let c = 0; c < childCount && members.length < 200; c += 1) {
    memberSeq += 1;
    const firstName = pick(FIRST_NAMES);
    members.push({
      id: `M-${String(memberSeq).padStart(4, "0")}`,
      memberNumber: String(1000 + memberSeq),
      householdId: hh.id,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.j@example.com`,
      tier: "young-executive",
      status: "active",
      joinedOn: `${intBetween(2010, 2024)}-${String(intBetween(1, 12)).padStart(2, "0")}-${String(intBetween(1, 28)).padStart(2, "0")}`,
      birthday: `${intBetween(1996, 2010)}-${String(intBetween(1, 12)).padStart(2, "0")}-${String(intBetween(1, 28)).padStart(2, "0")}`,
      dietaryPreferences: [],
    });
  }
}
while (members.length > 200) members.pop();

writeFileSync(join(OUT, "members.json"), JSON.stringify(members, null, 2) + "\n");
writeFileSync(join(OUT, "households.json"), JSON.stringify(
  households.map((hh) => ({
    ...hh,
    headOfHouseholdId: members.find((m) => m.householdId === hh.id)?.id ?? null,
    memberIds: members.filter((m) => m.householdId === hh.id).map((m) => m.id),
  })),
  null, 2,
) + "\n");

// ---- Reservations (30, spread past + present + future) -----------
function isoOnDay(date, hour, minute = 0) {
  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}
const today = new Date("2026-04-26T12:00:00-04:00"); // anchor for determinism
const reservations = range(30).map((i) => {
  const offsetDays = intBetween(-21, 21);
  const day = new Date(today); day.setDate(day.getDate() + offsetDays);
  const member = pick(members);
  const venueId = pick(VENUES);
  const hour = pick([12, 17, 18, 19, 20]);
  return {
    id: `R-${String(i + 1).padStart(4, "0")}`,
    memberId: member.id,
    venueId,
    time: isoOnDay(day, hour, pick([0, 15, 30, 45])),
    partySize: intBetween(2, 6),
    status: offsetDays < -1 ? pick(["completed","completed","completed","no-show"]) : "confirmed",
    notes: rand() < 0.25 ? pick([
      "Window table if possible",
      "Celebrating an anniversary",
      "Will arrive after a tee time",
      "One vegetarian in party",
      "High chair for one",
    ]) : undefined,
    occasion: rand() < 0.2 ? pick(["anniversary","birthday","business"]) : undefined,
    createdAt: new Date(day.getTime() - 1000 * 60 * 60 * 24 * intBetween(1, 14)).toISOString(),
  };
});
writeFileSync(join(OUT, "reservations.json"), JSON.stringify(reservations, null, 2) + "\n");

// ---- Events (15) ------------------------------------------------
const eventTemplates = [
  ["Member-Guest Invitational","golf-tournament","The Course",4,180,18000,true],
  ["Spring Wine Dinner","wine-dinner","Main Dining Room",60,180,12500,true],
  ["Easter Sunday Brunch","family","Main Dining Room + Terrace",250,180,6500,true],
  ["Mother's Day Brunch","family","Main Dining Room + Terrace",240,180,7200,true],
  ["Father-Son Golf Classic","golf-tournament","The Course",80,300,9500,false],
  ["Summer Solstice Party","social","Terrace & Lawn",200,240,8500,true],
  ["Fourth of July Cookout & Fireworks","family","Pool & Lawn",400,360,5500,true],
  ["Junior Tennis Camp","junior","Tennis Courts",24,2400,32500,false],
  ["Ladies' Member-Member","racquets","Tennis Courts",32,180,4500,false],
  ["Labor Day Pool Party","family","Pool",350,360,4500,false],
  ["Wine & Cheese Tasting","social","The Library",40,120,7500,false],
  ["Halloween Family Night","family","Clubhouse",180,180,3500,false],
  ["Thanksgiving Buffet","family","Main Dining Room",300,240,8500,true],
  ["Holiday Gala","holiday","Ballroom",220,300,18500,true],
  ["New Year's Eve Celebration","holiday","Ballroom",240,360,22500,true],
];

const events = eventTemplates.map(([title, category, location, capacity, durationMin, priceCents, featured], i) => {
  const startDay = new Date(today);
  startDay.setDate(startDay.getDate() + intBetween(-30, 180));
  startDay.setHours(pick([10, 11, 17, 18, 19]), 0, 0, 0);
  const end = new Date(startDay.getTime() + durationMin * 60_000);
  return {
    id: `E-${String(i + 1).padStart(4, "0")}`,
    title,
    category,
    description: `A signature CHCC ${category.replace("-", " ")} held in ${location}. Reservations required; cancellations within 48 hours of the event will be charged in full.`,
    startsAt: startDay.toISOString(),
    endsAt: end.toISOString(),
    location,
    capacity,
    attendingCount: intBetween(Math.floor(capacity * 0.3), Math.floor(capacity * 0.95)),
    priceCents,
    dressCode: category === "holiday" ? "jacket-required"
      : category === "wine-dinner" ? "country-club-casual"
      : category === "family" ? "smart-casual"
      : "country-club-casual",
    rsvpDeadline: new Date(startDay.getTime() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    featured,
  };
});
writeFileSync(join(OUT, "events.json"), JSON.stringify(events, null, 2) + "\n");

// ---- Two-week menu --------------------------------------------------
const menuItemPool = {
  "Snacks & Starters": [
    ["Salt-baked Carolina Beets","Whipped chèvre, candied pecans, citrus vinaigrette",1500,["vegetarian","gluten-free"]],
    ["Heirloom Tomato Carpaccio","Burrata, basil oil, aged balsamic",1800,["vegetarian"]],
    ["Charred Spring Asparagus","Hollandaise, soft egg, Marcona almonds",1600,["vegetarian"]],
    ["She-Crab Soup","Sherry, lump crab, chive",1800,[]],
    ["Carolina Oysters","On the half shell, mignonette",2400,[]],
    ["Country Pâté","Stone-ground mustard, cornichons, grilled levain",1700,[]],
  ],
  "From the Garden": [
    ["Little Gem Caesar","White anchovy, parmesan, sourdough croutons",1600,[]],
    ["Roasted Beet & Citrus","Pistachio, ricotta salata, sherry",1500,["vegetarian","gluten-free"]],
    ["Field Greens","Champagne vinaigrette, herbs",1100,["vegetarian","gluten-free","vegan"]],
  ],
  "Mains": [
    ["Carolina Mountain Trout","Brown butter, lemon, parsley new potatoes",3800,[]],
    ["Bone-in Berkshire Pork Chop","Stone-ground grits, peach mostarda",4200,[]],
    ["Prime Hanger Steak","Béarnaise, fries, watercress",3900,[]],
    ["Pan-roasted Halibut","Spring pea purée, morel, bacon vinaigrette",4600,[]],
    ["Rotisserie Half Chicken","Pan jus, root vegetables, gravy",3200,[]],
    ["Wood-oven Margherita","San Marzano, fior di latte, basil",1900,["vegetarian"]],
    ["Wild Mushroom Risotto","Parmesan, truffle oil, herbs",2800,["vegetarian","gluten-free"]],
  ],
  "Desserts": [
    ["Buttermilk Panna Cotta","Macerated strawberries, shortbread",1200,["vegetarian"]],
    ["Warm Chocolate Cake","Vanilla bean ice cream, cocoa nib",1400,["vegetarian"]],
    ["Lemon Olive Oil Cake","Whipped crème fraîche, candied citrus",1200,["vegetarian"]],
  ],
};

const menus = [];
for (let d = 0; d < 14; d += 1) {
  const day = new Date(today);
  day.setDate(day.getDate() + d);
  const dateKey = day.toISOString().slice(0, 10);
  for (const venueId of VENUES) {
    for (const service of (venueId === "main-dining" ? ["dinner"] : ["lunch","dinner"])) {
      const items = [];
      let id = 0;
      for (const [section, pool] of Object.entries(menuItemPool)) {
        const count = section === "Mains" ? 4 : section === "Desserts" ? 2 : 3;
        for (let i = 0; i < count; i += 1) {
          const [name, description, priceCents, dietaryTags] = pool[(d + i + (service === "dinner" ? 1 : 0)) % pool.length];
          id += 1;
          items.push({
            id: `MI-${dateKey}-${venueId}-${service}-${id}`,
            name, description, section, priceCents, dietaryTags,
          });
        }
      }
      menus.push({ date: dateKey, venueId, service, items });
    }
  }
}
writeFileSync(join(OUT, "menus.json"), JSON.stringify(menus, null, 2) + "\n");

// ---- Two-week tee time grid -----------------------------------------
const teeTimes = [];
for (let d = 0; d < 14; d += 1) {
  const day = new Date(today);
  day.setDate(day.getDate() + d);
  const weekday = day.getDay(); // 0 sun .. 6 sat
  // 7:30am to 4:30pm in 10-minute intervals
  for (let h = 7; h <= 16; h += 1) {
    for (const m of [0, 10, 20, 30, 40, 50]) {
      if (h === 7 && m < 30) continue;
      const slot = new Date(day);
      slot.setHours(h, m, 0, 0);
      const isWeekend = weekday === 0 || weekday === 6;
      // Weekends busier — fewer slots remain "available"
      const available = isWeekend ? rand() < 0.45 : rand() < 0.78;
      if (!available) continue;
      teeTimes.push({
        time: slot.toISOString(),
        maxPlayers: pick([2, 3, 4, 4, 4]),
        nineHoleOnly: h >= 15,
      });
    }
  }
}
writeFileSync(join(OUT, "tee-times.json"), JSON.stringify(teeTimes, null, 2) + "\n");

// ---- House charges (sample for one member) --------------------------
const sampleMember = members[0];
const charges = range(20).map((i) => {
  const day = new Date(today);
  day.setDate(day.getDate() - intBetween(0, 60));
  return {
    id: `CH-${String(i + 1).padStart(4, "0")}`,
    memberId: sampleMember.id,
    postedAt: day.toISOString(),
    category: pick(["dining","golf","racquets","pool","merchandise","events"]),
    description: pick([
      "Dinner — Main Dining Room",
      "Lunch — Grill Room",
      "Greens fee + cart",
      "Range balls",
      "Pro shop purchase",
      "Court fee",
      "Pool snack bar",
      "Wine dinner ticket",
    ]),
    amountCents: intBetween(800, 28000),
  };
});
writeFileSync(join(OUT, "charges.json"), JSON.stringify(charges, null, 2) + "\n");

console.log(`Wrote mock data:
  members:      ${members.length}
  households:   ${households.length}
  reservations: ${reservations.length}
  events:       ${events.length}
  menu records: ${menus.length}
  tee times:    ${teeTimes.length}
  charges:      ${charges.length}`);
