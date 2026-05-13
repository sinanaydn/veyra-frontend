"use client";

/**
 * ImageDropzone — click or drag-drop multipart file uploader for car images.
 *
 *  - JPEG/PNG/WebP only (5 MB max). Client-side checks per FR-ADM-4.
 *  - Sequential upload to keep backend simple; each file shows progress.
 *  - Caller passes `disabled` (e.g., when image count == 10).
 */

import { useCallback, useRef, useState } from "react";
import { Upload, FileWarning, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useUploadCarImage } from "@/lib/mutations/useImageMutations";
import { isApiError } from "@/lib/api/errors";
import { t } from "@/messages/tr";
import { cn } from "@/lib/utils";

const ACCEPTED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

interface QueueItem {
  id: string;
  file: File;
  progress: number;
  status: "queued" | "uploading" | "done" | "error";
  message?: string;
}

interface Props {
  carId: number;
  disabled?: boolean;
  remainingSlots: number;
}

export function ImageDropzone({ carId, disabled, remainingSlots }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadCarImage(carId);
  const [isOver, setOver] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);

  const validate = (file: File): string | null => {
    if (!ACCEPTED.includes(file.type)) return t.admin.imageInvalidType;
    if (file.size > MAX_BYTES) return t.admin.imageTooLarge;
    return null;
  };

  const enqueue = useCallback(
    async (files: FileList | File[]) => {
      const arr = Array.from(files).slice(0, remainingSlots);
      if (arr.length === 0) return;

      const fresh: QueueItem[] = arr.map((f) => ({
        id: `${f.name}-${f.size}-${Date.now()}-${Math.random()}`,
        file: f,
        progress: 0,
        status: "queued",
      }));
      setQueue((q) => [...q, ...fresh]);

      for (const item of fresh) {
        const err = validate(item.file);
        if (err) {
          setQueue((q) =>
            q.map((x) =>
              x.id === item.id ? { ...x, status: "error", message: err } : x,
            ),
          );
          toast.error(err);
          continue;
        }
        setQueue((q) =>
          q.map((x) => (x.id === item.id ? { ...x, status: "uploading" } : x)),
        );
        try {
          await upload.mutateAsync({
            file: item.file,
            onProgress: (pct) =>
              setQueue((q) =>
                q.map((x) => (x.id === item.id ? { ...x, progress: pct } : x)),
              ),
          });
          setQueue((q) =>
            q.map((x) =>
              x.id === item.id ? { ...x, status: "done", progress: 100 } : x,
            ),
          );
        } catch (e) {
          const msg = isApiError(e) ? e.tr : t.admin.imageUploadFailed;
          setQueue((q) =>
            q.map((x) =>
              x.id === item.id ? { ...x, status: "error", message: msg } : x,
            ),
          );
          toast.error(msg);
        }
      }

      // Clear "done" items after a beat
      setTimeout(() => {
        setQueue((q) => q.filter((x) => x.status !== "done"));
      }, 1200);
    },
    [remainingSlots, upload],
  );

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          if (disabled) return;
          if (e.dataTransfer.files?.length) {
            void enqueue(e.dataTransfer.files);
          }
        }}
        className={cn(
          "relative grid place-items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-surface/40 px-6 py-12 text-center transition-colors",
          isOver && "border-accent/60 bg-accent/5",
          disabled && "opacity-50",
        )}
      >
        <div
          aria-hidden
          className="grid size-12 place-items-center rounded-full border border-border bg-background"
        >
          <Upload className="size-5 text-muted-foreground" aria-hidden />
        </div>
        <div className="space-y-1">
          <p className="text-[0.95rem] font-medium">
            {t.admin.imagesDropzone}
          </p>
          <p className="text-xs text-muted-foreground">
            {t.admin.imagesDropzoneHint}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          Dosya seç
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED.join(",")}
          className="hidden"
          onChange={(e) => {
            if (e.target.files) void enqueue(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Upload queue preview */}
      {queue.length > 0 && (
        <ul className="mt-3 space-y-2">
          {queue.map((it) => (
            <li
              key={it.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2"
            >
              <div className="grid size-8 place-items-center rounded-md bg-surface-2">
                {it.status === "error" ? (
                  <FileWarning className="size-4 text-destructive" aria-hidden />
                ) : it.status === "uploading" ? (
                  <Loader2 className="size-4 animate-spin text-accent" aria-hidden />
                ) : (
                  <Upload className="size-4 text-muted-foreground" aria-hidden />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.825rem]">{it.file.name}</p>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-border">
                  <div
                    className={cn(
                      "h-full transition-[width] duration-200",
                      it.status === "error" ? "bg-destructive" : "bg-accent",
                    )}
                    style={{ width: `${it.progress}%` }}
                  />
                </div>
                {it.message && (
                  <p className="mt-1 text-[0.7rem] text-destructive">
                    {it.message}
                  </p>
                )}
              </div>
              {it.status !== "uploading" && (
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() =>
                    setQueue((q) => q.filter((x) => x.id !== it.id))
                  }
                  aria-label={t.common.close}
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
