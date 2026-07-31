import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import TargetSummary from "../../components/common/TargetSummary";
import Button from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import Modal from "../../components/common/Modal";
import { useModal } from "../../hooks/useModal";
import { useAuth } from "../../hooks/useAuth";
import { useEngagements, slotsRemaining, ownedBySchool } from "../../hooks/useEngagements";
import { TIMING_SLOTS } from "../../data/options";
import { useTiers } from "../../hooks/useTiers";
import DataTable from "../../components/common/DataTable";
import TabFilter from "../../components/common/TabFilter";
import { TAB, tabsFor, applyTab, resolveTab, TAB_PARAM } from "../../utils/tabs";

// Shared tab definitions — same everywhere (see utils/tabs.js).
const TABS = tabsFor([TAB.ALL, TAB.OPEN, TAB.AWAITING, TAB.CONFIRMED, TAB.CANCELLED]);

const timingLabel = (v) => TIMING_SLOTS.find((t) => t.value === v)?.label ?? v;

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" });

function DetailRow({ label, children }) {
  return (
    <div className="mb-4">
      <p className="text-[11px] uppercase tracking-wide text-[#A8A29E]">{label}</p>
      <div className="text-sm text-[#1C1917] mt-0.5">{children}</div>
    </div>
  );
}

export default function InterestFormsPage() {
  const { user } = useAuth();
  const { interestForms, matches, withdrawInterest, updateOpenRequest, confirmVolunteer } =
    useEngagements();
  const { getTier } = useTiers();
  const { open, payload, openModal, closeModal } = useModal();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(TAB.ALL);
  const [editing, setEditing] = useState(null); // { volunteersNeeded, participants }

  // Dashboard stat cards deep-link here, e.g. /school/interest-forms?tab=awaiting
  useEffect(() => {
    setTab(resolveTab(searchParams.get(TAB_PARAM), TABS, TAB.ALL));
  }, [searchParams]);

  // Only THIS school's requests — all approved users can read every form.
  const myForms = useMemo(
    () => interestForms.filter((f) => ownedBySchool(f, user)),
    [interestForms, user]
  );

  const activeTab = TABS.find((t) => t.key === tab) ?? TABS[0];
  const rows = useMemo(() => applyTab(myForms, activeTab), [myForms, activeTab]);

  const handleWithdraw = (id) => {
    withdrawInterest(id);
    closeModal();
  };

  return (
    <>
      <PageHeader
        eyebrow="My Interest Form"
        title="Track submitted requests"
        subtitle="Requests stay awaiting until the unit or ambassadors you picked confirm"
      />

      {myForms.length > 0 && (
        <TabFilter tabs={TABS} value={tab} onChange={setTab} items={myForms} />
      )}

      <div className="card overflow-hidden">
        {rows.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-[#78716C]">
              {myForms.length === 0
                ? "No requests yet. Browse units or ambassadors to submit one."
                : `No ${activeTab.label.toLowerCase()} requests.`}
            </p>
          </div>
        ) : (
          <DataTable>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#78716C] bg-[#FAFAF9] border-b border-[#E7E5E4]">
                <th className="px-6 py-4 font-medium">Form ID</th>
                <th className="px-6 py-4 font-medium">Requested</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Tier</th>
                <th className="px-6 py-4 font-medium">Pax</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((f) => (
                <tr
                  key={f.id}
                  onClick={() => openModal(f)}
                  className="border-b border-[#F5F5F4] last:border-0 hover:bg-[#FAFAF9] cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 text-[#78716C] align-top">{f.id}</td>
                  <td className="px-6 py-4 align-top">
                    <TargetSummary target={f.target} compact />
                  </td>
                  <td className="px-6 py-4 text-[#57534E] align-top">{fmtDate(f.date)}</td>
                  <td className="px-6 py-4 text-[#57534E] align-top">
                    {getTier(f.tier)?.short ?? f.tier}
                  </td>
                  <td className="px-6 py-4 text-[#57534E] align-top">{f.participants}</td>
                  <td className="px-6 py-4 align-top">
                    <StatusBadge status={f.status} />
                  </td>
                  <td className="px-6 py-4 text-right align-top">
                    {f.status === "Awaiting confirmation" ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          withdrawInterest(f.id);
                        }}
                        className="text-xs text-[#B91C1C] hover:underline"
                      >
                        Withdraw
                      </button>
                    ) : (
                      <span className="text-[#A8A29E] text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </DataTable>
        )}
      </div>

      <Modal
        open={open}
        onClose={closeModal}
        title="Request details"
        subtitle={payload?.id}
        variant="drawer"
      >
        {payload && (
          <>
            <div className="flex justify-end mb-6">
              <StatusBadge status={payload.status} />
            </div>

            <DetailRow label="Requested">
              <TargetSummary target={payload.target} showRoster />
            </DetailRow>

            <div className="h-px bg-[#E7E5E4] my-6" />

            <DetailRow label="Preferred date">{fmtDate(payload.date)}</DetailRow>
            <DetailRow label="Preferred timing">
              {payload.timings?.map(timingLabel).join(", ") || "—"}
            </DetailRow>
            <DetailRow label="Engagement tier">
              {getTier(payload.tier)?.name ?? payload.tier}
            </DetailRow>
            <DetailRow label="Size">{payload.participants} pax</DetailRow>
            {payload.notes && <DetailRow label="Notes">{payload.notes}</DetailRow>}

            {/* Open request: show how it's filling up, and let the school widen
                it. Once someone has volunteered the target can only go UP —
                you can't un-volunteer a provider who already committed. */}
            {payload.isOpen && payload.status === "Open" && (() => {
              const match = matches.find((m) => m.id === payload.matchId);
              if (!match) return null;
              const filled = match.roster?.length ?? 0;
              const needed = match.volunteersNeeded ?? 1;

              return (
                <div className="sspp-open-status">
                  <p className="sspp-open-status-title">
                    Waiting for volunteers — {filled} of {needed} filled
                  </p>
                  <p className="sspp-open-status-body">
                    Matching providers can see this request and volunteer.
                  </p>

                  {editing ? (
                    <div className="sspp-open-edit">
                      <Input
                        label="Volunteers needed"
                        type="number"
                        min={filled || 1}
                        hintText={
                          filled > 0
                            ? `Can't go below ${filled} — that many have already volunteered.`
                            : undefined
                        }
                        value={editing.volunteersNeeded}
                        onChange={(e) =>
                          setEditing((x) => ({ ...x, volunteersNeeded: e.target.value }))
                        }
                      />
                      <Input
                        label="Size (pax)"
                        type="number"
                        min="1"
                        value={editing.participants}
                        onChange={(e) =>
                          setEditing((x) => ({ ...x, participants: e.target.value }))
                        }
                      />
                      <div className="sspp-open-edit-actions">
                        <Button variant="secondary" size="sm" onClick={() => setEditing(null)}>
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            updateOpenRequest(payload.matchId, {
                              volunteersNeeded: Number(editing.volunteersNeeded) || needed,
                              participants: Number(editing.participants) || match.participants,
                            });
                            setEditing(null);
                          }}
                        >
                          Save changes
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setEditing({
                          volunteersNeeded: String(needed),
                          participants: String(match.participants ?? ""),
                        })
                      }
                    >
                      Edit request
                    </Button>
                  )}
                </div>
              );
            })()}

            {/* Volunteers for an open request — the school picks who it wants. */}
            {payload.isOpen && (() => {
              const match = matches.find((m) => m.id === payload.matchId);
              const roster = match?.roster ?? [];
              if (roster.length === 0) return null;
              const need = match.volunteersNeeded ?? 1;
              const confirmedCount = roster.filter((r) => r.confirmed).length;
              return (
                <div className="mt-6">
                  <p className="text-[11px] uppercase tracking-wide text-[#A8A29E] mb-2">
                    Volunteers — choose who you want ({confirmedCount}/{need} confirmed)
                  </p>
                  <div className="space-y-2">
                    {roster.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-[#E7E5E4] px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="text-sm text-[#1C1917] truncate">
                            {r.rank ? `${r.rank} ${r.name}` : r.name}
                          </p>
                          {(r.appointment || r.location) && (
                            <p className="text-xs text-[#78716C] truncate">
                              {r.appointment || r.location}
                            </p>
                          )}
                        </div>
                        {r.confirmed ? (
                          <span className="text-xs text-[#15803D] font-medium shrink-0">Chosen ✓</span>
                        ) : confirmedCount >= need ? (
                          <span className="text-xs text-[#A8A29E] shrink-0">Full</span>
                        ) : (
                          <Button size="sm" onClick={() => confirmVolunteer(payload.matchId, r.id)}>
                            Choose
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {payload.status === "Confirmed" && payload.matchId && (
              <div className="rounded-lg bg-[#DCFCE7] text-[#15803D] px-4 py-3 text-sm mt-6">
                Confirmed — see it under My Matches as {payload.matchId}.
              </div>
            )}

            {payload.status === "Cancelled" && payload.rejectionReason && (
              <div className="rounded-lg bg-[#FEE2E2] text-[#B91C1C] px-4 py-3 text-sm mt-6">
                {payload.rejectionReason}
              </div>
            )}

            <div className="flex gap-3 mt-8">
              <Button variant="secondary" fullWidth onClick={closeModal}>
                Close
              </Button>
              {(payload.status === "Awaiting confirmation" || payload.status === "Open") && (
                <Button variant="danger" fullWidth onClick={() => handleWithdraw(payload.id)}>
                  Withdraw
                </Button>
              )}
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
