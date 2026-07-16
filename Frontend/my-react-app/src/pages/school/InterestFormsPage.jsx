import React, { useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import Button from "../../components/common/Button";
import { interestForms as seed } from "../../data/interestForms";

export default function InterestFormsPage() {
  const [forms, setForms] = useState(seed);

  const withdraw = (id) => {
    setForms((f) => f.map((row) => (row.id === id ? { ...row, status: "Withdrawn" } : row)));
  };

  return (
    <>
      <PageHeader
        eyebrow="My Interest Form"
        title="Track submitted requests"
        subtitle="Forms stay pending until an admin approves them and creates a match"
      />

      <div className="card overflow-hidden">
        {forms.length === 0 ? (
          <p className="text-sm text-[#78716C] py-16 text-center">
            No requests yet. Browse formations to submit one.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#78716C] bg-[#FAFAF9] border-b border-[#E7E5E4]">
                <th className="px-6 py-4 font-medium">Form ID</th>
                <th className="px-6 py-4 font-medium">Formation</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Engagement</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {forms.map((row) => (
                <tr key={row.id} className="border-b border-[#F5F5F4] last:border-0">
                  <td className="px-6 py-4 text-[#78716C]">{row.id}</td>
                  <td className="px-6 py-4 font-medium">{row.formation}</td>
                  <td className="px-6 py-4 text-[#57534E]">{row.date}</td>
                  <td className="px-6 py-4 text-[#57534E]">{row.engagement}</td>
                  <td className="px-6 py-4"><StatusBadge status={row.status} /></td>
                  <td className="px-6 py-4 text-right">
                    {row.status === "Pending" ? (
                      <Button variant="ghost" size="sm" onClick={() => withdraw(row.id)}>
                        <span className="text-[#B91C1C]">Withdraw</span>
                      </Button>
                    ) : (
                      <span className="text-[#A8A29E] text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}