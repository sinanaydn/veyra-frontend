"use client";

/**
 * ImageReorderGrid — dnd-kit sortable grid for CarImage thumbnails.
 *
 * - Drag (mouse, touch, keyboard) to reorder; drop commits via
 *   `useReorderCarImages` (optimistic update).
 * - Click "Kapak yap" → setPrimary mutation.
 * - Click "Sil" → opens ConfirmDialog (rendered by parent).
 */

import { useState } from "react";
import Image from "next/image";
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Star, StarOff, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  useReorderCarImages,
  useSetPrimaryImage,
} from "@/lib/mutations/useImageMutations";
import { isApiError } from "@/lib/api/errors";
import type { CarImage } from "@/lib/api/types";
import { t } from "@/messages/tr";
import { cn } from "@/lib/utils";

interface Props {
  carId: number;
  images: CarImage[];
  onRequestDelete: (img: CarImage) => void;
}

export function ImageReorderGrid({
  carId,
  images,
  onRequestDelete,
}: Props) {
  const reorder = useReorderCarImages(carId);
  const setPrimary = useSetPrimaryImage(carId);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Local mirror sorted by displayOrder for sortable IDs.
  const sorted = [...images].sort((a, b) => a.displayOrder - b.displayOrder);
  const ids = sorted.map((i) => i.id);

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(Number(active.id));
    const newIndex = ids.indexOf(Number(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    const next = arrayMove(sorted, oldIndex, newIndex);
    const body = {
      items: next.map((img, i) => ({
        imageId: img.id,
        displayOrder: i + 1,
      })),
    };
    reorder.mutate(body, {
      onError: (err) => {
        toast.error(
          isApiError(err) ? err.tr : t.admin.imageReorderFailed,
        );
      },
    });
  };

  const handleSetPrimary = (img: CarImage) => {
    if (img.primary) return;
    setPrimary.mutate(img.id, {
      onSuccess: () => toast.success(t.admin.imagePrimaryUpdated),
      onError: (err) =>
        toast.error(isApiError(err) ? err.tr : t.errors.networkError),
    });
  };

  return (
    <div>
      <p className="mb-3 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-muted-foreground">
        {t.admin.imagesReorderHint}
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext items={ids} strategy={rectSortingStrategy}>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {sorted.map((img) => (
              <SortableTile
                key={img.id}
                image={img}
                onSetPrimary={() => handleSetPrimary(img)}
                onDelete={() => onRequestDelete(img)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortableTile({
  image,
  onSetPrimary,
  onDelete,
}: {
  image: CarImage;
  onSetPrimary: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });
  const [hovering, setHovering] = useState(false);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className={cn(
        "group/tile relative overflow-hidden rounded-xl border border-border bg-surface",
        image.primary && "ring-2 ring-accent/60 ring-offset-2 ring-offset-background",
        isDragging && "cursor-grabbing",
      )}
    >
      <div className="relative aspect-[4/3] w-full bg-surface-2">
        <Image
          src={image.url}
          alt=""
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover"
        />

        {/* Drag handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="absolute left-2 top-2 grid size-7 cursor-grab place-items-center rounded-md bg-background/80 text-foreground/80 backdrop-blur-md transition-colors hover:bg-background"
          aria-label="Sıralama"
        >
          <GripVertical className="size-3.5" aria-hidden />
        </button>

        {/* Primary tag */}
        {image.primary && (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-accent/90 px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-accent-foreground backdrop-blur-md">
            <Star className="size-3" aria-hidden />
            {t.admin.imagesPrimary}
          </span>
        )}

        {/* Hover toolbar */}
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-2 transition-opacity",
            hovering ? "opacity-100" : "opacity-0",
          )}
        >
          <button
            type="button"
            onClick={onSetPrimary}
            disabled={image.primary}
            className="inline-flex items-center gap-1 rounded-md bg-background/80 px-2 py-1 text-[0.7rem] font-medium text-foreground backdrop-blur-md transition-colors hover:bg-background disabled:opacity-50"
          >
            {image.primary ? (
              <>
                <StarOff className="size-3" aria-hidden />
                {t.admin.imagesPrimary}
              </>
            ) : (
              <>
                <Star className="size-3" aria-hidden />
                {t.admin.imagesSetPrimary}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex size-7 items-center justify-center rounded-md bg-background/80 text-destructive backdrop-blur-md transition-colors hover:bg-destructive hover:text-destructive-foreground"
            aria-label={t.admin.imagesDelete}
          >
            <Trash2 className="size-3.5" aria-hidden />
          </button>
        </div>
      </div>

      {/* Footer meta */}
      <div className="flex items-center justify-between px-3 py-2 text-[0.7rem] text-muted-foreground">
        <span className="font-mono tabular-nums">#{image.displayOrder}</span>
        <span className="font-mono tabular-nums">
          {(image.sizeBytes / 1024).toFixed(0)} KB
        </span>
      </div>
    </li>
  );
}
