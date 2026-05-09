"use client";

/**
 * Hesap silme — destructive confirmation flow.
 *
 * UX:
 *   1. Trigger: "Hesabımı Sil" button in /account/settings danger zone.
 *   2. AlertDialog opens with warning copy + email re-entry field.
 *   3. Submit disabled until typed email exactly matches the user's email.
 *   4. On submit: deleteSelf() → logout() → router.replace("/").
 *
 * If the BFF is reachable, cookies clear server-side. We also clear the
 * local Zustand store so any client UI reflects logged-out state.
 */

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { TriangleAlert } from "lucide-react";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useDeleteAccount } from "@/lib/mutations/useDeleteAccount";
import { isApiError } from "@/lib/api/errors";
import { t } from "@/messages/tr";
import { cn } from "@/lib/utils";

interface Props {
  email: string;
}

export function DeleteAccountDialog({ email }: Props) {
  const router = useRouter();
  const deleteAccount = useDeleteAccount();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const matches = confirmText.trim().toLowerCase() === email.toLowerCase();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matches) {
      toast.error(t.account.deleteAccountTypeMismatch);
      return;
    }
    try {
      await deleteAccount.mutateAsync();
      toast.success(t.account.deleteAccountSuccess);
      // Hard nav so middleware re-evaluates
      router.replace("/");
    } catch (err) {
      const msg = isApiError(err) ? err.tr : t.errors.networkError;
      toast.error(msg);
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setConfirmText("");
      }}
    >
      <AlertDialogTrigger
        render={
          <button
            type="button"
            className={cn(
              "inline-flex h-10 items-center justify-center gap-2 rounded-full",
              "border border-destructive/50 bg-destructive/10 px-5",
              "text-[0.85rem] font-medium text-destructive",
              "transition-colors hover:bg-destructive/15",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40",
            )}
          />
        }
      >
        <TriangleAlert className="size-3.5" aria-hidden />
        {t.account.deleteAccount}
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <span className="inline-flex size-10 items-center justify-center rounded-xl border border-destructive/40 bg-destructive/10 text-destructive">
            <TriangleAlert className="size-5" aria-hidden />
          </span>
          <AlertDialogTitle>{t.account.deleteAccount}</AlertDialogTitle>
          <AlertDialogDescription>
            {t.account.deleteAccountWarning}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={onSubmit} className="grid gap-3">
          <label className="grid gap-2">
            <span className="text-[0.78rem] text-muted-foreground">
              {t.account.deleteAccountConfirmEmail}
            </span>
            <span
              className="font-mono text-[0.78rem] tabular-nums text-foreground/80"
              data-numeric
            >
              {email}
            </span>
            <input
              type="email"
              autoComplete="off"
              autoFocus
              spellCheck={false}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className={cn(
                "h-11 w-full rounded-lg border bg-background/60 px-3 text-sm font-medium",
                "outline-none transition-colors",
                "border-border focus:border-destructive",
                matches && confirmText.length > 0 && "border-success",
              )}
              placeholder={email}
              aria-label={t.account.deleteAccountConfirmEmail}
            />
          </label>

          <AlertDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={deleteAccount.isPending}
            >
              {t.common.cancel}
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={!matches || deleteAccount.isPending}
            >
              {deleteAccount.isPending
                ? t.common.deleting
                : t.account.deleteAccount}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
