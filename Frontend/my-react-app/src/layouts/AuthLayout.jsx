import SgdsMasthead from "@govtechsg/sgds-web-component/react/masthead";
import posterImg from "../assets/images/services_posters.jpg";
import GovernmentFooter from "../components/layout/GovernmentFooter";
import TestModeBanner from "../components/layout/TestModeBanner";

export default function AuthLayout({ children }) {
  return (
    <div className="sspp-public-shell">
      <SgdsMasthead fluid />
      <TestModeBanner />

      <main className="sspp-auth-layout">
        <div className="sspp-auth-visual" aria-hidden="true">
          <img src={posterImg} alt="" />
          <div className="sspp-auth-visual-overlay">
            <p className="sspp-auth-kicker">SAF-School Partnership Programme</p>
            <h1>Build meaningful connections through shared engagements.</h1>
          </div>
        </div>

        <div className="sspp-auth-panel">
          <div className="sspp-auth-panel-inner">{children}</div>
        </div>
      </main>

      <GovernmentFooter />
    </div>
  );
}
