'use client';

import { showToast } from '@/lib/toast';

interface ShareButtonsProps {
  blogUrl: string;
  title: string;
}

export function ShareButtons({ blogUrl, title }: ShareButtonsProps) {
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(blogUrl);
      showToast.success('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      showToast.error('Failed to copy link');
    }
  };

  return (
    <div className="mt-12 flex flex-wrap items-center justify-center gap-4 border-t border-gray-200 pt-8">
      <span className="font-semibold text-gray-700">Share this article:</span>
      <div className="flex gap-3">
        <a
          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(blogUrl)}&text=${encodeURIComponent(title)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white transition hover:bg-blue-600"
          aria-label="Share on Twitter"
        >
          <i className="fab fa-twitter"></i>
        </a>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(blogUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700"
          aria-label="Share on Facebook"
        >
          <i className="fab fa-facebook-f"></i>
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(blogUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-700 text-white transition hover:bg-blue-800"
          aria-label="Share on LinkedIn"
        >
          <i className="fab fa-linkedin-in"></i>
        </a>
        <button
          onClick={handleCopyLink}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-600 text-white transition hover:bg-gray-700"
          aria-label="Copy link"
        >
          <i className="fas fa-link"></i>
        </button>
      </div>
    </div>
  );
}

