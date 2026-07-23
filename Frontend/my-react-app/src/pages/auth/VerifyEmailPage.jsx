import SgdsAlert from "@govtechsg/sgds-web-component/react/alert";
import { Link } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import Button from "../../components/common/Button";

export default function VerifyEmailPage() {
  return (
    <AuthLayout>
      <div className="mb-8">
        <p className="eyebrow">Email verification</p>
        <h1>Check your email</h1>
        <p className="sspp-page-subtitle">
          Open the verification link we sent to activate your account.
        </p>
      </div>

      <SgdsAlert show variant="info" title="Verification required">
        The verification link is time-limited. Request a new email if it has expired.
      </SgdsAlert>

      <div className="mt-5">
        <Button variant="secondary" fullWidth size="lg">
          Resend verification email
        </Button>
      </div>

      <div className="mt-5 text-center">
        <Link to="/login">← Back to sign in</Link>
      </div>
    </AuthLayout>
  );
}
