import SgdsCard from "@govtechsg/sgds-web-component/react/card";

export default function FormSection({ step, title, description, children }) {
  return (
    <SgdsCard className="sspp-form-section">
      <div className="sspp-section-heading">
        {step && <span className="sspp-step-number">{step}</span>}
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
      </div>
      <div className="sspp-form-section-body">{children}</div>
    </SgdsCard>
  );
}
