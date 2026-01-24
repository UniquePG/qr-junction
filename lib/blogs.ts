import { blogs } from '@/data/blogsData';
import type { BlogPost } from '@/data/blogsData';

// Helper function to get all blogs sorted by published date
export function getAllBlogs(): BlogPost[] {
  return Object.values(blogs).sort((a, b) => {
    const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return dateB - dateA; // Newest first
  });
}

