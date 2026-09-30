"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DialogModal } from "@/components/ui/dialog-modal";

const SIZES = ["xs", "sm", "md", "lg", "xl", "full"] as const;

export function DialogModalSizesDemo() {
  const [size, setSize] = useState<(typeof SIZES)[number] | null>(null);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {SIZES.map((s) => (
          <Button key={s} variant="outline" onClick={() => setSize(s)}>
            {s}
          </Button>
        ))}
      </div>
      <DialogModal
        open={size !== null}
        setOpen={(open) => !open && setSize(null)}
        title={`Size: ${size ?? ""}`}
        size={size ?? "md"}
      >
        <div className="flex flex-col gap-3">
          {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
            <p key={n} className="text-muted-foreground">
              Paragraph {n}. Long content scrolls inside the body while the
              header stays fixed.
            </p>
          ))}
        </div>
      </DialogModal>
    </>
  );
}
