import type { ClubConfig, AdapterMode } from "@/lib/club-config/types";

const adapterMode: AdapterMode = (process.env.NEXT_PUBLIC_ADAPTER_MODE as AdapterMode) ?? "mock";

/**
 * Chapel Hill Country Club — active configuration.
 *
 * Edit this file to update brand details, venue info, or staff contacts.
 * Drop replacement photography into /public/club-assets/ using the same
 * filenames referenced below.
 */
export const clubConfig: ClubConfig = {
  slug: "chcc",
  name: "Chapel Hill Country Club",
  shortName: "CHCC",
  foundingYear: 1922,

  location: {
    addressLine1: "103 Lancaster Drive",
    city: "Chapel Hill",
    state: "NC",
    postalCode: "27517",
    country: "USA",
    timezone: "America/New_York",
    latitude: 35.9132,
    longitude: -79.0558,
  },

  brand: {
    logoPath: "/club-assets/chcc-monogram.svg",
    logoMarkPath: "/club-assets/chcc-monogram.svg",
    faviconPath: "/icons/favicon.svg",
    tagline: "Chapel Hill's Premier Family Country Club",
    strap: "Tradition. Community. Recreation. Since 1922.",
    photography: {
      hero: "/club-assets/photo-clubhouse.jpg",
      clubhouse: "/club-assets/photo-clubhouse.jpg",
      golf: "/club-assets/photo-golf.jpg",
      courts: "/club-assets/photo-courts.jpg",
      pool: "/club-assets/photo-pool.jpg",
      dining: "/club-assets/photo-dining.jpg",
    },
  },

  diningVenues: [
    {
      id: "main-dining",
      name: "The Main Dining Room",
      description:
        "Refined seasonal American cuisine in the clubhouse's signature room overlooking the eighteenth green.",
      capacity: 120,
      dressCode: "country-club-casual",
      hours: {
        mon: [],
        tue: ["17:30-21:00"],
        wed: ["17:30-21:00"],
        thu: ["17:30-21:00"],
        fri: ["11:30-14:00", "17:30-22:00"],
        sat: ["11:00-14:30", "17:30-22:00"],
        sun: ["10:30-14:30", "17:30-20:30"],
      },
      photo: "/club-assets/photo-dining.jpg",
      reservationLeadMinutes: 60,
    },
    {
      id: "grill-room",
      name: "The Grill Room",
      description:
        "Casual all-day dining with a curated tap selection, a wood-fired oven, and a view of the practice green.",
      capacity: 80,
      dressCode: "smart-casual",
      hours: {
        mon: [],
        tue: ["11:00-21:00"],
        wed: ["11:00-21:00"],
        thu: ["11:00-21:00"],
        fri: ["11:00-22:00"],
        sat: ["10:00-22:00"],
        sun: ["10:00-20:00"],
      },
      reservationLeadMinutes: 30,
    },
    {
      id: "terrace",
      name: "The Terrace",
      description:
        "Open-air dining beside the pool, served all summer with raw bar, salads, and frozen cocktails.",
      capacity: 60,
      dressCode: "casual",
      hours: {
        mon: [],
        tue: ["11:30-20:00"],
        wed: ["11:30-20:00"],
        thu: ["11:30-20:00"],
        fri: ["11:30-21:00"],
        sat: ["11:00-21:00"],
        sun: ["11:00-19:30"],
      },
      reservationLeadMinutes: 30,
    },
  ],

  golf: {
    name: "The Course at Chapel Hill",
    holes: 18,
    par: 71,
    courseRating: 71.4,
    slopeRating: 132,
    yardages: {
      black: 6712,
      blue: 6320,
      white: 5984,
      gold: 5512,
      red: 5028,
    },
    architect: "Donald Ross (original); restoration by Kris Spence",
    yearOpened: 1922,
    photo: "/club-assets/photo-golf.jpg",
  },

  courts: [
    {
      type: "tennis",
      count: 8,
      surface: "Har-Tru clay",
      lit: true,
      photo: "/club-assets/photo-courts.jpg",
    },
    {
      type: "pickleball",
      count: 4,
      surface: "Cushioned acrylic",
      lit: true,
    },
    {
      type: "platform",
      count: 2,
      surface: "Aluminum deck",
      lit: true,
    },
  ],

  pool: {
    name: "The Family Pool",
    description:
      "Six-lane competition pool, family pool with splash features, and shaded cabanas — open Memorial Day through Labor Day.",
    seasonStart: "05-25",
    seasonEnd: "09-08",
    photo: "/club-assets/photo-pool.jpg",
  },

  staff: [
    {
      title: "General Manager",
      name: "—",
      email: "gm@chapelhillcc.com",
    },
    {
      title: "Director of Golf",
      name: "—",
      email: "golf@chapelhillcc.com",
    },
    {
      title: "Director of Racquets",
      name: "—",
      email: "racquets@chapelhillcc.com",
    },
    {
      title: "Director of Food & Beverage",
      name: "—",
      email: "fnb@chapelhillcc.com",
    },
    {
      title: "Membership Director",
      name: "—",
      email: "membership@chapelhillcc.com",
    },
  ],

  integration: {
    mode: adapterMode,
    apiBase: process.env.CLUBESSENTIAL_API_BASE,
    clubId: process.env.CLUBESSENTIAL_CLUB_ID,
  },
};
