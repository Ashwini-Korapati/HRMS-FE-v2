import React from "react";

export default function SmartToster({ message, duration = 3000, onClose }) {
  const [open, setOpen] = React.useState(Boolean(message));
  React.useEffect(() => {
    if (!message) return;
    setOpen(true);
    const t = setTimeout(() => {
      setOpen(false);
      onClose && onClose();
    }, Math.max(1000, duration));
    return () => clearTimeout(t);
  }, [message, duration, onClose]);

  if (!open) return null;
  return (
    <div className="fixed top-4 right-4 z-[1000]">
      <div className="max-w-sm rounded-xl border border-orange-200 bg-white shadow-lg px-3 py-2 flex items-start gap-2">
        <div className="h-6 w-6 rounded-md bg-orange-100 text-orange-700 grid place-items-center border border-orange-200">⚡</div>
        <div className="text-sm text-neutral-800">{message}</div>
      </div>
    </div>
  );
}
