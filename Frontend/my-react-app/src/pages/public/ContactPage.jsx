import { Link } from "react-router-dom";
import InfoLayout from "../../layouts/InfoLayout";
import Button from "../../components/common/Button";

const SUPPORT_EMAIL = "sspp-support@example.gov.sg";

const ICONS = {
  mail: (
    <path
      d="M3 5h14v10H3V5Zm0 0 7 6 7-6"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ),
  clock: (
    <>
      <circle cx="10" cy="10" r="7.2" stroke="currentColor" strokeWidth="1.6" fill="none" />
      <path
        d="M10 6v4l3 2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </>
  ),
  message: (
    <path
      d="M3 4h14v9H8l-3.5 3V13H3V4Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ),
};

function Icon({ name }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

function Channel({ icon, label, children }) {
  return (
    <div className="flex items-start gap-3 px-5 py-5">
      <div className="shrink-0 w-10 h-10 rounded-full bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center">
        <Icon name={icon} />
      </div>
      <div className="min-w-0 ml-1 mt-3.5">
        <p className="text-[13px] font-semibold uppercase tracking-wide text-[#A8A29E] leading-none m-0">
          {label}
        </p>
        <div className="text-sm text-[#1C1917] leading-snug mt-2">{children}</div>
      </div>
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
      <div className="card max-w-2xl overflow-hidden divide-y divide-[#F1EFED]">
        <Channel icon="mail" label="General enquiries">
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-[#4F46E5] font-medium hover:underline"
          >
            {SUPPORT_EMAIL}
          </a>
          <p className="text-[#78716C] mt-0.5">
            For account help, engagement bookings, or anything about the programme.
          </p>
        </Channel>

        <Channel icon="clock" label="Response time">
          <p className="text-[#78716C]">
            We aim to reply within 3 working days (Mon–Fri, excluding public holidays).
          </p>
        </Channel>

        <Channel icon="message" label="Have a suggestion or issue?">
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
