"use client";

import { SegmentError } from "@/components/common/SegmentError";

export default function AccountError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <SegmentError {...props} scope="VEYRA // HESAP" />;
}
