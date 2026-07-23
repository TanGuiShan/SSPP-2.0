import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import EngagementRoster from "../../components/common/EngagementRoster";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import { useModal } from "../../hooks/useModal";
import { useAuth } from "../../hooks/useAuth";
import { useEngagements } from "../../hooks/useEngagements";
import { getTier, TIMING_SLOTS } from "../../data/options";
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
const TABS = tabsFor([TAB.AWAITING, TAB.CONFIRMED, TAB.ALL]);

export default function ArmyMatchesPage() {
  const { user } = useAuth();
  const { matches, confirmAsUnit, confirmAsAmbassador } = useEngagements();
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

  // Matches that involve this provider kind (exclude cancelled).
  const relevant = useMemo(
    () =>
      matches.filter(
        (m) => m.status !== "Cancelled" && m.roster?.some((r) => r.kind === providerKind)
      ),
    [matches, providerKind]
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

  // For the drawer: the roster members of this kind that still need confirming.
  const pendingMine = (m) =>
    (m?.roster ?? []).filter((r) => r.kind === providerKind && !r.confirmed);

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
          const mine = pendingMine(m);
          const needsMe = mine.length > 0;
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
                {needsMe && (
                  <span className="px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#B45309] text-xs font-medium">
                    {isAmbassador ? "Confirm attendance" : "Confirm"}
                  </span>
                )}
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

            {/* Confirm actions for this provider's still-unconfirmed members */}
            {pendingMine(liveMatch).length > 0 && (
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
