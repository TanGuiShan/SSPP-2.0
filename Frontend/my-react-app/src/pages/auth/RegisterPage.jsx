import SgdsCard from "@govtechsg/sgds-web-component/react/card";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";

const ROLES = [
  {
    id: "school",
    to: "/register/school",
    title: "School",
    description: "Browse available formations and request engagements for students.",
  },
  {
    id: "army-unit",
    to: "/register/unit",
    title: "Army unit",
    description: "Publish availability and host engagements as a formation or unit.",
  },
  {
    id: "army-ambassador",
    to: "/register/ambassador",
    title: "Army ambassador",
    description: "Volunteer individually or join an ambassador team for school sharing sessions.",
  },
];

export default function RegisterPage() {
  const navigate = useNavigate();

  return (
    <AuthLayout>
      <div className="mb-8">
        <p className="eyebrow">New account</p>
        <h1>Create an account</h1>
        <p className="sspp-page-subtitle">Choose the account type that best describes you.</p>
      </div>

      <div className="space-y-3">
        {ROLES.map((role) => (
          <SgdsCard
            key={role.id}
            noPadding
            className="cursor-pointer"
            role="button"
            tabIndex={0}
            onClick={() => navigate(role.to)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                navigate(role.to);
              }
            }}
          >
            <div className="flex items-center justify-between gap-4 p-5">
              <div>
                <h2 className="text-base">{role.title}</h2>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">{role.description}</p>
              </div>
              <span aria-hidden="true" className="text-xl">→</span>
            </div>
          </SgdsCard>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Link to="/login">← Back to sign in</Link>
      </div>
    </AuthLayout>
  );
}
