'use client';

import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = true,
  isLoading = false,
  onConfirm,
  onClose
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 space-y-6 animate-scale-in relative shadow-xl">
        
        {/* Icon & Title Group */}
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl shrink-0 ${isDanger ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#001B50] leading-tight">{title}</h3>
            <p className="text-xs text-slate-500 leading-normal">{message}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-all cursor-pointer text-center disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all border-none flex items-center justify-center gap-1.5 ${
              isDanger 
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-100 hover:shadow-lg hover:shadow-red-200' 
                : 'bg-primary hover:bg-primary-hover text-white shadow-primary hover:shadow-primary-hover'
            } disabled:opacity-50`}
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
