import { useMemo, useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import { useEngagements } from "../../hooks/useEngagements";
import { useCollectionWhere } from "../../hooks/useCollection";
import { schools as SCHOOL_ROSTER } from "../../data/schools";
import { SCHOOL_LEVELS } from "../../data/options";
import DataTable from "../../components/common/DataTable";

// Registered schools now come from Firestore — a live query of the `users`
// collection where role == "school". That's the real "onboarded" list (the same
// accounts the dashboard counts), replacing the hardcoded master roster.
//
// Signup doesn't capture the school LEVEL yet, so we look it up by name against
// the static roster (which does carry level) purely to group the table. Any name
// not in the roster falls under "Other / unspecified".
const LEVEL_BY_NAME = new Map(
  SCHOOL_ROSTER.map((s) => [s.name.trim().toLowerCase(), s.level])
);
const levelOf = (name) => LEVEL_BY_NAME.get((name ?? "").trim().toLowerCase()) ?? "other";

const LEVELS = [...SCHOOL_LEVELS, { value: "other", label: "Other / unspecified" }];

export default function SchoolsPage() {
  const { matches } = useEngagements();
  const schoolUsers = useCollectionWhere("users", "role", "==", "school");
  const [level, setLevel] = useState("all");

  const matchedNames = useMemo(
    () => new Set(matches.filter((m) => m.status === "Confirmed").map((m) => m.school)),
    [matches]
  );

  const schools = useMemo(
    () =>
      schoolUsers.map((u) => ({
        id: u.id,
        name: u.schoolName || (u.email ? u.email.split("@")[0] : "Unnamed school"),
        email: u.email,
        contact: u.fullName,
        approved: u.approved,
        level: levelOf(u.schoolName),
      })),
    [schoolUsers]
  );

  const grouped = useMemo(() => {
    const list = level === "all" ? schools : schools.filter((s) => s.level === level);
    return LEVELS.map((lvl) => ({
      ...lvl,
      items: list.filter((s) => s.level === lvl.value),
    })).filter((g) => g.items.length > 0);
  }, [schools, level]);

  return (
    <>
      <PageHeader
        eyebrow="Schools"
        title="Schools onboard"
        subtitle={`${schools.length} registered — grouped by level, with engagement status`}
      />

      {schools.length === 0 ? (
        <div className="card py-16 text-center">
          <p className="text-sm text-[#78716C]">No schools have registered yet.</p>
        </div>
      ) : (
        <>
          <div className="flex gap-2 mb-6 flex-wrap">
            <button
              onClick={() => setLevel("all")}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                level === "all"
                  ? "bg-[#1C1917] text-white font-medium"
                  : "bg-white border border-[#E7E5E4] text-[#44403C] hover:bg-[#F5F5F4]"
              }`}
            >
              All
              <span className={`ml-2 text-xs ${level === "all" ? "text-white/60" : "text-[#A8A29E]"}`}>
                {schools.length}
              </span>
            </button>
            {LEVELS.map((lvl) => {
              const count = schools.filter((s) => s.level === lvl.value).length;
              if (count === 0) return null;
              return (
                <button
                  key={lvl.value}
                  onClick={() => setLevel(lvl.value)}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    level === lvl.value
                      ? "bg-[#1C1917] text-white font-medium"
                      : "bg-white border border-[#E7E5E4] text-[#44403C] hover:bg-[#F5F5F4]"
                  }`}
                >
                  {lvl.label}
                  <span className={`ml-2 text-xs ${level === lvl.value ? "text-white/60" : "text-[#A8A29E]"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {grouped.map((group) => (
            <div key={group.value} className="mb-6">
              <h2 className="text-sm font-semibold text-[#78716C] mb-3">
                {group.label} <span className="text-[#A8A29E]">({group.items.length})</span>
              </h2>
              <div className="card overflow-hidden">
                <DataTable>
                  <table className="w-full text-sm">
                    <tbody>
                      {group.items.map((s) => {
                        const matched = matchedNames.has(s.name);
                        return (
                          <tr key={s.id} className="border-b border-[#F5F5F4] last:border-0">
                            <td className="px-6 py-4">
                              <p className="font-medium text-[#1C1917]">{s.name}</p>
                              {(s.contact || s.email) && (
                                <p className="text-xs text-[#A8A29E] mt-0.5">
                                  {[s.contact, s.email].filter(Boolean).join(" · ")}
                                </p>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right whitespace-nowrap">
                              {!s.approved && (
                                <span className="mr-2 px-3 py-1 rounded-full text-xs font-medium bg-[#FEF3C7] text-[#B45309]">
                                  Pending approval
                                </span>
                              )}
                              {matched ? (
                                <StatusBadge status="Approved">Engaged</StatusBadge>
                              ) : (
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#F5F5F4] text-[#78716C]">
                                  No engagement yet
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </DataTable>
              </div>
            </div>
          ))}
        </>
      )}
    </>
  );
}
