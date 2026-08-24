import React from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const MODAL_SIZES = {
  xs: "max-w-[90vw] sm:max-w-[360px]",
  sm: "max-w-[90vw] sm:max-w-[480px]",
  md: "max-w-[95vw] sm:max-w-[640px]",
  lg: "max-w-[95vw] sm:max-w-[768px]",
  xl: "max-w-[95vw] sm:max-w-[1024px]",
} as const

type ModalSize = keyof typeof MODAL_SIZES

export interface ModalProps extends Omit<React.ComponentProps<"div">, "title"> {
  title?: React.ReactNode
  description?: string
  open: boolean
  setOpen: (open: boolean) => void
  onClose?: () => void
  children: React.ReactNode
  size?: ModalSize
  /**
   * If false, the modal cannot be closed by clicking the backdrop,
   * pressing Escape, or the built-in close (X) button.
   * You'll need to close it programmatically via `setOpen(false)`.
   * @default true
   */
  closeable?: boolean
}

export const DialogModal = ({
  title,
  description,
  open,
  setOpen,
  onClose,
  children,
  size = "md",
  closeable = true,
  className,
  ...props
}: ModalProps) => {
  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        // Block any close attempt (backdrop, escape, X button) when not closeable
        if (!closeable && !val) return

        setOpen(val)
        if (!val) onClose?.()
      }}
    >
      <DialogContent
        className={`flex max-h-[85vh] flex-col ${MODAL_SIZES[size]}`}
        showCloseButton={closeable}
      >
        <DialogHeader className="shrink-0">
          <DialogTitle>{title ?? ""}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div {...props} className={`min-h-0 flex-1 overflow-y-auto ${className ?? ""}`}>
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}