"use client";

/**
 * Admin · Users — list + role switch + delete.
 *
 * Self-protection (FR-ADM-8): the row matching the current admin's userId
 * has its action menu disabled (no self-demote, no self-delete).
 *
 * Backend UserResponse does NOT include role, so we don't render a role
 * column; the dropdown lets the admin promote/demote without seeing the
 * current value. After a successful changeRole call we invalidate.
 */

import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, ShieldOff, Trash2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable, IdCell, NumCell } from "@/components/admin/DataTable";
import { Pager } from "@/components/admin/Pager";
import { RowActions, RowIconButton } from "@/components/admin/RowActions";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useUsers } from "@/lib/queries/useUsers";
import {
  useChangeRole,
  useDeleteUser,
} from "@/lib/mutations/useUserMutations";
import { useAuth } from "@/store/auth";
import { isApiError } from "@/lib/api/errors";
import { formatDate } from "@/lib/format";
import type { Role, User } from "@/lib/api/types";
import { t } from "@/messages/tr";

const PAGE_SIZE = 20;

interface RoleAction {
  user: User;
  role: Role;
}

export default function AdminUsersPage() {
  const session = useAuth((s) => s.user);
  const selfId = session?.userId ?? -1;

  const [page, setPage] = useState(0);
  const users = useUsers({ page, size: PAGE_SIZE, sort: ["createdAt,desc"] });
  const del = useDeleteUser();
  const changeRole = useChangeRole();
  const [toDelete, setToDelete] = useState<User | null>(null);
  const [roleAction, setRoleAction] = useState<RoleAction | null>(null);

  const onDelete = async () => {
    if (!toDelete) return;
    try {
      await del.mutateAsync(toDelete.id);
      toast.success(t.admin.userDeleted);
      setToDelete(null);
    } catch (err) {
      toast.error(isApiError(err) ? err.tr : t.errors.networkError);
    }
  };

  const onChangeRole = async () => {
    if (!roleAction) return;
    try {
      await changeRole.mutateAsync({
        userId: roleAction.user.id,
        body: { role: roleAction.role },
      });
      toast.success(t.admin.userRoleChanged);
      setRoleAction(null);
    } catch (err) {
      toast.error(isApiError(err) ? err.tr : t.errors.networkError);
    }
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "id",
      header: t.admin.tableId,
      cell: ({ row }) => <IdCell id={row.original.id} />,
    },
    {
      id: "name",
      header: t.admin.tableName,
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">
            {row.original.firstName} {row.original.lastName}
            {row.original.id === selfId && (
              <span className="ml-2 inline-flex items-center rounded-full bg-accent/15 px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-accent">
                {t.admin.userYou}
              </span>
            )}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: t.admin.tableEmail,
      cell: ({ row }) => (
        <span className="font-mono text-[0.78rem] tabular-nums text-muted-foreground">
          {row.original.email}
        </span>
      ),
    },
    {
      accessorKey: "phone",
      header: t.admin.tablePhone,
      cell: ({ row }) => (
        <NumCell>
          {row.original.phone || (
            <span className="text-muted-foreground/60">—</span>
          )}
        </NumCell>
      ),
    },
    {
      accessorKey: "createdAt",
      header: t.admin.tableCreatedAt,
      cell: ({ row }) => (
        <NumCell>{formatDate(row.original.createdAt)}</NumCell>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">{t.admin.tableActions}</span>,
      cell: ({ row }) => {
        const isSelf = row.original.id === selfId;
        if (isSelf) {
          return (
            <RowActions>
              <span className="px-2 text-xs text-muted-foreground">
                {t.admin.cannotDemoteSelf}
              </span>
            </RowActions>
          );
        }
        return (
          <RowActions>
            <RowIconButton
              label={t.admin.promoteUser}
              tone="accent"
              onClick={() =>
                setRoleAction({ user: row.original, role: "ADMIN" })
              }
            >
              <ShieldCheck className="size-4" aria-hidden />
            </RowIconButton>
            <RowIconButton
              label={t.admin.demoteUser}
              onClick={() =>
                setRoleAction({ user: row.original, role: "USER" })
              }
            >
              <ShieldOff className="size-4" aria-hidden />
            </RowIconButton>
            <RowIconButton
              label={t.common.delete}
              tone="danger"
              onClick={() => setToDelete(row.original)}
            >
              <Trash2 className="size-4" aria-hidden />
            </RowIconButton>
          </RowActions>
        );
      },
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        eyebrow={t.admin.eyebrowUsers}
        title={t.admin.sectionUsers}
        description={t.admin.usersSubtitle}
      />

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <DataTable
          columns={columns}
          data={users.data?.content ?? []}
          isLoading={users.isLoading}
          emptyTitle={t.admin.usersEmpty}
          className="rounded-none border-0"
        />
        <Pager
          page={users.data?.pageNumber ?? page}
          totalPages={users.data?.totalPages ?? 0}
          totalElements={users.data?.totalElements}
          onPageChange={setPage}
        />
      </div>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title={t.admin.confirmDeleteTitle}
        description={t.admin.deleteConfirmIrreversible}
        loading={del.isPending}
        onConfirm={onDelete}
      />
      <ConfirmDialog
        open={!!roleAction}
        onOpenChange={(v) => !v && setRoleAction(null)}
        variant="default"
        title={t.admin.changeRole}
        description={
          roleAction
            ? `${roleAction.user.firstName} ${roleAction.user.lastName} → ${
                roleAction.role === "ADMIN"
                  ? t.admin.roleAdmin
                  : t.admin.roleUser
              }`
            : undefined
        }
        confirmLabel={t.common.confirm}
        loading={changeRole.isPending}
        onConfirm={onChangeRole}
      />
    </div>
  );
}
