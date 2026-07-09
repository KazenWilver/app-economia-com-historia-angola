"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";

interface AdminConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  itemLabel?: string;
  itemDetail?: string;
  isLoading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function AdminConfirmDeleteModal({
  isOpen,
  title = "Eliminar",
  message,
  itemLabel,
  itemDetail,
  isLoading = false,
  onCancel,
  onConfirm,
}: AdminConfirmDeleteModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <Card hoverLift={false} className="border-slate-200 dark:border-border-dark">
        <CardContent className="space-y-6 py-2">
          <p className="text-sm text-slate-700 dark:text-content-dark-secondary">
            {message}
          </p>

          {itemLabel ? (
            <p className="text-sm font-semibold text-slate-900 dark:text-content-dark-primary">
              {itemLabel}
              {itemDetail ? (
                <span className="mt-1 block text-xs font-normal text-slate-500 dark:text-content-dark-tertiary">
                  {itemDetail}
                </span>
              ) : null}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              className="min-h-11"
              disabled={isLoading}
              onClick={onCancel}
            >
              Não
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="min-h-11"
              isLoading={isLoading}
              onClick={onConfirm}
            >
              Sim
            </Button>
          </div>
        </CardContent>
      </Card>
    </Modal>
  );
}
