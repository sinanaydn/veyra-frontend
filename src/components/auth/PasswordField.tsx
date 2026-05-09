"use client";

/**
 * Password input with a show/hide toggle. Wraps FloatingField.
 */

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { FloatingField } from "./FloatingField";
import { t } from "@/messages/tr";

type Props = Omit<
  React.ComponentPropsWithoutRef<typeof FloatingField>,
  "type" | "trailing"
>;

export const PasswordField = React.forwardRef<HTMLInputElement, Props>(
  function PasswordField(props, ref) {
    const [visible, setVisible] = React.useState(false);
    return (
      <FloatingField
        ref={ref}
        type={visible ? "text" : "password"}
        autoComplete="current-password"
        trailing={
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? t.auth.hidePassword : t.auth.showPassword}
            className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            {visible ? (
              <EyeOff className="size-4" aria-hidden />
            ) : (
              <Eye className="size-4" aria-hidden />
            )}
          </button>
        }
        {...props}
      />
    );
  },
);
