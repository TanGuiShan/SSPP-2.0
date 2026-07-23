export default function PageHeader({ eyebrow, title, subtitle, action }) {
  return (
    <header className="sspp-page-header">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {subtitle && <p className="sspp-page-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="sspp-page-action">{action}</div>}
    </header>
  );
}
