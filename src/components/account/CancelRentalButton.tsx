"use client";

/**
 * Confirm + cancel a rental — wraps AlertDialog + useCancelRental.
 * Used on /account/rentals/[id] (and could be reused on the list).
 */

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Slash } from "lucide-react";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useCancelRental } from "@/lib/mutations/useCancelRental";
import { isApiError } from "@/lib/api/errors";
import { t } from "@/messages/tr";
import { cn } from "@/lib/utils";

interface Props {
  rentalId: number;
  /** When false the trigger button is hidden — eg. after cancellation. */
  enabled?: boolean;
  /** Style override. Pass a className to swap the visual variant. */
  className?: string;
}

export function CancelRentalButton({
  rentalId,
  enabled = true,
  className,
}: Props) {
  const cancel = useCancelRental(rentalId);
  const [open, setOpen] = useState(false);

  if (!enabled) return null;

  const onConfirm = async () => {
    try {
      await cancel.mutateAsync();
      toast.success(t.account.statusCancelled);
      setOpen(false);
    } catch (err) {
      const msg = isApiError(err) ? err.tr : t.errors.networkError;
      toast.error(msg);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <button
            type="button"
            className={cn(
              "inline-flex h-10 items-center justify-center gap-2 rounded-full",
              "border border-destructive/40 bg-destructive/10 px-5",
              "text-[0.85rem] font-medium text-destructive",
              "transition-colors hover:bg-destructive/15",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40",
              className,
            )}
          />
        }
      >
        <Slash className="size-3.5" aria-hidden />
        {t.account.cancelRental}
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <span className="inline-flex size-10 items-center justify-center rounded-xl border border-destructive/40 bg-destructive/10 text-destructive">
            <Slash className="size-5" aria-hidden />
          </span>
          <AlertDialogTitle>{t.account.rentalCancelTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {t.account.rentalCancelDesc}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={cancel.isPending}
          >
            {t.account.rentalCancelKeep}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={cancel.isPending}
          >
            {cancel.isPending && (
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
            )}
            {t.account.rentalCancelConfirm}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
