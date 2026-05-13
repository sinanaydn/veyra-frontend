"use client";

import { SegmentError } from "@/components/common/SegmentError";

export default function MarketingError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <SegmentError {...props} scope="VEYRA // KATALOG" />;
}
