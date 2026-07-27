import { CalendarIcon } from "../../assets/icons";
import Button from "../common/Button";
import { FORMATIONS, TOPICS, SCHOOL_LEVELS } from "../../data/options";
import { formatRange } from "../../utils/filtering";

const labelFor = (list, value) => list.find((o) => o.value === value)?.label ?? value;

export default function FormationCard({ formation, onInterested }) {
  const { name, location, formation: formationKey, availableFrom, availableTo, image, badge, mobility, topics = [], levelsPreferred = [] } = formation;
  const hasRange = Boolean(availableFrom && availableTo);

  return (
    <div className="card overflow-hidden flex flex-col">
      <div className="relative h-40 bg-[#E7E5E4]">
        {image && <img src={image} alt={name} className="w-full h-full object-cover" />}
        {badge && (
          <div className="absolute bottom-3 left-3 w-11 h-11 rounded-lg bg-white shadow flex items-center justify-center overflow-hidden">
            <img src={badge} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        {mobility && (
          <span
            className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-medium ${
              mobility === "sharing_booth"
                ? "bg-[#DBEAFE] text-[#1D4ED8]"
                : "bg-white text-[#57534E]"
            }`}
          >
            {mobility === "sharing_booth" ? "Sharing + booth" : "Sharing only"}
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        {formationKey && (
          <p className="text-lg uppercase tracking-wide font-bold text-[#0000FF] mb-0.5">
            {labelFor(FORMATIONS, formationKey)}
          </p>
        )}
        <h3 className="text-lg font-semibold text-[#1C1917]"> {name}</h3>
        <p className="text-sm text-[#78716C] mt-0.5">{location}</p>

        {topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {topics.slice(0, 3).map((t) => (
              <span key={t} className="px-2.5 py-1 rounded-full bg-[#F5F5F4] text-[11px] text-[#44403C]">
                {labelFor(TOPICS, t)}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-[#44403C] mt-3 mb-2">
          <CalendarIcon width={16} height={16} className="text-[#A8A29E] shrink-0" />
          <div>
            <p className="font-medium text-xs">Available</p>
            <p className="text-[#78716C] text-xs">
              {hasRange ? formatRange(availableFrom, availableTo) : "Not specified"}
            </p>
          </div>
        </div>

        {levelsPreferred.length > 0 && (
          <p className="text-[11px] text-[#A8A29E] mb-4">
            Prefers: {levelsPreferred.map((l) => labelFor(SCHOOL_LEVELS, l)).join(", ")}
          </p>
        )}

        <Button variant="primary" fullWidth className="mt-auto" onClick={() => onInterested?.(formation)}>
          I'm Interested
        </Button>
      </div>
    </div>
  );
}
