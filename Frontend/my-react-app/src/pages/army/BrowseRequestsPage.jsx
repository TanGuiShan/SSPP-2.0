import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import { Input } from "../../components/common/Input";
import { MultiSelect } from "../../components/common/MultiSelect";
import { useModal } from "../../hooks/useModal";
import { useAuth } from "../../hooks/useAuth";
import { useEngagements, slotsRemaining } from "../../hooks/useEngagements";
import { getTier, TIERS, TIMING_SLOTS } from "../../data/options";

const timingLabel = (v) => TIMING_SLOTS.find((t) => t.value === v)?.label ?? v;

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-SG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const DAY = 24 * 60 * 60 * 1000;
const daysUntil = (iso) => Math.ceil((new Date(iso).getTime() - Date.now()) / DAY);
const daysSince = (iso) => Math.floor((Date.now() - new Date(iso).getTime()) / DAY);

const emptyFilters = {
  tiers: [],
  timings: [],
  dateFrom: "",
  dateTo: "",
  minPax: "",
  maxPax: "",
};

function DetailRow({ label, children }) {
  return (
    <div className="mb-4">
      <p className="text-[11px] uppercase tracking-wide text-[#A8A29E]">{label}</p>
      <div className="text-sm text-[#1C1917] mt-0.5">{children}</div>
    </div>
  );
}

/**
 * Providers (units and ambassadors) browse the open requests schools have
 * posted, and volunteer for the ones that suit them.
 *
 * Only requests aimed at this provider's category are shown — a unit doesn't
 * see ambassador requests and vice versa — and anything they've already
 * joined, or that's full, drops off the list.
 */
export default function BrowseRequestsPage() {
  const { user } = useAuth();
  const { matches, volunteerForRequest } = useEngagements();
  const { open, payload, openModal, closeModal } = useModal();
  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState(emptyFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const isAmbassador = user?.role === "army-ambassador";
  const providerKind = isAmbassador ? "ambassador" : "unit";

  // TODO(real-auth): the backend will identify the provider. Until then we
  // derive a stable demo identity so volunteering records something sensible.
  const myProviderId = user?.providerId ?? (isAmbassador ? "amb-demo" : "unit-demo");
  const myProviderName =
    user?.fullName ?? (isAmbassador ? "You" : "Your unit");

  // A school aims a request at a category; show only what applies to us.
  const wantsMe = (m) =>
    providerKind === "unit"
      ? m.category === "unit"
      : m.category === "cert" || m.category === "individual_ambassador";

  const available = useMemo(
    () =>
      matches
        .filter((m) => m.isOpen && m.status === "Open" && wantsMe(m))
        .filter((m) => !(m.roster ?? []).some((r) => r.id === myProviderId))
        .sort((a, b) => new Date(a.date) - new Date(b.date)),
    [matches, providerKind, myProviderId]
  );

  const rows = useMemo(() => {
    return available.filter((m) => {
      if (filters.tiers.length && !filters.tiers.includes(m.tier)) return false;

      if (
        filters.timings.length &&
        !filters.timings.some((t) => (m.timings ?? []).includes(t))
      ) {
        return false;
      }

      if (filters.dateFrom && new Date(m.date) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && new Date(m.date) > new Date(filters.dateTo)) return false;

      const pax = Number(m.participants) || 0;
      if (filters.minPax && pax < Number(filters.minPax)) return false;
      if (filters.maxPax && pax > Number(filters.maxPax)) return false;

      return true;
    });
  }, [available, filters]);

  const activeCount =
    filters.tiers.length +
    filters.timings.length +
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0) +
    (filters.minPax ? 1 : 0) +
    (filters.maxPax ? 1 : 0);

  // Let the dashboard link straight here with filters pre-applied later if
  // needed; for now just support ?tier= as a convenience.
  useEffect(() => {
    const tier = searchParams.get("tier");
    if (tier && TIERS.some((t) => t.id === tier)) {
      setFilters((f) => ({ ...f, tiers: [tier] }));
      setFiltersOpen(true);
    }
  }, [searchParams]);

  const handleVolunteer = (m) => {
    volunteerForRequest(m.id, {
      id: myProviderId,
      kind: providerKind,
      name: myProviderName,
      ...(isAmbassador
        ? { rank: user?.rank ?? "", appointment: user?.appointment ?? "" }
        : { location: user?.camp ?? "" }),
    });
    closeModal();
  };

  const liveRequest = payload ? matches.find((m) => m.id === payload.id) ?? payload : null;

  return (
    <>
      <PageHeader
        eyebrow="Requests"
        title="Schools looking for help"
        subtitle={
          isAmbassador
            ? "Schools that couldn't find anyone suitable. Volunteer for the ones you can support."
            : "Schools that couldn't find a suitable unit. Volunteer for the ones your unit can support."
        }
      />

      {/* Filters — collapsed by default so the requests stay above the fold. */}
      <section className="card sspp-filter-panel" aria-label="Filter requests">
        <div className="sspp-filter-heading">
          <button
            type="button"
            className="sspp-filter-toggle"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
            aria-controls="request-filter-body"
          >
            <span
              className={`sspp-filter-chevron ${filtersOpen ? "is-open" : ""}`}
              aria-hidden="true"
            >
              ▸
            </span>
            <span className="sspp-filter-heading-text">
              <span className="sspp-filter-title">
                Filters
                {activeCount > 0 && <span className="sspp-filter-badge">{activeCount}</span>}
              </span>
              <span className="sspp-filter-count">
                Showing {rows.length} of {available.length}
              </span>
            </span>
          </button>

          {activeCount > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setFilters(emptyFilters)}>
              Clear all
            </Button>
          )}
        </div>

        <div id="request-filter-body" hidden={!filtersOpen}>
          <div className="sspp-filter-dates">
            <Input
              type="date"
              label="Date from"
              value={filters.dateFrom}
              onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
            />
            <Input
              type="date"
              label="Date to"
              value={filters.dateTo}
              onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
            />
          </div>

          <div className="sspp-filter-dates">
            <Input
              type="number"
              min="0"
              label="Min pax"
              placeholder="Any"
              value={filters.minPax}
              onChange={(e) => setFilters((f) => ({ ...f, minPax: e.target.value }))}
            />
            <Input
              type="number"
              min="0"
              label="Max pax"
              placeholder="Any"
              value={filters.maxPax}
              onChange={(e) => setFilters((f) => ({ ...f, maxPax: e.target.value }))}
            />
          </div>

          <MultiSelect
            label="Engagement tier"
            options={TIERS.map((t) => ({ value: t.id, label: t.short }))}
            value={filters.tiers}
            onChange={(v) => setFilters((f) => ({ ...f, tiers: v }))}
          />

          <MultiSelect
            label="Timing"
            options={TIMING_SLOTS}
            value={filters.timings}
            onChange={(v) => setFilters((f) => ({ ...f, timings: v }))}
          />
        </div>
      </section>

      {rows.length === 0 ? (
        <div className="card sspp-browse-empty">
          <p className="sspp-browse-empty-title">
            {available.length === 0
              ? "No open requests right now"
              : "No requests match those filters"}
          </p>
          <p className="sspp-browse-empty-body">
            {available.length === 0
              ? "When a school can't find anyone suitable, their request appears here for you to pick up."
              : "Try widening the date range or clearing a filter."}
          </p>
          {activeCount > 0 && (
            <Button variant="outline" onClick={() => setFilters(emptyFilters)}>
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="sspp-request-grid">
          {rows.map((m) => {
            const left = slotsRemaining(m);
            const inDays = daysUntil(m.date);
            const waiting = daysSince(m.createdAt);

            return (
              <article key={m.id} className="card sspp-request-card">
                <div className="sspp-request-card-head">
                  <div>
                    <h3>{m.school}</h3>
                    <p className="sspp-request-card-date">{fmtDate(m.date)}</p>
                  </div>
                  <span className="sspp-slots-left">
                    {left} slot{left > 1 ? "s" : ""} left
                  </span>
                </div>

                <dl className="sspp-request-card-facts">
                  <div>
                    <dt>Tier</dt>
                    <dd>{getTier(m.tier)?.short ?? m.tier}</dd>
                  </div>
                  <div>
                    <dt>Students</dt>
                    <dd>{m.participants}</dd>
                  </div>
                  <div>
                    <dt>Timing</dt>
                    <dd>{(m.timings ?? []).map(timingLabel).join(", ") || "—"}</dd>
                  </div>
                </dl>

                {m.notes && <p className="sspp-request-card-notes">{m.notes}</p>}

                <div className="sspp-request-card-foot">
                  <span className="sspp-request-card-age">
                    {inDays >= 0 ? `In ${inDays} days` : "Date passed"}
                    {waiting >= 7 && " · waiting a while"}
                  </span>
                  <div className="sspp-request-card-actions">
                    <Button variant="outline" size="sm" onClick={() => openModal(m)}>
                      Details
                    </Button>
                    <Button size="sm" onClick={() => handleVolunteer(m)}>
                      Volunteer
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Modal
        open={open}
        onClose={closeModal}
        title="Request details"
        subtitle={liveRequest?.school}
        variant="drawer"
      >
        {liveRequest && (
          <>
            <DetailRow label="Date">{fmtDate(liveRequest.date)}</DetailRow>
            <DetailRow label="Timing">
              {(liveRequest.timings ?? []).map(timingLabel).join(", ") || "—"}
            </DetailRow>
            <DetailRow label="Engagement tier">
              {getTier(liveRequest.tier)?.name ?? liveRequest.tier}
            </DetailRow>
            <DetailRow label="Size">{liveRequest.participants} students</DetailRow>
            <DetailRow label="Volunteers needed">
              {liveRequest.volunteersNeeded ?? 1} ·{" "}
              {slotsRemaining(liveRequest)} still needed
            </DetailRow>
            {liveRequest.notes && (
              <DetailRow label="Notes from the school">{liveRequest.notes}</DetailRow>
            )}

            <div className="sgds-modal-actions">
              <Button variant="secondary" fullWidth onClick={closeModal}>
                Close
              </Button>
              <Button fullWidth onClick={() => handleVolunteer(liveRequest)}>
                Volunteer
              </Button>
            </div>
            <p className="sspp-form-footnote">
              Volunteering adds you to this engagement. You'll then confirm your
              attendance like any other engagement.
            </p>
          </>
        )}
      </Modal>
    </>
  );
}
