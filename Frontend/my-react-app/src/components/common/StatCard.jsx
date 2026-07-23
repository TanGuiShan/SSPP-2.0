import SgdsCard from "@govtechsg/sgds-web-component/react/card";

export default function StatCard({ label, value, valueColor, onClick, hint }) {
  const clickable = typeof onClick === "function";

  return (
    <SgdsCard
      
      noPadding
      className={`sspp-stat-card ${clickable ? "sspp-stat-card--clickable" : ""}`}
      onClick={clickable ? onClick : undefined}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <div className="sspp-stat-card-content">
        <div className="sspp-stat-card-heading">
          <p>{label}</p>
          {clickable && <span aria-hidden="true">→</span>}
        </div>
        <strong style={valueColor ? { color: valueColor } : undefined}>{value}</strong>
        {hint && <span className="sspp-stat-card-hint">{hint}</span>}
      </div>
    </SgdsCard>
  );
}
