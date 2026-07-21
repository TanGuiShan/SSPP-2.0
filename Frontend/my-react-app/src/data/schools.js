// Onboarded schools. Used for the stakeholder dashboard's level breakdown and
// coverage figures. Mock data — swap for the real roster when available.
//
// `level` matches SCHOOL_LEVELS in options.js. `onboard: true` = registered on
// the platform. `name` links to interest forms / matches by string match.

export const schools = [
  // Primary (12)
  { id: "sch-p01", name: "ABC Primary School", level: "primary", onboard: true },
  { id: "sch-p02", name: "Rivervale Primary School", level: "primary", onboard: true },
  { id: "sch-p03", name: "Punggol Green Primary School", level: "primary", onboard: true },
  { id: "sch-p04", name: "Fernvale Primary School", level: "primary", onboard: true },
  { id: "sch-p05", name: "Woodgrove Primary School", level: "primary", onboard: true },
  { id: "sch-p06", name: "Zhenghua Primary School", level: "primary", onboard: true },
  { id: "sch-p07", name: "Greenridge Primary School", level: "primary", onboard: true },
  { id: "sch-p08", name: "Jurong Primary School", level: "primary", onboard: true },
  { id: "sch-p09", name: "Yew Tee Primary School", level: "primary", onboard: true },
  { id: "sch-p10", name: "Canberra Primary School", level: "primary", onboard: true },
  { id: "sch-p11", name: "Sengkang Primary School", level: "primary", onboard: true },
  { id: "sch-p12", name: "Compassvale Primary School", level: "primary", onboard: true },

  // Secondary (10)
  { id: "sch-s01", name: "Swiss Cottage Secondary School", level: "secondary", onboard: true },
  { id: "sch-s02", name: "DEF Secondary School", level: "secondary", onboard: true },
  { id: "sch-s03", name: "Bukit Panjang Government High School", level: "secondary", onboard: true },
  { id: "sch-s04", name: "Fuchun Secondary School", level: "secondary", onboard: true },
  { id: "sch-s05", name: "Greenview Secondary School", level: "secondary", onboard: true },
  { id: "sch-s06", name: "Woodlands Ring Secondary School", level: "secondary", onboard: true },
  { id: "sch-s07", name: "Chua Chu Kang Secondary School", level: "secondary", onboard: true },
  { id: "sch-s08", name: "Yishun Town Secondary School", level: "secondary", onboard: true },
  { id: "sch-s09", name: "Pasir Ris Secondary School", level: "secondary", onboard: true },
  { id: "sch-s10", name: "Tampines Secondary School", level: "secondary", onboard: true },

  // Junior College (5)
  { id: "sch-j01", name: "GHI Junior College", level: "jc", onboard: true },
  { id: "sch-j02", name: "Anderson Serangoon Junior College", level: "jc", onboard: true },
  { id: "sch-j03", name: "Jurong Pioneer Junior College", level: "jc", onboard: true },
  { id: "sch-j04", name: "Tampines Meridian Junior College", level: "jc", onboard: true },
  { id: "sch-j05", name: "Yishun Innova Junior College", level: "jc", onboard: true },

  // Polytechnic (4)
  { id: "sch-poly01", name: "Ngee Ann Polytechnic", level: "poly", onboard: true },
  { id: "sch-poly02", name: "Singapore Polytechnic", level: "poly", onboard: true },
  { id: "sch-poly03", name: "Temasek Polytechnic", level: "poly", onboard: true },
  { id: "sch-poly04", name: "Republic Polytechnic", level: "poly", onboard: true },

  // ITE (3)
  { id: "sch-ite01", name: "ITE College Central", level: "ite", onboard: true },
  { id: "sch-ite02", name: "ITE College East", level: "ite", onboard: true },
  { id: "sch-ite03", name: "ITE College West", level: "ite", onboard: true },
];

/** Count of onboarded schools per level, in SCHOOL_LEVELS order. */
export function schoolCountsByLevel() {
  const counts = {};
  for (const s of schools) {
    if (!s.onboard) continue;
    counts[s.level] = (counts[s.level] ?? 0) + 1;
  }
  return counts;
}

export const onboardSchools = () => schools.filter((s) => s.onboard);

export default schools;
