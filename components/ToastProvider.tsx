"use client";

import { Toaster } from "sonner";

/** Global Sonner toaster — replaces the old react-toastify container. */
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      expand={false}
      duration={3000}
      theme="light"
      className="toaster-sonner"
      toastOptions={{
        classNames: {
          toast: "toast-sonner",
          title: "toast-sonner-title",
          description: "toast-sonner-description",
          closeButton: "toast-sonner-close",
        },
      }}
    />
  );
}
