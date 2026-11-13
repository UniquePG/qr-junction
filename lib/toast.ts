"use client";

import { toast as sonnerToast, type ExternalToast } from "sonner";

type ToastOptions = ExternalToast;

function withDefaults(options?: ToastOptions, duration = 3000): ToastOptions {
  return {
    duration,
    ...options,
  };
}

export const toast = Object.assign(
  (message: string, options?: ToastOptions) => sonnerToast(message, withDefaults(options)),
  {
    success: (message: string, options?: ToastOptions) =>
      sonnerToast.success(message, withDefaults(options, 3000)),
    error: (message: string, options?: ToastOptions) =>
      sonnerToast.error(message, withDefaults(options, 4000)),
    warning: (message: string, options?: ToastOptions) =>
      sonnerToast.warning(message, withDefaults(options, 3000)),
    info: (message: string, options?: ToastOptions) =>
      sonnerToast.info(message, withDefaults(options, 3000)),
    message: (message: string, options?: ToastOptions) =>
      sonnerToast.message(message, withDefaults(options, 3000)),
    dismiss: sonnerToast.dismiss,
    promise: sonnerToast.promise,
  },
);

export const showToast = {
  success: (message: string, options?: ToastOptions) => toast.success(message, options),
  error: (message: string, options?: ToastOptions) => toast.error(message, options),
  warning: (message: string, options?: ToastOptions) => toast.warning(message, options),
  info: (message: string, options?: ToastOptions) => toast.info(message, options),
  default: (message: string, options?: ToastOptions) => toast(message, options),
};
