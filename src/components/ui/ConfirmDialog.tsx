'use client';

import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = true,
  isLoading = false,
}: ConfirmDialogProps) {
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => cancelRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const titleId = `confirm-title-${title.replace(/\s+/g, '-').toLowerCase()}`;
  const descId = `confirm-desc-${title.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div 
        className="flex flex-col items-center text-center p-2" 
        role="alertdialog" 
        aria-modal="true" 
        aria-labelledby={titleId} 
        aria-describedby={descId}
      >
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border ${
            isDestructive
              ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400'
              : 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
          }`}
        >
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 id={titleId} className="text-base font-semibold text-foreground">{title}</h3>
        <p id={descId} className="text-xs text-muted-foreground mt-2 leading-relaxed mb-6">
          {message}
        </p>
        <div className="flex items-center gap-3 w-full">
          <Button
            ref={cancelRef}
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={isDestructive ? 'danger' : 'primary'}
            onClick={onConfirm}
            isLoading={isLoading}
            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white border-transparent"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
