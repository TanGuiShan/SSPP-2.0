import SgdsMasthead from "@govtechsg/sgds-web-component/react/masthead";
import { useNavigate } from "react-router-dom";
import GovernmentFooter from "../components/layout/GovernmentFooter";
import TestModeBanner from "../components/layout/TestModeBanner";

// Public shell for cross-cutting utility pages (Contact, Feedback) that any
// visitor can reach from the footer — signed in or not. Mirrors SignupLayout,
// but "Back" returns wherever they came from instead of the register flow.
export default function InfoLayout({ eyebrow, title, subtitle, children }) {
  const navigate = useNavigate();
  return (
    <div className="sspp-public-shell">
      <SgdsMasthead fluid />
      <TestModeBanner />

      <header className="sspp-signup-header">
        <div className="sspp-signup-header-inner">
          <div>
            <strong>SSPP</strong>
            <span>School–SAF Partnership Platform</span>
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm font-medium text-[#4F46E5] hover:underline bg-transparent border-0 cursor-pointer"
          >
            ← Back
          </button>
        </div>
      </header>

      <main className="sspp-signup-main">
        <div className="sspp-signup-intro">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {children}
      </main>

      <GovernmentFooter />
    </div>
  );
}
