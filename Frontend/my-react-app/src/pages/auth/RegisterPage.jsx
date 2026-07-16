import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import { Input } from "../../components/common/Input";
import Button from "../../components/common/Button";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      setError("Password needs at least 8 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords don't match. Re-enter to continue.");
      return;
    }
    setError("");
    navigate("/verify-email");
  };

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h1 className="text-4xl" style={{ fontFamily: "var(--font-display)" }}>Create account</h1>
        <p className="text-sm text-[#78716C] mt-2">Get started — it's free</p>
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
            placeholder="Min. 8 characters"
            value={form.password}
            onChange={update("password")}
            required
            className="w-full rounded-lg bg-[#F5F5F4] border border-transparent px-4 py-3 text-sm placeholder:text-[#A8A29E] focus:bg-white focus:border-[#1C1917] focus:outline-none transition-colors"
          />
        </div>

        <Input
          label="Confirm password"
          type={showPassword ? "text" : "password"}
          placeholder="Re-enter password"
          value={form.confirm}
          onChange={update("confirm")}
          required
        />

        {error && <p className="text-sm text-[#C2542F] mb-4 -mt-2">{error}</p>}

        <Button type="submit" fullWidth size="lg">Create account</Button>
      </form>

      <div className="text-center mt-5">
        <Link to="/login" className="text-sm text-[#44403C] underline">← Back to sign in</Link>
      </div>
    </AuthLayout>
  );
}