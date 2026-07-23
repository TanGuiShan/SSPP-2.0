import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import Button from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { RadioCards } from "../../components/common/MultiSelect";
import { useAuth } from "../../hooks/useAuth";

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

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    login({ email: form.email, role });
    navigate(HOME_BY_ROLE[role]);
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

        <RadioCards
          label="Sign in as"
          options={DEMO_ROLES}
          value={role}
          onChange={setRole}
          name="demo-role"
        />

        <Button type="submit" fullWidth size="lg">
          Sign in
        </Button>
      </form>

      <div className="mt-4 text-center">
        <Link to="/forgot-password">Forgot password?</Link>
      </div>

      <div className="my-6 border-t border-[var(--color-border)]" />

      <Button variant="secondary" fullWidth size="lg" onClick={() => navigate("/register")}>
        Create an account
      </Button>

      <p className="mt-6 text-center text-xs text-[var(--color-text-muted)]">
        Demo role selection will be removed when backend authentication returns the user role.
      </p>
    </AuthLayout>
  );
}
