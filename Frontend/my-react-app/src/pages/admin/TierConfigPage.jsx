import { useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import { Input, TextArea } from "../../components/common/Input";
import { useModal } from "../../hooks/useModal";
import { useTiers } from "../../hooks/useTiers";
import { seedTiers, saveTier, deleteTier } from "../../services/firebase/tiers.service";

// Tiers now live in Firestore (see hooks/useTiers). Until the collection is
// seeded these are the built-in defaults, shown read-only — editing a single
// tier into an empty collection would drop the rest, so we seed all-or-nothing
// first, then enable per-tier CRUD.

const BLANK = {
  id: "",
  name: "",
  short: "",
  description: "",
  requiresBooth: false,
  isHandsOn: false,
  maxParticipants: "",
  equipment: "",
  order: "",
};

// Firestore doc <-> form: equipment is an array in the doc, a comma list in the form.
const toForm = (t) => ({
  ...BLANK,
  ...t,
  maxParticipants: t.maxParticipants ?? "",
  order: t.order ?? "",
  equipment: Array.isArray(t.equipment) ? t.equipment.join(", ") : "",
});

const toDoc = (f) => ({
  name: f.name.trim(),
  short: f.short.trim(),
  description: f.description.trim(),
  requiresBooth: Boolean(f.requiresBooth),
  isHandsOn: Boolean(f.isHandsOn),
  maxParticipants: Number(f.maxParticipants) || 0,
  equipment: f.equipment
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  order: Number(f.order) || 0,
});

export default function TierConfigPage() {
  const { tiers, usingDefaults } = useTiers();
  const editModal = useModal();
  const [form, setForm] = useState(BLANK);
  const [editingId, setEditingId] = useState(null); // null = adding a new tier
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e?.target?.value ?? "" }));
  const toggle = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.checked }));

  const openAdd = () => {
    setError("");
    setEditingId(null);
    setForm({ ...BLANK, order: String(tiers.length + 1) });
    editModal.openModal({});
  };

  const openEdit = (t) => {
    setError("");
    setEditingId(t.id);
    setForm(toForm(t));
    editModal.openModal(t);
  };

  const handleSeed = async () => {
    setError("");
    setSeeding(true);
    try {
      await seedTiers();
    } catch (e) {
      setError(e?.message ?? "Couldn't upload tiers. Are you signed in as an admin?");
    } finally {
      setSeeding(false);
    }
  };

  const handleSave = async () => {
    const id = (editingId ?? form.id).trim();
    if (!id) return setError("Give the tier an id (e.g. tier4).");
    if (!form.name.trim()) return setError("Give the tier a name.");
    if (!editingId && tiers.some((t) => t.id === id))
      return setError(`A tier with id "${id}" already exists.`);

    setError("");
    setBusy(true);
    try {
      await saveTier(id, toDoc(form));
      editModal.closeModal();
    } catch (e) {
      setError(e?.message ?? "Couldn't save the tier. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (t) => {
    setError("");
    setBusy(true);
    try {
      await deleteTier(t.id);
      editModal.closeModal();
    } catch (e) {
      setError(e?.message ?? "Couldn't delete the tier.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Tier Config"
        title="Engagement tiers"
        subtitle="Each tier implies its own mobility — hands-on and booth tiers need physical setup at the school"
        action={
          !usingDefaults ? <Button onClick={openAdd}>Add tier</Button> : null
        }
      />

      {error && (
        <div className="rounded-lg bg-[#FEE2E2] text-[#B91C1C] px-4 py-3 text-sm mb-5">
          {error}
        </div>
      )}

      {usingDefaults && (
        <div className="rounded-lg bg-[#FEF3C7] text-[#92400E] px-4 py-4 mb-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-medium">Showing built-in defaults</p>
            <p className="text-xs mt-0.5">
              Upload the tiers to Firestore to edit them. The signup and interest forms keep
              using these values until then.
            </p>
          </div>
          <Button loading={seeding} onClick={handleSeed}>
            Upload tiers to Firestore
          </Button>
        </div>
      )}

      {tiers.map((t) => (
        <div key={t.id} className="card p-6 mb-4">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <p className="font-semibold text-[#1C1917]">{t.name}</p>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                    t.requiresBooth
                      ? "bg-[#DBEAFE] text-[#1D4ED8]"
                      : "bg-[#F5F5F4] text-[#57534E]"
                  }`}
                >
                  {t.requiresBooth ? "Booth setup required" : "No booth"}
                </span>
                {t.isHandsOn && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#DCFCE7] text-[#15803D]">
                    Hands-on
                  </span>
                )}
              </div>
              <p className="text-sm text-[#78716C] mt-1">{t.description}</p>
            </div>
            {!usingDefaults && (
              <Button variant="outline" size="sm" onClick={() => openEdit(t)}>
                Edit
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-[#A8A29E]">Max participants</p>
              <p className="text-[#1C1917] mt-0.5">{t.maxParticipants || "—"}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-[#A8A29E] mb-1.5">
                Default equipment options
              </p>
              <div className="flex flex-wrap gap-2">
                {(t.equipment ?? []).length === 0 ? (
                  <span className="text-xs text-[#A8A29E] italic">None</span>
                ) : (
                  t.equipment.map((e) => (
                    <span key={e} className="px-3 py-1 rounded-full bg-[#F5F5F4] text-xs text-[#44403C]">
                      {e}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      <Modal
        open={editModal.open}
        onClose={editModal.closeModal}
        title={editingId ? "Edit tier" : "Add tier"}
        subtitle={editingId ?? "New engagement tier"}
        variant="drawer"
      >
        <div className="space-y-1">
          {!editingId && (
            <Input
              label="Tier id"
              required
              placeholder="e.g. tier4"
              hintText="A short unique key. Can't be changed later."
              value={form.id}
              onChange={set("id")}
            />
          )}
          <Input label="Name" required placeholder="Tier 4 — …" value={form.name} onChange={set("name")} />
          <Input label="Short label" placeholder="e.g. Hands-on" value={form.short} onChange={set("short")} />
          <TextArea
            label="Description"
            rows={2}
            placeholder="What this tier involves"
            value={form.description}
            onChange={set("description")}
          />

          <div className="flex gap-6 py-2">
            <label className="flex items-center gap-2 text-sm text-[#44403C]">
              <input type="checkbox" checked={form.requiresBooth} onChange={toggle("requiresBooth")} />
              Requires booth setup
            </label>
            <label className="flex items-center gap-2 text-sm text-[#44403C]">
              <input type="checkbox" checked={form.isHandsOn} onChange={toggle("isHandsOn")} />
              Hands-on (units only)
            </label>
          </div>

          <div className="grid grid-cols-2 gap-x-4">
            <Input
              label="Max participants"
              type="number"
              min="0"
              placeholder="e.g. 120"
              value={form.maxParticipants}
              onChange={set("maxParticipants")}
            />
            <Input
              label="Sort order"
              type="number"
              min="0"
              placeholder="e.g. 4"
              value={form.order}
              onChange={set("order")}
            />
          </div>

          <Input
            label="Equipment options"
            placeholder="Comma-separated, e.g. Slide deck, Uniform display"
            hintText="Separate each item with a comma."
            value={form.equipment}
            onChange={set("equipment")}
          />

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" fullWidth onClick={editModal.closeModal}>
              Cancel
            </Button>
            <Button fullWidth loading={busy} onClick={handleSave}>
              {editingId ? "Save changes" : "Add tier"}
            </Button>
          </div>

          {editingId && (
            <button
              onClick={() => handleDelete({ id: editingId })}
              disabled={busy}
              className="w-full text-center text-xs text-[#B91C1C] hover:underline pt-3"
            >
              Delete this tier
            </button>
          )}
        </div>
      </Modal>
    </>
  );
}
