import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import TargetSummary from "../../components/common/TargetSummary";
import EngagementRoster from "../../components/common/EngagementRoster";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import { useModal } from "../../hooks/useModal";
import { useEngagements } from "../../hooks/useEngagements";
import { getTier, TIMING_SLOTS } from "../../data/options";
import TabFilter from "../../components/common/TabFilter";
import { TAB, tabsFor, applyTab, resolveTab, TAB_PARAM } from "../../utils/tabs";
import DataTable from "../../components/common/DataTable";

const timingLabel = (v) => TIMING_SLOTS.find((t) => t.value === v)?.label ?? v;
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" });

// Shared tab definitions — same everywhere (see utils/tabs.js).
const TABS = tabsFor([TAB.OPEN, TAB.AWAITING, TAB.CONFIRMED, TAB.CANCELLED, TAB.ALL]);

function DetailRow({ label, children }) {
  return (
    <div className="mb-4">
      <p className="text-[11px] uppercase tracking-wide text-[#A8A29E]">{label}</p>
      <div className="text-sm text-[#1C1917] mt-0.5">{children}</div>
    </div>
  );
}

export default function MatchManagementPage() {
  const { matches, resetDemo, removeVolunteer } = useEngagements();
  const { open, payload, openModal, closeModal } = useModal();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(TAB.AWAITING);

  // Dashboard stat cards deep-link here, e.g. /admin/approvals?tab=confirmed
  useEffect(() => {
    setTab(resolveTab(searchParams.get(TAB_PARAM), TABS, TAB.AWAITING));
  }, [searchParams]);

  const activeTab = TABS.find((t) => t.key === tab) ?? TABS[0];
  const rows = applyTab(matches, activeTab)
    .slice()
    .sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(a.date) - new Date(b.date);
    });
  const liveMatch = payload ? matches.find((m) => m.id === payload.id) ?? payload : null;

  return (
    <>
      <PageHeader
        eyebrow="Match Results"
        title="Engagement matches"
        subtitle="Monitoring only — providers confirm their own engagements"
        action={
          <Button variant="ghost" size="sm" onClick={resetDemo}>
            Reset demo data
          </Button>
        }
      />

      <TabFilter tabs={TABS} value={tab} onChange={setTab} items={matches} />

      <div className="card overflow-hidden">
        {rows.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-[#78716C]">No engagements in this view.</p>
          </div>
        ) : (
          <DataTable>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#78716C] bg-[#FAFAF9] border-b border-[#E7E5E4]">
                <th className="px-6 py-4 font-medium">Code</th>
                <th className="px-6 py-4 font-medium">School</th>
                <th className="px-6 py-4 font-medium">Engaging</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Confirmed</th>
                <th className="px-6 py-4 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => {
                const done = m.roster?.filter((r) => r.confirmed).length ?? 0;
                const total = m.roster?.length ?? 0;
                return (
                  <tr
                    key={m.id}
                    onClick={() => openModal(m)}
                    className="border-b border-[#F5F5F4] last:border-0 hover:bg-[#FAFAF9] cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 text-[#78716C] align-middle">{m.id}</td>
                    <td className="px-6 py-4 font-medium align-middle">{m.school}</td>
                    <td className="px-6 py-4 align-middle">
                      <TargetSummary target={m.target} compact />
                    </td>
                    <td className="px-6 py-4 text-[#57534E] align-middle">{fmtDate(m.date)}</td>
                    <td className="px-6 py-4 align-middle text-[#57534E]">
                      {done}/{total}
                    </td>
                    <td className="px-6 py-4 text-right align-middle">
                      <StatusBadge status={m.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </DataTable>
        )}
      </div>

      <Modal
        open={open}
        onClose={closeModal}
        title="Engagement details"
        subtitle={liveMatch?.id}
        variant="drawer"
      >
        {liveMatch && (
          <>
            <div className="flex justify-end mb-6">
              <StatusBadge status={liveMatch.status} />
            </div>

            <DetailRow label="School">{liveMatch.school}</DetailRow>
            <DetailRow label="Requested">
              <TargetSummary target={liveMatch.target} />
            </DetailRow>

            <div className="h-px bg-[#E7E5E4] my-6" />

            <DetailRow label="Date">{fmtDate(liveMatch.date)}</DetailRow>
            <DetailRow label="Timing">
              {liveMatch.timings?.map(timingLabel).join(", ") || "—"}
            </DetailRow>
            <DetailRow label="Engagement tier">
              {getTier(liveMatch.tier)?.name ?? liveMatch.tier}
            </DetailRow>
            <DetailRow label="Size">{liveMatch.participants} pax</DetailRow>
            {liveMatch.notes && <DetailRow label="Notes">{liveMatch.notes}</DetailRow>}

            <div className="h-px bg-[#E7E5E4] my-6" />

            <EngagementRoster match={liveMatch} />

            {/* Admin-only: providers can't withdraw once volunteered, so this is
                the only place a volunteer can be pulled from a request. */}
            {(liveMatch.roster?.length ?? 0) > 0 && (
              <div className="mt-6">
                <p className="text-[11px] uppercase tracking-wide text-[#A8A29E] mb-2">
                  Remove a volunteer (admin only)
                </p>
                <div className="space-y-2">
                  {liveMatch.roster.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-[#E7E5E4] px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-[#1C1917] truncate">
                          {r.rank ? `${r.rank} ${r.name}` : r.name}
                        </p>
                        <p className="text-xs text-[#78716C]">
                          {r.confirmed ? "Confirmed" : "Volunteered"}
                        </p>
                      </div>
                      <button
                        onClick={() => removeVolunteer(liveMatch.id, r.id)}
                        className="text-xs text-[#B91C1C] hover:underline shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8">
              <Button variant="secondary" fullWidth onClick={closeModal}>
                Close
              </Button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
