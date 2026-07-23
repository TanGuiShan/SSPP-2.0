import SgdsAlert from "@govtechsg/sgds-web-component/react/alert";
import { TEST_MODE } from "../../config/testMode";

export default function TestModeBanner() {
  if (!TEST_MODE) return null;

  return (
    <div className="sspp-test-banner" role="status">
      <SgdsAlert show variant="warning" outlined title="Test mode enabled">
        Verification and government-domain checks are bypassed. Disable VITE_TEST_MODE before production deployment.
      </SgdsAlert>
    </div>
  );
}
