'use client';

import { showToast } from '@/lib/toast';

interface CopyButtonProps {
  text: string;
  label: string;
}

export function CopyButton({ text, label }: CopyButtonProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      showToast.success('Code copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      showToast.error('Failed to copy code');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="text-xs text-gray-400 hover:text-white transition-colors"
      aria-label={label}
    >
      <i className="fas fa-copy mr-1"></i>Copy
    </button>
  );
}

