import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import { Input } from "../../components/common/Input";
import Button from "../../components/common/Button";
import { useAuth } from "../../hooks/useAuth";

const HOME_BY_ROLE = {
  school: "/school/dashboard",
  "army-unit": "/army/dashboard",
  "army-ambassador": "/army/dashboard",
  admin: "/admin/dashboard",
};

// Demo-only: labels for the role picker below.
const DEMO_ROLES = [
  { value: "school", label: "School" },
  { value: "army-unit", label: "Unit" },
  { value: "army-ambassador", label: "Ambassador" },
  { value: "admin", label: "Admin" },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("school");

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    login({ email: form.email, role });
    navigate(HOME_BY_ROLE[role]);
  };

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h1 className="text-4xl" style={{ fontFamily: "var(--font-display)" }}>Welcome Back</h1>
        <p className="text-sm text-[#78716C] mt-2">Sign in to continue</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com.sg"
          value={form.email}
          onChange={update("email")}
          required
        />

        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm text-[#44403C]">Password</label>
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="text-xs text-[#57534E] underline"
            >
              {showPassword ? "hide" : "show"}
            </button>
          </div>
          <input
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={update("password")}
            required
            className="w-full rounded-lg bg-[#F5F5F4] border border-transparent px-4 py-3 text-sm focus:bg-white focus:border-[#1C1917] focus:outline-none transition-colors"
          />
        </div>

        {/* Demo-only: pick which POV to land in. Remove once real auth returns a role. */}
        <div className="mb-5">
          <label className="text-sm text-[#44403C] block mb-1.5">Sign in as</label>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={`py-2 rounded-lg text-xs transition-colors ${
                  role === r.value
                    ? "bg-[#1C1917] text-white"
                    : "bg-[#F5F5F4] text-[#57534E] hover:bg-[#E7E5E4]"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <Button type="submit" fullWidth size="lg">Sign in</Button>
      </form>

      <div className="text-center mt-4">
        <Link to="/forgot-password" className="text-sm text-[#44403C] underline">
          Forgot password?
        </Link>
      </div>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-[#E7E5E4]" />
        <span className="text-[11px] tracking-widest uppercase text-[#A8A29E]">New here?</span>
        <div className="flex-1 h-px bg-[#E7E5E4]" />
      </div>

      <Link to="/register">
        <Button variant="secondary" fullWidth size="lg">Create an account</Button>
      </Link>

      <p className="text-center text-xs text-[#A8A29E] mt-6">Demo UI — for presentation purposes</p>
    </AuthLayout>
  );
}
