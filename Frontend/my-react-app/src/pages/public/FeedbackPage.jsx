import { useState } from "react";
import { Link } from "react-router-dom";
import InfoLayout from "../../layouts/InfoLayout";
import Button from "../../components/common/Button";
import { Input, Select, TextArea } from "../../components/common/Input";
import { useAuth } from "../../hooks/useAuth";
import { submitFeedback } from "../../services/firebase/feedback.service";

const CATEGORIES = [
  { value: "bug", label: "Bug / something's broken" },
  { value: "suggestion", label: "Suggestion / idea" },
  { value: "question", label: "Question" },
  { value: "compliment", label: "Compliment" },
  { value: "other", label: "Other" },
];

export default function FeedbackPage() {
  const { user } = useAuth();

  // Prefill from the signed-in account when there is one; a logged-out visitor
  // fills these in themselves.
  const [form, setForm] = useState({
    name: user?.fullName ?? user?.schoolName ?? "",
    email: user?.email ?? "",
    category: "suggestion",
    message: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.message.trim()) return setError("Please write your feedback before sending.");
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email))
      return setError("That doesn't look like a valid email address.");

    setError("");
    setSubmitting(true);
    try {
      await submitFeedback({
        name: form.name,
        email: form.email,
        category: form.category,
        message: form.message,
        // Attach identity when signed in, so an admin can follow up.
        meta: user ? { uid: user.uid, role: user.role } : {},
      });
      setSent(true);
    } catch (err) {
      setError(
        err?.message ??
          "Couldn't send your feedback. Please try again, or email us directly."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <InfoLayout
      eyebrow="Feedback"
      title="Share your feedback"
      subtitle="Tell us what's working, what isn't, or what you'd like to see. It goes straight to the programme team."
    >
      <div className="card p-6 max-w-2xl">
        {sent ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-[#DCFCE7] text-[#15803D] text-2xl flex items-center justify-center mx-auto mb-4">
              ✓
            </div>
            <h2 className="text-lg font-semibold text-[#1C1917]">Thanks for your feedback</h2>
            <p className="text-sm text-[#78716C] mt-1 mb-6">
              We've received your message and will review it. If you left an email, we may follow up.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="secondary"
                onClick={() => {
                  setSent(false);
                  setForm((f) => ({ ...f, message: "" }));
                }}
              >
                Send another
              </Button>
              <Link to="/contact">
                <Button variant="outline">Contact us</Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <Input
                label="Your name"
                placeholder="e.g. Tan Gui Shan"
                value={form.name}
                onChange={set("name")}
              />
              <Input
                label="Email (optional)"
                type="email"
                placeholder="you@example.com"
                hintText="Leave this if you'd like a reply."
                value={form.email}
                onChange={set("email")}
              />
            </div>

            <Select
              label="What's this about?"
              options={CATEGORIES}
              value={form.category}
              onChange={set("category")}
            />

            <TextArea
              label="Your feedback"
              rows={5}
              placeholder="Tell us what's on your mind…"
              value={form.message}
              onChange={set("message")}
            />

            {error && (
              <div className="rounded-lg bg-[#FEE2E2] text-[#B91C1C] px-4 py-3 text-sm my-4">
                {error}
              </div>
            )}

            <Button type="submit" fullWidth size="lg" loading={submitting} disabled={submitting}>
              {submitting ? "Sending…" : "Send feedback"}
            </Button>
          </form>
        )}
      </div>
    </InfoLayout>
  );
}
