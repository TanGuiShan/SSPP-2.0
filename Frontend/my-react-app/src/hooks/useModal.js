// hooks/useModal.js
// Tracks open/closed state for a modal plus an optional payload (e.g. which
// formation card was clicked), so the modal knows what it's editing/showing.

import { useState } from "react";

export function useModal() {
  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState(null);

  const openModal = (data = null) => {
    setPayload(data);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setPayload(null);
  };

  return { open, payload, openModal, closeModal };
}

export default useModal;