'use client';

import React, { useState, useEffect } from 'react';
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getAllBlogs } from "@/lib/blogs";
import { ArrowRight, Calendar, Clock, QrCode, Mail, Check, Send } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function BlogsPage() {
  const allBlogs = getAllBlogs();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Fallback visual illustration template when post image is absent
  const renderFallbackImage = (slug: string) => {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-[#0046a1] to-[#001B50] flex flex-col justify-between p-8 text-white select-none overflow-hidden">
        {/* Decorative QR matrix pattern */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1.2px,transparent_1.2px)] bg-[size:12px_12px]" />
        
        <div className="flex justify-between items-start relative z-10">
          <span className="text-[9px] font-black tracking-widest uppercase bg-white/15 px-3 py-1 rounded border border-white/20 font-mono">
            Insights
          </span>
          <QrCode className="w-5 h-5 text-white/30" />
        </div>
        
        <div className="relative z-10 flex flex-col gap-2">
          <span className="text-[9px] font-bold font-mono tracking-widest opacity-60 uppercase">Knowledge Hub</span>
          <span className="text-base font-black tracking-tight leading-tight uppercase line-clamp-2">
            {slug.split('-').join(' ')}
          </span>
        </div>
      </div>
    );
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    
    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubscribed(true);
      setEmail("");
    }, 1800);
  };

  if (allBlogs.length === 0) {
    return (
      <div className="min-h-screen bg-white text-slate-800 flex flex-col justify-between">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto px-6 pt-32 pb-20 w-full flex items-center justify-center">
          <div className="text-center py-20 bg-slate-50 border border-slate-200 rounded-3xl max-w-md w-full">
            <p className="text-slate-500 font-medium">No blog posts available yet.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const featuredBlog = allBlogs[0];

  // Category filter mapping
  const filteredBlogs = allBlogs.filter((blog) => {
    if (selectedCategory === "All") {
      // Exclude featured blog from listing grid only in "All" view to prevent duplicate highlights
      return blog.slug !== featuredBlog.slug;
    }
    if (selectedCategory === "Guides & Tips") {
      return blog.slug === "what-is-a-qr-code-and-why-everyone-is-using-it" || 
             blog.slug === "how-qr-codes-actually-work-explained-like-youre-10";
    }
    if (selectedCategory === "Business Growth") {
      return blog.slug === "how-small-businesses-can-use-qr-codes-to-increase-sales";
    }
    if (selectedCategory === "Security & Safety") {
      return blog.slug === "are-qr-codes-safe-common-myths-and-real-facts";
    }
    return true;
  });

  const categories = [
    { label: "All Resources", id: "All" },
    { label: "Guides & Tips", id: "Guides & Tips" },
    { label: "Business Growth", id: "Business Growth" },
    { label: "Security & Safety", id: "Security & Safety" },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 relative overflow-x-clip flex flex-col justify-between">
      {/* Ambient background decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,27,80,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,27,80,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />
      <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/2 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#001B50]/2 blur-[120px] pointer-events-none" />

      <Header />

      <main className="relative z-10 flex-1 max-w-7xl mx-auto px-6 pt-32 pb-20 w-full">
        
        {/* Page Title */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-[#001B50] tracking-tight leading-none">
            Junction{" "}
            <span className="bg-gradient-to-r from-primary to-[#001B50] bg-clip-text text-transparent">
              Insights
            </span>
          </h1>
          <p className="text-slate-650 text-base leading-relaxed">
            Discover guides, business tutorials, security deep-dives, and optimization insights from our dynamic QR software architects.
          </p>
        </div>

        {/* FEATURED HERO ARTICLE (Only visible when Category is "All") */}
        {selectedCategory === "All" && (
          <div className="mb-16">
            <Link
              href={`/blog/${featuredBlog.slug}`}
              className="group grid grid-cols-1 lg:grid-cols-12 gap-8 bg-slate-50 border border-slate-200/80 rounded-[32px] p-6 lg:p-8 hover:border-slate-350 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 relative overflow-hidden no-underline flex flex-col"
            >
              {/* Highlight image / illustration (7 columns width) */}
              <div className="relative h-64 lg:h-96 rounded-2xl overflow-hidden border border-slate-200/40 lg:col-span-7 bg-slate-50 flex items-center justify-center">
                {featuredBlog.hero?.image ? (
                  <Image
                    src={featuredBlog.hero.image}
                    alt={featuredBlog.hero.imageAlt || featuredBlog.hero.title}
                    fill
                    className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    priority
                  />
                ) : (
                  renderFallbackImage(featuredBlog.slug)
                )}
                
                <span className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-[#001B50]/90 backdrop-blur-xs text-white text-[9px] font-extrabold uppercase tracking-widest">
                  Featured
                </span>
              </div>

              {/* Text content details (5 columns width) */}
              <div className="lg:col-span-5 flex flex-col justify-center space-y-4 py-4 px-2">
                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {featuredBlog.publishedAt && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-450" />
                      <time dateTime={featuredBlog.publishedAt}>
                        {new Date(featuredBlog.publishedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </time>
                    </div>
                  )}
                  {featuredBlog.readTime && (
                    <div className="flex items-center gap-1.5 border-l border-slate-200 pl-4">
                      <Clock className="w-3.5 h-3.5 text-slate-450" />
                      <span>{featuredBlog.readTime} Min Read</span>
                    </div>
                  )}
                </div>

                <h2 className="text-2xl lg:text-3xl font-black text-[#001B50] group-hover:text-primary transition-colors duration-300 tracking-tight leading-tight">
                  {featuredBlog.hero.title}
                </h2>

                <p className="text-slate-650 text-sm leading-relaxed">
                  {featuredBlog.hero.subtitle}
                </p>

                <div className="pt-2 flex items-center gap-2 text-xs font-black text-primary uppercase tracking-wider">
                  <span>Read Featured Article</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* INTERACTIVE CATEGORY TABS */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10 border-b border-slate-200/60 pb-8 relative z-20 select-none">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all duration-300 border ${
                selectedCategory === category.id
                  ? "bg-[#0046a1] border-[#0046a1] text-white shadow-md shadow-blue-100 scale-102"
                  : "bg-slate-100 border-slate-200/80 text-slate-650 hover:bg-slate-250/50 hover:border-slate-300"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* BLOGS CARDS GRID */}
        {filteredBlogs.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 border border-slate-200/85 rounded-3xl max-w-md mx-auto relative z-10">
            <p className="text-slate-500 font-bold">No articles match this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            {filteredBlogs.map((blog) => (
              <Link
                key={blog.slug}
                href={`/blog/${blog.slug}`}
                className="group bg-white border border-slate-200/80 hover:border-slate-350 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-1.5 flex flex-col justify-between shadow-3xs no-underline"
              >
                <div>
                  {/* Card Cover image / vector */}
                  <div className="relative h-52 w-full overflow-hidden border-b border-slate-100/60 bg-slate-50 flex items-center justify-center">
                    {blog.hero?.image ? (
                      <Image
                        src={blog.hero.image}
                        alt={blog.hero.imageAlt || blog.hero.title}
                        fill
                        className="object-cover group-hover:scale-103 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 30vw"
                      />
                    ) : (
                      renderFallbackImage(blog.slug)
                    )}
                  </div>

                  {/* Card Content details */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {blog.publishedAt && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-450" />
                          <time dateTime={blog.publishedAt}>
                            {new Date(blog.publishedAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </time>
                        </div>
                      )}
                      {blog.readTime && (
                        <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
                          <Clock className="w-3.5 h-3.5 text-slate-450" />
                          <span>{blog.readTime} min read</span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-lg font-extrabold text-[#001B50] group-hover:text-primary transition-colors duration-300 leading-snug line-clamp-2">
                      {blog.hero.title}
                    </h3>

                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-2">
                      {blog.hero.subtitle}
                    </p>
                  </div>
                </div>

                {/* Card footer CTA */}
                <div className="p-6 pt-0">
                  <span className="inline-flex items-center gap-1.5 text-primary font-extrabold text-[11px] uppercase tracking-wider group-hover:gap-2.5 transition-all">
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* NEWSLETTER SUBSCRIPTION CALLOUT */}
        <div className="bg-gradient-to-r from-blue-50/50 via-indigo-50/20 to-blue-50/50 border border-slate-200/80 p-8 lg:p-12 rounded-[32px] relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 mt-24 shadow-3xs">
          {/* Background circles */}
          <div className="absolute top-[-20%] left-[-10%] w-52 h-52 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-20%] right-[-10%] w-72 h-72 rounded-full bg-secondary/5 blur-3xl pointer-events-none" />

          {/* Left Text */}
          <div className="space-y-2 lg:max-w-xl text-center lg:text-left relative z-10">
            <h3 className="text-xl lg:text-2xl font-black text-[#001B50] tracking-tight flex items-center justify-center lg:justify-start gap-2">
              <Mail className="w-5.5 h-5.5 text-primary" />
              <span>Subscribe to Insights</span>
            </h3>
            <p className="text-slate-655 text-xs sm:text-sm leading-relaxed">
              Get dynamic QR marketing case studies, conversion optimization tutorials, and business campaign strategies delivered straight to your inbox.
            </p>
          </div>

          {/* Right Input Form */}
          <div className="w-full lg:w-auto relative z-10">
            {isSubscribed ? (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3 text-emerald-800 text-xs sm:text-sm font-extrabold shadow-sm animate-scaleUp max-w-sm mx-auto">
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>Successfully subscribed! Check your inbox.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 w-full sm:max-w-md mx-auto">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0046a1] focus:ring-1 focus:ring-[#0046a1] transition-all min-w-[240px] shadow-3xs"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#0046a1] hover:bg-[#003b8f] disabled:bg-slate-400 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-md shadow-blue-100 flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-lg transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Subscribing...</span>
                    </>
                  ) : (
                    <>
                      <span>Join Insights</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}

