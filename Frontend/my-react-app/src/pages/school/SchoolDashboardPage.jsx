import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import StatusBadge from "../../components/common/StatusBadge";
import TargetSummary from "../../components/common/TargetSummary";
import { useAuth } from "../../hooks/useAuth";
import { useEngagements, ownedBySchool } from "../../hooks/useEngagements";
import { useTiers } from "../../hooks/useTiers";
import { TAB, linkToTab } from "../../utils/tabs";
import DataTable from "../../components/common/DataTable";

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" });

export default function SchoolDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { interestForms, matches } = useEngagements();
  const { getTier } = useTiers();

  // Scope to THIS school — everyone can read all engagements, so the dashboard
  // must filter to its own or it counts every school's activity.
  const myForms = interestForms.filter((f) => ownedBySchool(f, user));
  const myMatches = matches.filter((m) => ownedBySchool(m, user));

  const engaged = myMatches.filter((m) => m.status === "Confirmed").length;
  const pending = myForms.filter((f) => f.status === "Awaiting confirmation").length;
  // Open requests are waiting on volunteers rather than on a chosen provider,
  // so they're counted separately — otherwise posting one shows up nowhere.
  const openRequests = myForms.filter((f) => f.status === "Open").length;

  // Most recent activity across both lists, newest first
  const recent = [...myForms]
    .sort((a, b) => new Date(b.submittedAt ?? 0) - new Date(a.submittedAt ?? 0))
    .slice(0, 5);

  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title="Overall School's Engagement"
        subtitle="Engagement analytics for the past year"
      />

      <div className="sspp-stat-row">
        <StatCard
          label="Engaged"
          value={engaged}
          valueColor="#16A34A"
          hint="View my matches"
          onClick={() => navigate(linkToTab("/school/matches", TAB.CONFIRMED))}
        />
        <StatCard
          label="Interest Forms"
          value={myForms.length}
          hint="View all requests"
          onClick={() => navigate(linkToTab("/school/interest-forms", TAB.ALL))}
        />
        <StatCard
          label="Open requests"
          value={openRequests}
          valueColor={openRequests > 0 ? "#2563EB" : undefined}
          hint="Waiting for volunteers"
          onClick={() => navigate(linkToTab("/school/interest-forms", TAB.OPEN))}
        />
        <StatCard
          label="Awaiting confirmation"
          value={pending}
          valueColor="#D97706"
          hint="View awaiting requests"
          onClick={() => navigate(linkToTab("/school/interest-forms", TAB.AWAITING))}
        />
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl" style={{ fontFamily: "var(--font-display)" }}>
            Recent activity
          </h2>
          {myForms.length > 0 && (
            <button
              onClick={() => navigate("/school/interest-forms")}
              className="text-xs text-[#2563EB] hover:underline"
            >
              View all
            </button>
          )}
        </div>

        {recent.length === 0 ? (
          <p className="text-sm text-[#78716C] py-8 text-center">
            No engagements yet. Browse units or ambassadors to submit your first interest form.
          </p>
        ) : (
          <DataTable>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#78716C] border-b border-[#E7E5E4]">
                <th className="pb-3 font-medium">Form</th>
                <th className="pb-3 font-medium">Requested</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Tier</th>
                <th className="pb-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((f) => (
                <tr key={f.id} className="border-b border-[#F5F5F4] last:border-0">
                  <td className="py-4 text-[#78716C] align-top">{f.id}</td>
                  <td className="py-4 align-top">
                    <TargetSummary target={f.target} compact />
                  </td>
                  <td className="py-4 text-[#57534E] align-top">{fmtDate(f.date)}</td>
                  <td className="py-4 text-[#57534E] align-top">
                    {getTier(f.tier)?.short ?? f.tier}
                  </td>
                  <td className="py-4 text-right align-top">
                    <StatusBadge status={f.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </DataTable>
        )}
      </div>
    </>
  );
}
