import { Link } from "react-router-dom";
import InfoLayout from "../../layouts/InfoLayout";
import Button from "../../components/common/Button";

const SUPPORT_EMAIL = "sspp-support@example.gov.sg";

function Channel({ label, children }) {
  return (
    <div className="mb-5 last:mb-0">
      <p className="text-[11px] uppercase tracking-wide text-[#A8A29E]">{label}</p>
      <div className="text-sm text-[#1C1917] mt-1">{children}</div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <InfoLayout
      eyebrow="Contact"
      title="Contact us"
      subtitle="Questions about the SAF–School Partnership Programme? Here's how to reach us."
    >
      <div className="card p-6 max-w-2xl">
        <Channel label="General enquiries">
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[#4F46E5] hover:underline">
            {SUPPORT_EMAIL}
          </a>
          <p className="text-[#78716C] mt-1">
            For account help, engagement bookings, or anything about the programme.
          </p>
        </Channel>

        <Channel label="Response time">
          <p className="text-[#78716C]">
            We aim to reply within 3 working days (Mon–Fri, excluding public holidays).
          </p>
        </Channel>

        <Channel label="Have a suggestion or issue?">
          <p className="text-[#78716C] mb-3">
            Send it through the feedback form and it goes straight to the programme team.
          </p>
          <Link to="/feedback">
            <Button variant="outline" size="sm">
              Give feedback
            </Button>
          </Link>
        </Channel>
      </div>
    </InfoLayout>
  );
}
