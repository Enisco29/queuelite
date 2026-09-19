"use client";

import { useEffect, useRef } from "react";
import { Button } from "./button";

export function Modal({ open, title, description, onClose, children, footer }: { open: boolean; title: string; description?: string; onClose: () => void; children?: React.ReactNode; footer?: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return <dialog ref={ref} onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === ref.current) onClose(); }} className="m-auto w-[calc(100%_-_2rem)] max-w-[30rem] rounded-2xl border border-[#dde3dd] bg-white p-0 text-[#17201a] shadow-[0_20px_60px_rgba(15,23,18,.18)]">
    <div className="p-5 sm:p-6"><div className="flex items-start justify-between gap-5"><div><h2 className="text-xl font-semibold tracking-[-.02em]">{title}</h2>{description && <p className="mt-2 text-sm leading-6 text-[#667069]">{description}</p>}</div><Button size="small" variant="quiet" aria-label="Close dialog" onClick={onClose}>×</Button></div>{children && <div className="mt-5">{children}</div>}{footer && <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{footer}</div>}</div>
  </dialog>;
}

export function ConfirmDialog({ open, title, description, confirmLabel, danger = false, pending = false, onClose, onConfirm }: { open: boolean; title: string; description: string; confirmLabel: string; danger?: boolean; pending?: boolean; onClose: () => void; onConfirm: () => void }) {
  return <Modal open={open} title={title} description={description} onClose={onClose} footer={<><Button variant="secondary" disabled={pending} onClick={onClose}>Cancel</Button><Button variant={danger ? "danger" : "primary"} disabled={pending} onClick={onConfirm}>{pending ? "Working…" : confirmLabel}</Button></>} />;
}
