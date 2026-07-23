import SgdsAlert from "@govtechsg/sgds-web-component/react/alert";
import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import Button from "../../components/common/Button";
import { Input } from "../../components/common/Input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <AuthLayout>
      <div className="mb-8">
        <p className="eyebrow">Account recovery</p>
        <h1>Reset your password</h1>
        <p className="sspp-page-subtitle">We will send a secure reset link to your inbox.</p>
      </div>

      {sent ? (
        <SgdsAlert show variant="success" title="Reset link sent">
          Check {email}. The link expires in 30 minutes.
        </SgdsAlert>
      ) : (
        <form onSubmit={handleSubmit}>
          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com.sg"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
          <Button type="submit" fullWidth size="lg">
            Send reset link
          </Button>
        </form>
      )}

      <div className="mt-5 text-center">
        <Link to="/login">← Back to sign in</Link>
      </div>
    </AuthLayout>
  );
}
