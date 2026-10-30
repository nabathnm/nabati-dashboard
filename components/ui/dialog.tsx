"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { cn } from "cn";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";

function Dialog(props: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger(props: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal(props: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogOverlay({ className, ...props }: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/40",
        "transition-opacity duration-200",
        "supports-backdrop-filter:backdrop-blur-[2px]",
        "data-ending-style:opacity-0",
        "data-starting-style:opacity-0",
        className
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean;
}) {
  return (
    <DialogPortal>
      <DialogOverlay />

      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          "fixed left-1/2 top-1/2 z-50",
          "w-[calc(100%-2rem)] max-w-lg",
          "-translate-x-1/2 -translate-y-1/2",
          "flex flex-col overflow-hidden rounded-2xl bg-card",
          // shadow berlapis: tipis -> sedang -> lebar, jadi gradasinya halus
          "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.06),0_12px_24px_rgba(0,0,0,0.08),0_24px_48px_rgba(0,0,0,0.10)]",
          "transition-[opacity,transform] duration-200 ease-out",
          "data-starting-style:scale-[0.98] data-starting-style:opacity-0",
          "data-ending-style:scale-[0.98] data-ending-style:opacity-0",
          className
        )}

        {...props}
      >
        {children}

        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Tutup"
                className="absolute right-3 top-3 z-10 rounded-full text-background/80 hover:bg-background/15 hover:text-background"
              >
                <XIcon className="size-4" />
              </Button>
            }
          />
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        "relative z-10 bg-card-foreground text-background",
        "px-6 py-5 pr-14 sm:px-7 sm:py-5 sm:pr-14",
        // bayangan halus yang jatuh ke body, memisahkan header dari content
        "shadow-[0_1px_2px_rgba(0,0,0,0.10),0_4px_12px_-2px_rgba(0,0,0,0.18)]",
        className
      )}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 ",
        "sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm leading-relaxed opacity-75", className)}
      {...props}
    />
  );
}

function DialogBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-body"
      className={cn(
        "bg-card text-card-foreground",
        "px-6 py-5 sm:px-7 sm:py-6",
        // border hanya di sisi kiri, kanan, dan bawah (atas tidak, karena menempel header)
        "border-x border-b-2 border-border/20 rounded-b-2xl",
        className
      )}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTrigger,
};
