import { businessCardQrBlog } from "@/data/blogPosts/businessCardQr";
import { customLogoBlog } from "@/data/blogPosts/customLogo";
import { googleReviewQrBlog } from "@/data/blogPosts/googleReviewQr";
import { howQrWorksBlog } from "@/data/blogPosts/howQrWorks";
import { instagramQrBlog } from "@/data/blogPosts/instagramQr";
import { qrSafetyBlog } from "@/data/blogPosts/qrSafety";
import { restaurantMenuBlog } from "@/data/blogPosts/restaurantMenu";
import { smallBusinessPracticalBlog } from "@/data/blogPosts/smallBusinessPractical";
import { smallBusinessSalesBlog } from "@/data/blogPosts/smallBusinessSales";
import { staticVsDynamicBlog } from "@/data/blogPosts/staticVsDynamic";
import { trackScansBlog } from "@/data/blogPosts/trackScans";
import { whatIsQrBlog } from "@/data/blogPosts/whatIsQr";
import { whatsappQrBlog } from "@/data/blogPosts/whatsappQr";
import { wifiQrBlog } from "@/data/blogPosts/wifiQr";
import type { BlogPost } from "@/data/blogTypes";

export type { BlogPost } from "@/data/blogTypes";

const allPosts: BlogPost[] = [
  whatIsQrBlog,
  howQrWorksBlog,
  smallBusinessSalesBlog,
  qrSafetyBlog,
  staticVsDynamicBlog,
  instagramQrBlog,
  googleReviewQrBlog,
  businessCardQrBlog,
  smallBusinessPracticalBlog,
  restaurantMenuBlog,
  trackScansBlog,
  customLogoBlog,
  wifiQrBlog,
  whatsappQrBlog,
];

export const blogs: Record<string, BlogPost> = Object.fromEntries(
  allPosts.map((post) => [post.slug, post])
);
