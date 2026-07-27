// Demo ambassadors for the Browse catalog. Fields mirror what an ambassador
// account publishes at signup (see services/firebase/catalog.service.js →
// ambassadorDoc) so the school Browse cards render identically to real data.
//
// `formation` / `topics` / `levelsPreferred` use the value keys from
// data/options.js so the Browse filters match. Ranks are WO/ME/Specialist per
// the ambassador rule (WO and above, plus the Military Expert track).

export const demoAmbassadors = [
  {
    id: "amb-demo-1",
    rank: "ssg",
    name: "Rahim Bakar",
    appointment: "Platoon Sergeant",
    formation: "infantry",
    camp: "Kranji Camp III",
    mobility: "sharing",
    topics: ["nsf_life", "leadership", "fitness"],
    levelsPreferred: ["secondary", "jc"],
    about: "15 years in the infantry. Loves talking to students about grit, teamwork, and what NS is really like.",
    availableFrom: "2026-07-01",
    availableTo: "2026-08-31",
    // Per-date preferred slots (month is 0-indexed, matching the Availability page).
    availability: {
      dates: [
        { key: "2026-6-15", day: 15, month: 6, year: 2026, timing: "morning" },
        { key: "2026-6-22", day: 22, month: 6, year: 2026, timing: "afternoon" },
        { key: "2026-7-5", day: 5, month: 7, year: 2026, timing: "full_day" },
      ],
      timings: ["morning", "afternoon", "full_day"],
    },
  },
  {
    id: "amb-demo-2",
    rank: "me4",
    name: "Jerome Tan",
    appointment: "Systems Engineer",
    formation: "signal",
    camp: "Stagmont Camp",
    mobility: "sharing_booth",
    topics: ["technology", "career_army", "vocation"],
    levelsPreferred: ["jc", "poly"],
    about: "Works on tactical communications. Brings a hands-on comms demo when there's a booth.",
    availableFrom: "2026-07-10",
    availableTo: "2026-09-30",
    availability: {
      dates: [
        { key: "2026-6-10", day: 10, month: 6, year: 2026, timing: "morning" },
        { key: "2026-6-24", day: 24, month: 6, year: 2026, timing: "afternoon" },
        { key: "2026-8-9", day: 9, month: 8, year: 2026, timing: "full_day" },
        { key: "2026-8-16", day: 16, month: 8, year: 2026, timing: "morning" },
      ],
      timings: ["morning", "afternoon", "full_day"],
    },
  },
  {
    id: "amb-demo-3",
    rank: "1wo",
    name: "Suriati Osman",
    appointment: "Company Sergeant Major",
    formation: "guards",
    camp: "Bedok Camp",
    mobility: "sharing_booth",
    topics: ["leadership", "women_in_army", "fitness"],
    levelsPreferred: ["secondary", "jc"],
    about: "One of the first women to complete the Guards conversion. Speaks on leadership and resilience.",
    availableFrom: "2026-08-01",
    availableTo: "2026-08-31",
    availability: {
      dates: [
        { key: "2026-7-3", day: 3, month: 7, year: 2026, timing: "full_day" },
        { key: "2026-7-12", day: 12, month: 7, year: 2026, timing: "morning" },
        { key: "2026-7-19", day: 19, month: 7, year: 2026, timing: "afternoon" },
      ],
      timings: ["full_day", "morning", "afternoon"],
    },
  },
  {
    id: "amb-demo-4",
    rank: "3wo",
    name: "Kelvin Ng",
    appointment: "Armour Training Instructor",
    formation: "armoured",
    camp: "Sungei Gedong Camp",
    mobility: "sharing_booth",
    topics: ["vocation", "technology", "career_army"],
    levelsPreferred: ["secondary", "jc", "poly"],
    about: "Instructor on the Leopard 2SG. Great with students curious about armour vocations.",
    availableFrom: "2026-07-01",
    availableTo: "2026-07-31",
  },
  {
    id: "amb-demo-5",
    rank: "me5",
    name: "Priya Nair",
    appointment: "Senior Medical Specialist",
    formation: "medical",
    camp: "Nee Soon Camp",
    mobility: "sharing",
    topics: ["vocation", "women_in_army"],
    levelsPreferred: ["primary", "secondary", "jc"],
    about: "Combat medic turned medical trainer. Shares stories from field exercises and humanitarian ops.",
    availableFrom: "2026-07-05",
    availableTo: "2026-07-25",
  },
  {
    id: "amb-demo-6",
    rank: "ssg",
    name: "Daniel Lee",
    appointment: "Combat Engineer Specialist",
    formation: "combat_engineers",
    camp: "Seletar Camp",
    mobility: "sharing_booth",
    topics: ["technology", "leadership", "vocation"],
    levelsPreferred: ["secondary", "jc", "poly", "ite"],
    about: "Bridging, demolitions, and counter-mobility. Brings an engineering problem-solving activity.",
    availableFrom: "2026-07-10",
    availableTo: "2026-08-10",
  },
];

export default demoAmbassadors;
