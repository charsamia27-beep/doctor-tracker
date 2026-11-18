'use client';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Delete', loading }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
        </>
      }
    >
      <div className="flex gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-500/10">
          <AlertTriangle className="h-5 w-5 text-rose-600" />
        </div>
        <p className="text-sm leading-relaxed text-ink-600">{message}</p>
      </div>
    </Modal>
  );
}
