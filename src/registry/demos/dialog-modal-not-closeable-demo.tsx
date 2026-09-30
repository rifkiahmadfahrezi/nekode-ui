"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DialogModal } from "@/components/ui/dialog-modal";

export function DialogModalNotCloseableDemo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Accept terms
      </Button>
      <DialogModal
        open={open}
        setOpen={setOpen}
        title="Terms of service"
        description="You must accept the terms to continue."
        size="sm"
        closeable={false}
      >
        <div className="flex flex-col gap-4">
          <p className="text-muted-foreground">
            Escape, backdrop clicks, and the close button are disabled. Only the
            button below closes this modal.
          </p>
          <Button className="self-end" onClick={() => setOpen(false)}>
            I agree
          </Button>
        </div>
      </DialogModal>
    </>
  );
}
