import { CalendarIcon } from "../../assets/icons";
import Button from "../common/Button";
import { FORMATIONS, TOPICS, SCHOOL_LEVELS } from "../../data/options";
import { formatRange } from "../../utils/filtering";

const labelFor = (list, value) => list.find((o) => o.value === value)?.label ?? value;

export default function FormationCard({ formation, onInterested }) {
  const {
    name,
    location,
    formation: formationKey,
    availableFrom,
    availableTo,
    image,
    badge,
    mobility,
    topics = [],
    levelsPreferred = [],
  } = formation;

  const hasRange = Boolean(availableFrom && availableTo);
  const formationLabel = formationKey ? labelFor(FORMATIONS, formationKey) : "";
  const isBooth = mobility === "sharing_booth";

  return (
    <div className="card overflow-hidden flex flex-col group transition-all duration-200 hover:shadow-lg hover:border-[#D6D3D1]">
      {/* Header / crest */}
      <div className="relative h-44 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#EEF2FF] via-[#E0E7FF] to-[#EDE9FE] flex items-center justify-center">
            <span className="text-6xl font-black text-[#A5B4FC] select-none">
              {(formationLabel || name || "?").charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {badge && (
          <div className="absolute bottom-3 left-3 w-12 h-12 rounded-xl bg-white shadow-md ring-1 ring-black/5 flex items-center justify-center overflow-hidden">
            <img src={badge} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        {mobility && (
          <span
            className={`absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium shadow-sm backdrop-blur ${
              isBooth ? "bg-[#DBEAFE]/95 text-[#1D4ED8]" : "bg-white/95 text-[#57534E]"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
            {isBooth ? "Sharing + booth" : "Sharing only"}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        {formationLabel && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4F46E5] mb-1">
            {formationLabel}
          </p>
        )}
        <h3 className="text-lg font-semibold text-[#1C1917] leading-snug">{name}</h3>

        {location && (
          <p className="flex items-center gap-1.5 text-sm text-[#78716C] mt-1">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#A8A29E] shrink-0"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {location}
          </p>
        )}

        {topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {topics.slice(0, 3).map((t) => (
              <span
                key={t}
                className="px-2.5 py-1 rounded-full bg-[#F5F5F4] text-[11px] font-medium text-[#57534E]"
              >
                {labelFor(TOPICS, t)}
              </span>
            ))}
            {topics.length > 3 && (
              <span className="px-2 py-1 text-[11px] text-[#A8A29E]">+{topics.length - 3}</span>
            )}
          </div>
        )}

        <div className="h-px bg-[#F0EEEC] my-4" />

        <div className="flex items-center gap-2">
          <CalendarIcon width={16} height={16} className="text-[#A8A29E] shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wide text-[#A8A29E] leading-none mb-0.5">
              Available
            </p>
            <p className="text-[#44403C] text-xs font-medium">
              {hasRange ? formatRange(availableFrom, availableTo) : "Not specified"}
            </p>
          </div>
        </div>

        {levelsPreferred.length > 0 && (
          <p className="text-[11px] text-[#A8A29E] mt-3">
            Prefers {levelsPreferred.map((l) => labelFor(SCHOOL_LEVELS, l)).join(", ")}
          </p>
        )}

        <div className="mt-auto pt-6">
          <Button variant="primary" fullWidth onClick={() => onInterested?.(formation)}>
            I'm Interested
          </Button>
        </div>
      </div>
    </div>
  );
}
