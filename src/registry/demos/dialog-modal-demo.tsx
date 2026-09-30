"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DialogModal } from "@/components/ui/dialog-modal";

export function DialogModalDemo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open modal
      </Button>
      <DialogModal
        open={open}
        setOpen={setOpen}
        title="Edit profile"
        description="Make changes to your profile here."
        size="sm"
      >
        <p className="text-muted-foreground">
          Any content goes here. The body scrolls when it grows taller than the
          viewport.
        </p>
      </DialogModal>
    </>
  );
}
