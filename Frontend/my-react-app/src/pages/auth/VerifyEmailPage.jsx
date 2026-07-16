import React from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import Button from "../../components/common/Button";

export default function VerifyEmailPage() {
  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h1 className="text-4xl" style={{ fontFamily: "var(--font-display)" }}>Check your email</h1>
        <p className="text-sm text-[#78716C] mt-2">
          We sent a verification link to your inbox. Open it to activate your account.
        </p>
      </div>

      <Button variant="secondary" fullWidth size="lg">Resend verification email</Button>

      <div className="text-center mt-5">
        <Link to="/login" className="text-sm text-[#44403C] underline">← Back to sign in</Link>
      </div>
    </AuthLayout>
  );
}