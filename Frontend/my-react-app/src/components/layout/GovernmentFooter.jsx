import SgdsFooter from "@govtechsg/sgds-web-component/react/footer";

export default function GovernmentFooter({ layout = "default" }) {
  return (
    <SgdsFooter
      layout={layout}
      tone={layout === "sidebar" ? "neutral" : "fixed-dark"}
      copyrightLiner={`© ${new Date().getFullYear()} Government of Singapore`}
      contactHref="mailto:sspp-support@example.gov.sg"
      feedbackHref="mailto:sspp-support@example.gov.sg?subject=SSPP%20feedback"
      privacyHref="#privacy"
      termsOfUseHref="#terms"
    >
      <span slot="title">SAF-School Partnership Programme</span>
      <span slot="description">
        Connecting SAF formations and schools for meaningful engagement opportunities.
      </span>
    </SgdsFooter>
  );
}
