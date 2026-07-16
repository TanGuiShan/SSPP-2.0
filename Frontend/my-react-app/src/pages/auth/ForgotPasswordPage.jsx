import React, { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import { Input } from "../../components/common/Input";
import Button from "../../components/common/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h1 className="text-4xl" style={{ fontFamily: "var(--font-display)" }}>Reset password</h1>
        <p className="text-sm text-[#78716C] mt-2">
          {sent ? `Reset link sent to ${email}` : "We'll send a reset link to your inbox"}
        </p>
      </div>

      {!sent ? (
        <form onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com.sg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" fullWidth size="lg">Send reset link</Button>
        </form>
      ) : (
        <div className="rounded-lg bg-[#DCFCE7] text-[#15803D] px-4 py-3 text-sm text-center">
          Check your inbox. The link expires in 30 minutes.
        </div>
      )}

      <div className="text-center mt-5">
        <Link to="/login" className="text-sm text-[#44403C] underline">← Back to sign in</Link>
      </div>
    </AuthLayout>
  );
}