import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import TargetSummary from "../../components/common/TargetSummary";
import { useEngagements, isEscalated, slotsRemaining } from "../../hooks/useEngagements";
import { useCollection, useCollectionWhere } from "../../hooks/useCollection";
import { schools } from "../../data/schools";
import { SCHOOL_LEVELS } from "../../data/options";
import { TAB, linkToTab } from "../../utils/tabs";
import DataTable from "../../components/common/DataTable";

const STALE_AFTER_DAYS = 7;
const DAY = 24 * 60 * 60 * 1000;

const daysSince = (iso) => (iso ? Math.floor((Date.now() - new Date(iso).getTime()) / DAY) : 0);
const daysUntil = (iso) => (iso ? Math.ceil((new Date(iso).getTime() - Date.now()) / DAY) : null);

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-SG", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { interestForms, matches, assignProvider } = useEngagements();

  // Same live Firestore catalogs the school Browse reads, so the Units and
  // Ambassadors counts (and the assign-provider dropdown) match Browse exactly.
  const formations = useCollection("formations");
  const ambassadors = useCollection("ambassadors");

  // Real school accounts that have signed up (users where role == "school").
  const schoolAccounts = useCollectionWhere("users", "role", "==", "school");

  const stats = useMemo(() => {
    // Onboarded = master-roster schools that have a real account (matched by
    // name); the rest of the roster is "yet to onboard".
    const onboardedNames = new Set(
      schoolAccounts.map((a) => (a.schoolName || "").trim()).filter(Boolean)
    );
    const onboarded = schools.filter((s) => onboardedNames.has(s.name));
    const yetToOnboard = schools.filter((s) => !onboardedNames.has(s.name));

    const approvedMatches = matches.filter((m) => m.status === "Confirmed");
    const pendingForms = interestForms.filter((f) => f.status === "Awaiting confirmation");

    // Per-request
    const matchedRequests = approvedMatches.length;
    const yetToMatchRequests = pendingForms.length;

    // Per-school: which onboarded schools have at least one approved match
    const matchedSchoolNames = new Set(approvedMatches.map((m) => m.school));
    const matchedSchools = onboarded.filter((s) => matchedSchoolNames.has(s.name)).length;
    const unmatchedSchools = onboarded.length - matchedSchools;

    // Coverage per level: matched schools / onboarded schools at that level
    const coverageByLevel = SCHOOL_LEVELS.map((lvl) => {
      const total = onboarded.filter((s) => s.level === lvl.value).length;
      const matched = onboarded.filter(
        (s) => s.level === lvl.value && matchedSchoolNames.has(s.name)
      ).length;
      return { ...lvl, total, matched, pct: total ? Math.round((matched / total) * 100) : 0 };
    });

    // Reach: students engaged across approved matches
    const studentsEngaged = approvedMatches.reduce((sum, m) => sum + (m.participants || 0), 0);

    // Stale schools (pending >= 7 days)
    const staleSchools = Object.values(
      pendingForms
        .map((f) => ({ ...f, waitingDays: daysSince(f.submittedAt) }))
        .filter((f) => f.waitingDays >= STALE_AFTER_DAYS)
        .reduce((acc, f) => {
          if (!acc[f.school] || f.waitingDays > acc[f.school].waitingDays) {
            acc[f.school] = { school: f.school, waitingDays: f.waitingDays };
          }
          return acc;
        }, {})
    ).sort((a, b) => b.waitingDays - a.waitingDays);

    // Upcoming engagements: approved, date in the future, soonest first
    const upcoming = approvedMatches
      .filter((m) => m.date && daysUntil(m.date) >= 0)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const completionRate = interestForms.length
      ? Math.round((matchedRequests / interestForms.length) * 100)
      : 0;

    // Open requests nobody has picked up past the escalation window — admin
    // steps in here, and only here, since they're otherwise out of matching.
    const escalatedRequests = matches
      .filter((m) => isEscalated(m))
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    return {
      escalatedRequests,
      onboardedCount: onboarded.length,
      yetToOnboardCount: yetToOnboard.length,
      matchedRequests,
      yetToMatchRequests,
      matchedSchools,
      unmatchedSchools,
      coverageByLevel,
      studentsEngaged,
      staleSchools,
      upcoming,
      completionRate,
    };
  }, [interestForms, matches, schoolAccounts]);

  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title="Programme Overview"
        subtitle="SSPP engagement at a glance for MOE and MINDEF stakeholders"
        action={
          <span className="px-3 py-1.5 rounded-full bg-[#DBEAFE] text-[#1D4ED8] text-xs font-medium">
            As of {new Date().toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        }
      />

      {/* Headline figures */}
      <div className="flex gap-4 flex-wrap mb-5">
        <StatCard
          label="Schools onboard"
          value={stats.onboardedCount}
          valueColor="#16A34A"
          hint="Registered accounts"
          onClick={() => navigate("/admin/schools")}
        />
        <StatCard
          label="Yet to onboard"
          value={stats.yetToOnboardCount}
          valueColor="#EA580C"
          hint="No account yet"
          onClick={() => navigate("/admin/schools")}
        />
        <StatCard label="Ambassadors" value={ambassadors.length} />
        <StatCard label="Units" value={formations.length} />
        <StatCard
          label="Matched (schools)"
          value={stats.matchedSchools}
          valueColor="#16A34A"
          hint="See in Match Results"
          onClick={() => navigate(linkToTab("/admin/approvals", TAB.CONFIRMED))}
        />
        <StatCard
          label="Yet to match (schools)"
          value={stats.unmatchedSchools}
          valueColor="#EA580C"
        />
        <StatCard
          label={`Waiting ≥${STALE_AFTER_DAYS}d`}
          value={stats.staleSchools.length}
          valueColor={stats.staleSchools.length > 0 ? "#DC2626" : "#16A34A"}
          hint="Pending in Match Results"
          onClick={() => navigate(linkToTab("/admin/approvals", TAB.AWAITING))}
        />
      </div>

      {/* School level breakdown */}
      <div className="card p-6 mb-5">
        <h2 className="text-xl mb-1" style={{ fontFamily: "var(--font-display)" }}>
          Schools onboard by level
        </h2>
        <p className="text-xs text-[#78716C] mb-5">
          {stats.onboardedCount} schools · matched share shows engagement coverage
        </p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {stats.coverageByLevel.map((lvl) => (
            <button
              key={lvl.value}
              onClick={() => navigate("/admin/schools")}
              className="rounded-lg border border-[#E7E5E4] p-4 text-left hover:border-[#A8A29E] transition-colors"
            >
              <p className="text-2xl font-bold text-[#1C1917]">{lvl.total}</p>
              <p className="text-xs text-[#78716C] mb-3">{lvl.label}</p>
              <div className="h-1.5 rounded-full bg-[#F5F5F4] overflow-hidden mb-1">
                <div
                  className="h-full rounded-full bg-[#16A34A]"
                  style={{ width: `${lvl.pct}%` }}
                />
              </div>
              <p className="text-[11px] text-[#78716C]">
                {lvl.matched}/{lvl.total} matched ({lvl.pct}%)
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Request & reach summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <button
          onClick={() => navigate(linkToTab("/admin/approvals", TAB.CONFIRMED))}
          className="card group p-6 text-left hover:border-[#A8A29E] transition-colors"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-[#A8A29E] mb-1">Requests matched</p>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A8A29E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-[#16A34A]">{stats.matchedRequests}</p>
          <p className="text-xs text-[#78716C] mt-1">
            {stats.yetToMatchRequests} still pending a match
          </p>
        </button>
        <div className="card p-6">
          <p className="text-xs uppercase tracking-wide text-[#A8A29E] mb-1">Students engaged</p>
          <p className="text-3xl font-bold text-[#2563EB]">
            {stats.studentsEngaged.toLocaleString()}
          </p>
          <p className="text-xs text-[#78716C] mt-1">Across confirmed engagements</p>
        </div>
        <div className="card p-6">
          <p className="text-xs uppercase tracking-wide text-[#A8A29E] mb-1">Completion rate</p>
          <p className="text-3xl font-bold text-[#16A34A]">{stats.completionRate}%</p>
          <p className="text-xs text-[#78716C] mt-1">Approved of all requests received</p>
        </div>
      </div>

      {/* Stale flag */}
      {/* Escalation: open requests nobody volunteered for. This is the ONLY
          place admin assigns a provider — the fallback when the market fails. */}
      {stats.escalatedRequests.length > 0 && (
        <div className="sspp-escalation">
          <div className="sspp-escalation-head">
            <h2>Needs assignment</h2>
            <p>
              {stats.escalatedRequests.length} open request
              {stats.escalatedRequests.length > 1 ? "s" : ""} with no volunteers after{" "}
              {STALE_AFTER_DAYS} days
            </p>
          </div>

          {stats.escalatedRequests.map((m) => {
            const pool = m.category === "unit" ? formations : ambassadors;
            const left = slotsRemaining(m);
            return (
              <div key={m.id} className="sspp-escalation-row">
                <div>
                  <p className="sspp-escalation-school">{m.school}</p>
                  <p className="sspp-escalation-meta">
                    {new Date(m.date).toLocaleDateString("en-SG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    · {m.participants} pax · needs {left} more
                  </p>
                </div>

                <select
                  className="sspp-assign-select"
                  defaultValue=""
                  onChange={(e) => {
                    const picked = pool.find((x) => x.id === e.target.value);
                    if (!picked) return;
                    assignProvider(m.id, {
                      id: picked.id,
                      kind: m.category === "unit" ? "unit" : "ambassador",
                      name: picked.name,
                      ...(m.category === "unit"
                        ? { location: picked.location }
                        : { rank: picked.rank, appointment: picked.appointment }),
                    });
                    e.target.value = "";
                  }}
                >
                  <option value="" disabled>
                    Assign a provider...
                  </option>
                  {pool.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.rank ? `${x.rank} ${x.name}` : x.name}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      )}

      {stats.staleSchools.length > 0 && (
        <div className="rounded-lg border border-[#F5C6C6] bg-[#FEF2F2] p-5 mb-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#FEE2E2] flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#B91C1C]">
                {stats.staleSchools.length} school{stats.staleSchools.length > 1 ? "s" : ""} waiting {STALE_AFTER_DAYS}+ days
              </p>
              <p className="text-xs text-[#78716C] mt-0.5 mb-3">
                Still unmatched. Needs follow-up on unit or ambassador availability.
              </p>
              <div className="space-y-1.5">
                {stats.staleSchools.map((s) => (
                  <div key={s.school} className="flex items-center justify-between gap-3 bg-white rounded-md px-3 py-2">
                    <span className="text-sm text-[#1C1917] truncate">{s.school}</span>
                    <span className="text-xs font-medium text-[#B91C1C] shrink-0">
                      waiting {s.waitingDays} days
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate("/admin/approvals")}
                className="text-xs text-[#B91C1C] font-medium hover:underline mt-3"
              >
                Go to approvals →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming engagements — the heads-up */}
      <div className="card overflow-hidden">
        <div className="px-6 py-5 border-b border-[#E7E5E4] flex items-center justify-between">
          <div>
            <h2 className="text-xl" style={{ fontFamily: "var(--font-display)" }}>
              Upcoming engagements
            </h2>
            <p className="text-xs text-[#78716C] mt-0.5">Confirmed and on the calendar, soonest first</p>
          </div>
          <span className="text-sm text-[#78716C]">{stats.upcoming.length} scheduled</span>
        </div>

        {stats.upcoming.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-[#78716C]">No upcoming engagements scheduled.</p>
          </div>
        ) : (
          <DataTable>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#78716C] bg-[#FAFAF9] border-b border-[#E7E5E4]">
                <th className="px-6 py-4 font-medium">School</th>
                <th className="px-6 py-4 font-medium">Engaging</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Pax</th>
                <th className="px-6 py-4 font-medium text-right">In</th>
              </tr>
            </thead>
            <tbody>
              {stats.upcoming.map((m) => {
                const inDays = daysUntil(m.date);
                const soon = inDays <= 7;
                return (
                  <tr key={m.id} className="border-b border-[#F5F5F4] last:border-0">
                    <td className="px-6 py-4 font-medium align-middle">{m.school}</td>
                    <td className="px-6 py-4 align-middle">
                      <TargetSummary target={m.target} compact />
                    </td>
                    <td className="px-6 py-4 text-[#57534E] align-middle">{fmtDate(m.date)}</td>
                    <td className="px-6 py-4 text-right align-middle text-[#57534E]">
                      {m.participants}
                    </td>
                    <td className="px-6 py-4 text-right align-middle">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          soon ? "bg-[#FEF3C7] text-[#B45309]" : "bg-[#F5F5F4] text-[#57534E]"
                        }`}
                      >
                        {inDays === 0 ? "Today" : inDays === 1 ? "Tomorrow" : `${inDays} days`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </DataTable>
        )}
      </div>
    </>
  );
}
