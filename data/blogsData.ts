import { bestFreeQrGeneratorBlog } from "@/data/blogPosts/bestFreeQrGenerator";
import { bestRestaurantQrIndiaBlog } from "@/data/blogPosts/bestRestaurantQrIndia";
import { bitlyVsQrTigerBlog } from "@/data/blogPosts/bitlyVsQrTiger";
import { businessCardQrBlog } from "@/data/blogPosts/businessCardQr";
import { canvaQrVsDedicatedBlog } from "@/data/blogPosts/canvaQrVsDedicated";
import { customLogoBlog } from "@/data/blogPosts/customLogo";
import { editableQrBlog } from "@/data/blogPosts/editableQr";
import { freeVsPaidQrGeneratorBlog } from "@/data/blogPosts/freeVsPaidQrGenerator";
import { googleReviewQrBlog } from "@/data/blogPosts/googleReviewQr";
import { howQrWorksBlog } from "@/data/blogPosts/howQrWorks";
import { instagramQrBlog } from "@/data/blogPosts/instagramQr";
import { qrCodeMonkeyVsDynamicBlog } from "@/data/blogPosts/qrCodeMonkeyVsDynamic";
import { qrSafetyBlog } from "@/data/blogPosts/qrSafety";
import { qrTigerAlternativeBlog } from "@/data/blogPosts/qrTigerAlternative";
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
  editableQrBlog,
  instagramQrBlog,
  googleReviewQrBlog,
  businessCardQrBlog,
  smallBusinessPracticalBlog,
  restaurantMenuBlog,
  trackScansBlog,
  customLogoBlog,
  wifiQrBlog,
  whatsappQrBlog,
  bestFreeQrGeneratorBlog,
  qrCodeMonkeyVsDynamicBlog,
  canvaQrVsDedicatedBlog,
  qrTigerAlternativeBlog,
  bitlyVsQrTigerBlog,
  bestRestaurantQrIndiaBlog,
  freeVsPaidQrGeneratorBlog,
];

export const blogs: Record<string, BlogPost> = Object.fromEntries(
  allPosts.map((post) => [post.slug, post])
);
