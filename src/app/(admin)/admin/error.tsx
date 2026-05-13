"use client";

import { SegmentError } from "@/components/common/SegmentError";

export default function AdminError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <SegmentError {...props} scope="VEYRA // YÖNETİM" />;
}
