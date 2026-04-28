/**
 * Client-side auth state — mirrors what's in the `veyra_user` cookie.
 * Reference: IMPLEMENTATION.md §4.8
 *
 * The actual JWT (`veyra_at`) is httpOnly and inaccessible from JS.
 * This store only exposes the metadata needed for UI (greet user, show
 * role-gated nav). Hydration runs once on mount.
 */

import { create } from "zustand";
import type { Role, SessionUser } from "@/lib/api/types";

interface AuthState {
  user: { userId: number; email: string } | null;
  role: Role | null;
  hydrated: boolean;
  hydrate: () => void;
  setSession: (s: SessionUser) => void;
  clear: () => void;
}

function readUserCookie(): SessionUser | null {
  if (typeof document === "undefined") return null;
  const raw = document.cookie
    .split("; ")
    .find((c) => c.startsWith("veyra_user="))
    ?.split("=")[1];
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<SessionUser>;
    if (
      typeof parsed.userId === "number" &&
      typeof parsed.email === "string" &&
      (parsed.role === "ADMIN" || parsed.role === "USER")
    ) {
      return {
        userId: parsed.userId,
        email: parsed.email,
        role: parsed.role,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  role: null,
  hydrated: false,
  hydrate: () => {
    const session = readUserCookie();
    if (session) {
      set({
        user: { userId: session.userId, email: session.email },
        role: session.role,
        hydrated: true,
      });
    } else {
      set({ user: null, role: null, hydrated: true });
    }
  },
  setSession: (s) =>
    set({
      user: { userId: s.userId, email: s.email },
      role: s.role,
      hydrated: true,
    }),
  clear: () => set({ user: null, role: null, hydrated: true }),
}));
