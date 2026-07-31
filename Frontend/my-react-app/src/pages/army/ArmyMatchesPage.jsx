import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import EngagementRoster from "../../components/common/EngagementRoster";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import { useModal } from "../../hooks/useModal";
import { useAuth } from "../../hooks/useAuth";
import { useEngagements, canWithdrawVolunteer } from "../../hooks/useEngagements";
import { TIMING_SLOTS } from "../../data/options";
import { useTiers } from "../../hooks/useTiers";
import TabFilter from "../../components/common/TabFilter";
import { TAB, tabsFor, applyTab, resolveTab, TAB_PARAM } from "../../utils/tabs";

const timingLabel = (v) => TIMING_SLOTS.find((t) => t.value === v)?.label ?? v;
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-SG", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

function DetailRow({ label, children }) {
  return (
    <div className="mb-4">
      <p className="text-[11px] uppercase tracking-wide text-[#A8A29E]">{label}</p>
      <div className="text-sm text-[#1C1917] mt-0.5">{children}</div>
    </div>
  );
}

// Shared tab definitions — same everywhere (see utils/tabs.js).
// "Awaiting" is what used to be called "To confirm" here; the label is now
// consistent with the school and admin views.
const TABS = tabsFor([TAB.ALL, TAB.AWAITING, TAB.CONFIRMED, TAB.COMPLETED, TAB.CANCELLED]);

export default function ArmyMatchesPage() {
  const { user } = useAuth();
  const { matches, confirmAsUnit, confirmAsAmbassador, removeVolunteer } = useEngagements();
  const { getTier } = useTiers();
  const { open, payload, openModal, closeModal } = useModal();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(TAB.AWAITING);

  // Dashboard stat cards deep-link here, e.g. /army/engagements?tab=confirmed
  useEffect(() => {
    setTab(resolveTab(searchParams.get(TAB_PARAM), TABS, TAB.AWAITING));
  }, [searchParams]);

  const isAmbassador = user?.role === "army-ambassador";

  // Demo identity: real auth would tell us WHICH unit/ambassador this is. Until
  // then, the army user can act on any request of their provider kind, and we
  // treat every roster member of that kind as "them" for the confirm button.
  // TODO(real-auth): filter to the logged-in provider's own id.
  const providerKind = isAmbassador ? "ambassador" : "unit";

  // TODO(real-auth): the backend will tell us exactly who this is. Until then
  // we derive a stable demo identity so volunteering has something to record.
  const myProviderId = user?.providerId ?? (isAmbassador ? "amb-demo" : "unit-demo");
  const myProviderName =
    user?.fullName ?? user?.schoolName ?? (isAmbassador ? "You" : "Your unit");

  // Matches this provider is actually on (in the roster) — includes cancelled
  // ones so the Cancelled tab has something to show.
  const relevant = useMemo(
    () => matches.filter((m) => m.roster?.some((r) => r.id === myProviderId)),
    [matches, myProviderId]
  );

  // Open requests this provider could volunteer for. A school posts these
  // when nobody in Browse suited them, aimed at a category:
  //   "unit"                  -> army units
  //   "cert" / "individual_ambassador" -> ambassadors
  const openRequests = useMemo(() => {
    const wantsMe = (m) =>
      providerKind === "unit"
        ? m.category === "unit"
        : m.category === "cert" || m.category === "individual_ambassador";

    return matches
      .filter((m) => m.isOpen && m.status === "Open" && wantsMe(m))
      .filter((m) => !(m.roster ?? []).some((r) => r.id === myProviderId))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [matches, providerKind, myProviderId]);

  const activeTab = TABS.find((t) => t.key === tab) ?? TABS[0];

  const rows = useMemo(
    () =>
      [...applyTab(relevant, activeTab)].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      ),
    [relevant, activeTab]
  );

  // For the drawer: only THIS provider's own still-unconfirmed roster entry.
  // A unit is a single roster member of its kind; an ambassador must match
  // their own providerId so they can never act on another volunteer's entry.
  const pendingMine = (m) =>
    (m?.roster ?? []).filter((r) =>
      r.confirmed
        ? false
        : providerKind === "unit"
        ? r.kind === "unit"
        : r.id === myProviderId
    );

  const handleConfirm = (m, memberId) => {
    if (providerKind === "unit") confirmAsUnit(m.id);
    else confirmAsAmbassador(m.id, memberId);
    // The drawer reads `liveMatch` (below), so it refreshes automatically.
  };

  // Always render the drawer from live state, not the snapshot captured when it
  // opened — so confirming updates the roster in place.
  const liveMatch = payload ? matches.find((m) => m.id === payload.id) ?? payload : null;

  return (
    <>
      <PageHeader
        eyebrow="My Engagements"
        title="My Engagements"
        subtitle={
          isAmbassador
            ? "Confirm your attendance so the school knows you're coming"
            : "Confirm engagements your unit has been matched to"
        }
      />

      {/* Schools' open requests live on their own page now — this is just a
          pointer so providers know there's something to pick up. */}
      {openRequests.length > 0 && (
        <div className="sspp-requests-pointer">
          <div>
            <p className="sspp-requests-pointer-title">
              {openRequests.length} school{openRequests.length > 1 ? "s are" : " is"} looking
              for help
            </p>
            <p className="sspp-requests-pointer-body">
              Requests you could volunteer for.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/army/requests")}>
            Browse requests
          </Button>
        </div>
      )}

      <TabFilter tabs={TABS} value={tab} onChange={setTab} items={relevant} />


      {rows.length === 0 ? (
        <div className="card py-16 text-center">
          <p className="text-sm text-[#78716C]">
            {tab === TAB.AWAITING
              ? "Nothing to confirm right now."
              : tab === TAB.CONFIRMED
              ? "No confirmed engagements yet."
              : "No engagements yet."}
          </p>
        </div>
      ) : (
        rows.map((m) => {
          // Open requests are school-confirmed, so providers never "confirm"
          // them — they just show as volunteered until the school decides.
          // A cancelled match never needs confirming, even if its roster was
          // never fully signed off before it was called off.
          const needsMe = !m.isOpen && m.status !== "Cancelled" && pendingMine(m).length > 0;
          return (
            <button
              key={m.id}
              onClick={() => openModal(m)}
              className="card w-full text-left px-6 py-5 flex items-center justify-between gap-4 mb-4 hover:border-[#A8A29E] transition-colors"
            >
              <div className="min-w-0">
                <p className="text-xs text-[#A8A29E] mb-1">Code: {m.id}</p>
                <p className="font-semibold text-[#1C1917]">{m.school}</p>
                <p className="text-sm text-[#78716C] mt-0.5">
                  {fmtDate(m.date)} · {m.participants} pax · {getTier(m.tier)?.short ?? m.tier}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {m.isOpen && m.status !== "Confirmed" ? (
                  <span className="px-2.5 py-1 rounded-full bg-[#F5F5F4] text-[#57534E] text-xs font-medium">
                    Volunteered
                  </span>
                ) : needsMe ? (
                  <span className="px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#B45309] text-xs font-medium">
                    {isAmbassador ? "Confirm attendance" : "Confirm"}
                  </span>
                ) : null}
                <StatusBadge status={m.status} />
              </div>
            </button>
          );
        })
      )}

      <Modal
        open={open}
        onClose={closeModal}
        title="Engagement details"
        subtitle={liveMatch?.school}
        variant="drawer"
      >
        {liveMatch && (
          <>
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs text-[#A8A29E]">Code: {liveMatch.id}</span>
              <StatusBadge status={liveMatch.status} />
            </div>

            <DetailRow label="Date & timing">
              {fmtDate(liveMatch.date)}
              <p className="text-[#78716C]">{liveMatch.timings?.map(timingLabel).join(", ")}</p>
            </DetailRow>
            <DetailRow label="Engagement tier">{getTier(liveMatch.tier)?.name ?? liveMatch.tier}</DetailRow>
            <DetailRow label="Size">{liveMatch.participants} students</DetailRow>
            {liveMatch.notes && <DetailRow label="Notes">{liveMatch.notes}</DetailRow>}

            <div className="h-px bg-[#E7E5E4] my-6" />

            <EngagementRoster match={liveMatch} />

            {/* Open requests are confirmed by the SCHOOL, so this is read-only
                for providers: they see who volunteered but can't confirm or
                withdraw. Direct-interest matches keep provider self-confirm.
                A cancelled match gets neither — there's nothing left to do. */}
            {liveMatch.status === "Cancelled" ? (
              <div className="rounded-lg bg-[#FEE2E2] text-[#B91C1C] px-4 py-3 text-sm mt-6">
                This engagement was cancelled.
              </div>
            ) : liveMatch.isOpen ? (
              <div className="mt-6 space-y-3">
                {liveMatch.status !== "Confirmed" && (
                  <div className="rounded-lg bg-[#FEF3C7] text-[#B45309] px-4 py-3 text-sm">
                    You've volunteered. The school will confirm which volunteers it wants.
                  </div>
                )}
                {canWithdrawVolunteer(liveMatch) ? (
                  <Button
                    variant="danger"
                    fullWidth
                    onClick={() => {
                      removeVolunteer(liveMatch.id, myProviderId);
                      closeModal();
                    }}
                  >
                    Withdraw from this request
                  </Button>
                ) : (
                  <p className="text-xs text-[#78716C] text-center">
                    You can't withdraw within a month of the event — contact an admin to be removed.
                  </p>
                )}
              </div>
            ) : (
              pendingMine(liveMatch).length > 0 && (
                <div className="mt-6 space-y-2">
                  {providerKind === "unit" ? (
                    <Button fullWidth onClick={() => handleConfirm(liveMatch)}>
                      Confirm engagement
                    </Button>
                  ) : (
                    pendingMine(liveMatch).map((r) => (
                      <Button key={r.id} fullWidth onClick={() => handleConfirm(liveMatch, r.id)}>
                        Confirm attendance — {r.rank} {r.name}
                      </Button>
                    ))
                  )}
                  <p className="text-xs text-[#78716C] text-center">
                    Confirming locks you in for this engagement. It can't be undone here.
                  </p>
                </div>
              )
            )}

            {liveMatch.status === "Confirmed" && (
              <div className="rounded-lg bg-[#DCFCE7] text-[#15803D] px-4 py-3 text-sm mt-6">
                Everyone's confirmed. This engagement is locked in.
              </div>
            )}

            <div className="mt-6">
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
