import SgdsAlert from "@govtechsg/sgds-web-component/react/alert";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import Button from "../../components/common/Button";

export default function PendingApprovalPage() {
  const navigate = useNavigate();

  return (
    <AuthLayout>
      <div className="mb-8">
        <p className="eyebrow">Account status</p>
        <h1>Awaiting approval</h1>
        <p className="sspp-page-subtitle">
          Your email is verified. An administrator must approve this account before access is granted.
        </p>
      </div>

      <SgdsAlert show variant="warning" title="Approval pending">
        You will receive an email after an administrator reviews the account. Government-domain accounts may be approved automatically.
      </SgdsAlert>

      <div className="mt-6">
        <Button variant="secondary" fullWidth size="lg" onClick={() => navigate("/login")}>
          Back to sign in
        </Button>
      </div>
    </AuthLayout>
  );
}
