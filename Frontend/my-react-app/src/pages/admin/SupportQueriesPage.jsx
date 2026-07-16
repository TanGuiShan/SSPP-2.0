import React, { useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import { TextArea } from "../../components/common/Input";
import { useModal } from "../../hooks/useModal";

// Wireframe for this screen wasn't in the deck — this is a reasonable first pass.
const QUERIES = [
  { id: "Q1", from: "Swiss Cottage Secondary School", subject: "Need help with interest form", message: "The preferred date field won't accept dates in August. Is the window closed?", received: "12 Jul 2026", status: "Pending" },
  { id: "Q2", from: "3 SIR, Alpha Company", subject: "Issue with matching", message: "We set availability for July but haven't been matched to any school yet.", received: "9 Jul 2026", status: "Completed" },
];

export default function SupportQueriesPage() {
  const { open, payload, openModal, closeModal } = useModal();
  const [reply, setReply] = useState("");

  return (
    <>
      <PageHeader
        eyebrow="Help & Support"
        title="Support queries"
        subtitle="Queries from schools and units — reply within 10 working days"
      />

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[#78716C] bg-[#FAFAF9] border-b border-[#E7E5E4]">
              <th className="px-6 py-4 font-medium">From</th>
              <th className="px-6 py-4 font-medium">Subject</th>
              <th className="px-6 py-4 font-medium">Received</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {QUERIES.map((q) => (
              <tr key={q.id} className="border-b border-[#F5F5F4] last:border-0">
                <td className="px-6 py-4 font-medium">{q.from}</td>
                <td className="px-6 py-4 text-[#57534E]">{q.subject}</td>
                <td className="px-6 py-4 text-[#78716C]">{q.received}</td>
                <td className="px-6 py-4"><StatusBadge status={q.status} /></td>
                <td className="px-6 py-4 text-right">
                  <Button variant="outline" size="sm" onClick={() => openModal(q)}>
                    Open
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={closeModal} title="Reply to query" subtitle={payload?.from}>
        {payload && (
          <>
            <div className="rounded-lg bg-[#F5F5F4] p-4 mb-5">
              <p className="text-sm font-medium mb-1">{payload.subject}</p>
              <p className="text-sm text-[#57534E]">{payload.message}</p>
            </div>
            <TextArea
              label="Your reply"
              rows={6}
              placeholder="Write your reply here..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
            />
            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={closeModal}>Cancel</Button>
              <Button fullWidth onClick={closeModal}>Send reply</Button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}