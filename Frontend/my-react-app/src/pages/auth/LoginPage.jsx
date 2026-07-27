import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import Button from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { RadioCards } from "../../components/common/MultiSelect";
import { useAuth } from "../../hooks/useAuth";
import { TEST_MODE } from "../../config/testMode";

const HOME_BY_ROLE = {
  school: "/school/dashboard",
  "army-unit": "/army/dashboard",
  "army-ambassador": "/army/dashboard",
  admin: "/admin/dashboard",
};

const DEMO_ROLES = [
  { value: "school", label: "School" },
  { value: "army-unit", label: "Army unit" },
  { value: "army-ambassador", label: "Army ambassador" },
  { value: "admin", label: "Administrator" },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [role, setRole] = useState("school");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      // In test mode `login` ignores the password and uses the picked role; in
      // real mode it signs in with Firebase and returns the true role from the
      // user's profile. Navigating by the RETURNED role covers both.
      const signedInUser = await login({
        email: form.email,
        password: form.password,
        role,
      });
      if (signedInUser?.approved === false) {
        navigate("/pending-approval");
        return;
      }
      navigate(HOME_BY_ROLE[signedInUser?.role] ?? "/school/dashboard");
    } catch (err) {
      setError(err.message ?? "Could not sign in. Check your email and password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-8">
        <p className="eyebrow">SSPP account</p>
        <h1>Welcome back</h1>
        <p className="sspp-page-subtitle">Sign in to manage your engagements.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com.sg"
          value={form.email}
          onChange={update("email")}
          autoComplete="email"
          required
        />

        <Input
          label="Password"
          type="password"
          value={form.password}
          onChange={update("password")}
          autoComplete="current-password"
          required
        />

        {TEST_MODE && (
          <RadioCards
            label="Sign in as (test mode)"
            options={DEMO_ROLES}
            value={role}
            onChange={setRole}
            name="demo-role"
          />
        )}

        {error && (
          <div className="rounded-lg bg-[#FEE2E2] text-[#B91C1C] px-4 py-3 text-sm mb-5">
            {error}
          </div>
        )}

        <Button type="submit" fullWidth size="lg" loading={submitting} disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="mt-4 text-center">
        <Link to="/forgot-password">Forgot password?</Link>
      </div>

      <div className="my-6 border-t border-[var(--color-border)]" />

      <Button variant="secondary" fullWidth size="lg" onClick={() => navigate("/register")}>
        Create an account
      </Button>

      {TEST_MODE && (
        <p className="mt-6 text-center text-xs text-[var(--color-text-muted)]">
          Demo role selection is shown only in test mode; real sign-in uses your account's role.
        </p>
      )}
    </AuthLayout>
  );
}
