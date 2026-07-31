import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import StatusBadge from "../../components/common/StatusBadge";
import { useAuth } from "../../hooks/useAuth";
import { useEngagements } from "../../hooks/useEngagements";
import { useTiers } from "../../hooks/useTiers";
import { TAB, linkToTab } from "../../utils/tabs";

const DAY = 24 * 60 * 60 * 1000;
const daysUntil = (iso) =>
  iso ? Math.ceil((new Date(iso).getTime() - Date.now()) / DAY) : null;

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-SG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function ArmyDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { matches } = useEngagements();
  const { getTier } = useTiers();

  const isAmbassador = user?.role === "army-ambassador";
  const providerKind = isAmbassador ? "ambassador" : "unit";

  const stats = useMemo(() => {
    // Engagements that involve this kind of provider.
    // TODO(real-auth): filter to the logged-in provider's own id once the
    // backend issues identity — for now demo login can't tell us WHICH
    // unit/ambassador this is.
    const mine = matches.filter(
      (m) => m.status !== "Cancelled" && m.roster?.some((r) => r.kind === providerKind)
    );

    const toConfirm = mine.filter((m) => m.status === "Awaiting confirmation");
    const confirmed = mine.filter((m) => m.status === "Confirmed");

    const upcoming = confirmed
      .filter((m) => m.date && daysUntil(m.date) >= 0)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const past = confirmed
      .filter((m) => m.date && daysUntil(m.date) < 0)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    const schoolsReached = new Set(confirmed.map((m) => m.school)).size;
    const studentsReached = confirmed.reduce((sum, m) => sum + (m.participants || 0), 0);

    return { mine, toConfirm, confirmed, upcoming, past, schoolsReached, studentsReached };
  }, [matches, providerKind]);

  const nextUp = stats.upcoming[0];
  const nextInDays = nextUp ? daysUntil(nextUp.date) : null;

  // Each stat card deep-links into the matching tab of My Engagements, so a
  // click lands on exactly the list the number represents.
  const goToEngagements = (tabKey) =>
    navigate(tabKey ? linkToTab("/army/engagements", tabKey) : "/army/engagements");

  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title={isAmbassador ? "My Dashboard" : "Unit Dashboard"}
        subtitle={
          isAmbassador
            ? "Your engagements at a glance"
            : "Your unit's engagements at a glance"
        }
      />

      <div className="sspp-stat-row">
        <StatCard
          label="To confirm"
          value={stats.toConfirm.length}
          valueColor={stats.toConfirm.length > 0 ? "#B45309" : "#16A34A"}
          hint={stats.toConfirm.length > 0 ? "Needs your action" : "All caught up"}
          onClick={() => goToEngagements(TAB.AWAITING)}
        />
        <StatCard
          label="Upcoming"
          value={stats.upcoming.length}
          valueColor="#2563EB"
          hint="View engagements"
          onClick={() => goToEngagements(TAB.CONFIRMED)}
        />
        <StatCard
          label="Completed"
          value={stats.past.length}
          valueColor="#16A34A"
          hint="View engagements"
          onClick={() => goToEngagements(TAB.CONFIRMED)}
        />
        <StatCard label="Schools reached" value={stats.schoolsReached} />
        <StatCard
          label="Students reached"
          value={stats.studentsReached.toLocaleString()}
        />
      </div>

      {/* Anything waiting on this provider gets surfaced first. */}
      {stats.toConfirm.length > 0 && (
        <div className="sspp-alert sspp-alert--warning">
          <div>
            <p className="sspp-alert-title">
              {stats.toConfirm.length} engagement
              {stats.toConfirm.length > 1 ? "s" : ""} waiting for your confirmation
            </p>
            <p className="sspp-alert-body">
              The school has already picked you. Confirming locks in the date.
            </p>
          </div>
          <button className="sspp-alert-action" onClick={() => goToEngagements(TAB.AWAITING)}>
            Review now →
          </button>
        </div>
      )}

      {nextUp && (
        <div className="card sspp-next-up">
          <p className="sspp-next-up-label">Next engagement</p>
          <p className="sspp-next-up-school">{nextUp.school}</p>
          <p className="sspp-next-up-meta">
            {fmtDate(nextUp.date)} · {nextUp.participants} pax ·{" "}
            {getTier(nextUp.tier)?.short ?? nextUp.tier}
          </p>
          <span className="sspp-next-up-countdown">
            {nextInDays === 0
              ? "Today"
              : nextInDays === 1
              ? "Tomorrow"
              : `In ${nextInDays} days`}
          </span>
        </div>
      )}

      <div className="card sspp-panel">
        <div className="sspp-panel-head">
          <h2>Upcoming engagements</h2>
          {stats.upcoming.length > 0 && (
            <button className="sspp-link-button" onClick={() => goToEngagements(TAB.CONFIRMED)}>
              View all
            </button>
          )}
        </div>

        {stats.upcoming.length === 0 ? (
          <p className="sspp-empty">
            No confirmed engagements coming up.
            {stats.toConfirm.length > 0 && " Confirm the requests above to schedule them."}
          </p>
        ) : (
          stats.upcoming.slice(0, 5).map((m) => (
            <button key={m.id} className="sspp-row-button" onClick={() => goToEngagements(TAB.CONFIRMED)}>
              <div>
                <p className="sspp-row-title">{m.school}</p>
                <p className="sspp-row-meta">
                  {fmtDate(m.date)} · {m.participants} pax
                </p>
              </div>
              <StatusBadge status={m.status} />
            </button>
          ))
        )}
      </div>

      <div className="card sspp-panel">
        <h2>Past engagements</h2>
        {stats.past.length === 0 ? (
          <p className="sspp-empty">No completed engagements yet.</p>
        ) : (
          <div className="sspp-table-shell">
            <table>
              <thead>
                <tr>
                  <th>School</th>
                  <th>Date</th>
                  <th>Tier</th>
                  <th className="sspp-cell-right">Pax</th>
                </tr>
              </thead>
              <tbody>
                {stats.past.map((m) => (
                  <tr key={m.id}>
                    <td className="sspp-cell-strong">{m.school}</td>
                    <td>{fmtDate(m.date)}</td>
                    <td>{getTier(m.tier)?.short ?? m.tier}</td>
                    <td className="sspp-cell-right">{m.participants}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
