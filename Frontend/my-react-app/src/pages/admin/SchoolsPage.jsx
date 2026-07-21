import React, { useMemo, useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import { useEngagements } from "../../hooks/useEngagements";
import { onboardSchools } from "../../data/schools";
import { SCHOOL_LEVELS } from "../../data/options";

const levelLabel = (v) => SCHOOL_LEVELS.find((l) => l.value === v)?.label ?? v;

export default function SchoolsPage() {
  const { matches } = useEngagements();
  const [level, setLevel] = useState("all");

  const matchedNames = useMemo(
    () => new Set(matches.filter((m) => m.status === "Confirmed").map((m) => m.school)),
    [matches]
  );

  const schools = onboardSchools();

  const grouped = useMemo(() => {
    const list = level === "all" ? schools : schools.filter((s) => s.level === level);
    return SCHOOL_LEVELS.map((lvl) => ({
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
        </button>
        {SCHOOL_LEVELS.map((lvl) => {
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
            <table className="w-full text-sm">
              <tbody>
                {group.items.map((s) => {
                  const matched = matchedNames.has(s.name);
                  return (
                    <tr key={s.id} className="border-b border-[#F5F5F4] last:border-0">
                      <td className="px-6 py-4 font-medium text-[#1C1917]">{s.name}</td>
                      <td className="px-6 py-4 text-right">
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
          </div>
        </div>
      ))}
    </>
  );
}
