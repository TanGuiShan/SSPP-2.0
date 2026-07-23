import SgdsMasthead from "@govtechsg/sgds-web-component/react/masthead";
import { Link } from "react-router-dom";
import GovernmentFooter from "../components/layout/GovernmentFooter";
import TestModeBanner from "../components/layout/TestModeBanner";

export default function SignupLayout({ title, subtitle, children }) {
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
          <Link to="/register">← Change account type</Link>
        </div>
      </header>

      <main className="sspp-signup-main">
        <div className="sspp-signup-intro">
          <p className="eyebrow">Create an account</p>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {children}
      </main>

      <GovernmentFooter />
    </div>
  );
}
