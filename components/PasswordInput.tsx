"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import React, { useState } from "react";

const DEFAULT_CLASS =
  "w-full bg-slate-50 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-3 pl-12 pr-12 text-slate-800 placeholder-slate-400 transition-all outline-none";

type PasswordInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  leftIcon?: React.ReactNode;
};

export default function PasswordInput({
  className,
  leftIcon,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      {leftIcon === undefined ? (
        <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      ) : (
        leftIcon
      )}
      <input
        {...props}
        type={visible ? "text" : "password"}
        className={className || DEFAULT_CLASS}
        autoComplete={props.autoComplete || "current-password"}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
        aria-label={visible ? "Hide password" : "Show password"}
        tabIndex={0}
      >
        {visible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );
}
