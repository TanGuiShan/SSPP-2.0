import { useEffect, useRef } from "react";
import SgdsDrawer from "@govtechsg/sgds-web-component/react/drawer";
import SgdsModal from "@govtechsg/sgds-web-component/react/modal";

/**
 * Shared SGDS modal/drawer wrapper. Public API unchanged so existing pages
 * keep working: <Modal open={...} onClose={...} variant="drawer|centered" />.
 *
 * Two things this has to get right:
 *
 * 1. OPENING. React 19 passes `open` to a custom element as a property, and
 *    SGDS's dialog doesn't reliably open from that prop change alone. So we
 *    drive it through the element's own show()/hide() methods via a ref,
 *    which is what the SGDS docs recommend.
 *
 * 2. CLOSING. Only `sgds-request-close` means "the user tried to dismiss
 *    this" (close button, overlay click, or Escape — it carries a `source`).
 *    `sgds-after-hide` is just an animation-finished lifecycle event and
 *    fires while the dialog settles its initial state; wiring onClose to it
 *    makes a freshly opened drawer immediately close itself. So we listen to
 *    request-close ONLY.
 */
export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  variant = "drawer",
  size,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (open) {
      if (typeof el.show === "function") el.show();
      else el.setAttribute("open", "");
    } else {
      if (typeof el.hide === "function") el.hide();
      else el.removeAttribute("open");
    }
  }, [open]);

  const handleRequestClose = () => onClose?.();

  const commonProps = { ref, size: size ?? "md" };

  if (variant === "drawer") {
    return (
      <SgdsDrawer
        {...commonProps}
        placement="end"
        ariaLabel={title || "Dialog"}
        onSgdsRequestClose={handleRequestClose}
      >
        {title && <span slot="title">{title}</span>}
        {subtitle && <span slot="description">{subtitle}</span>}
        <div className="sgds-dialog-body">{children}</div>
      </SgdsDrawer>
    );
  }

  return (
    <SgdsModal {...commonProps} onSgdsClose={handleRequestClose}>
      {title && <span slot="title">{title}</span>}
      {subtitle && <span slot="description">{subtitle}</span>}
      <div className="sgds-dialog-body">{children}</div>
    </SgdsModal>
  );
}
