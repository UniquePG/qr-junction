'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/components/AuthContext';
import Link from 'next/link';
import { 
  Layout, 
  Plus, 
  Search, 
  Copy, 
  Check, 
  Trash2, 
  Edit, 
  ExternalLink, 
  Loader2,
  Sparkles,
  QrCode
} from 'lucide-react';
import { toast } from 'react-toastify';

interface LandingPageData {
  id: number;
  slug: string;
  title: string;
  theme: string;
  profileName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  qrCodesCount: number;
  createdAt: string;
}

import ConfirmModal from '@/components/ConfirmModal';
import LandingPageQRModal from '@/components/LandingPageQRModal';

export default function LandingPagesDirectory() {
  const { user } = useAuth();
  const [pages, setPages] = useState<LandingPageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Landing Page QR Modal state
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedPageForQR, setSelectedPageForQR] = useState<LandingPageData | null>(null);

  // Custom Confirm Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingPageId, setDeletingPageId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPages = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const res = await fetch('/api/landing-pages', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to retrieve landing pages list.');
      const data = await res.json();
      setPages(data.landingPages || []);
    } catch (error) {
      console.error(error);
      toast.error('Could not load landing pages list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, [user]);

  const handleCopyLink = (page: LandingPageData) => {
    const fullUrl = `${window.location.origin}/p/${page.slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(page.id);
    toast.success('Public page link copied to clipboard!');
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleOpenQRModal = (page: LandingPageData) => {
    setSelectedPageForQR(page);
    setQrModalOpen(true);
  };

  const triggerDeleteConfirm = (id: number) => {
    setDeletingPageId(id);
    setDeleteModalOpen(true);
  };

  const handleDeletePage = async () => {
    if (!deletingPageId) return;

    setDeleting(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const res = await fetch(`/api/landing-pages/${deletingPageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete landing page.');

      toast.success('Landing page removed.');
      setPages(prev => prev.filter(page => page.id !== deletingPageId));
      setDeleteModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to remove landing page.');
    } finally {
      setDeleting(false);
      setDeletingPageId(null);
    }
  };

  const filteredPages = pages.filter(page => {
    return page.title.toLowerCase().includes(search.toLowerCase()) ||
           page.slug.toLowerCase().includes(search.toLowerCase()) ||
           (page.profileName && page.profileName.toLowerCase().includes(search.toLowerCase()));
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-slate-400 text-sm">Loading your custom landing pages...</p>
      </div>
    );
  }

  const getThemeLabel = (theme: string) => {
    switch (theme) {
      case 'dark': return 'Slate Charcoal';
      case 'light': return 'Minimal Light';
      case 'sunset': return 'Sunset Glow';
      case 'ocean': return 'Ocean Mist';
      case 'glassmorphism': return 'Frosted Glass';
      default: return theme;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Search bar row */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search pages by title or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-2 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all"
          />
        </div>

        <Link
          href="/dashboard/pages/new"
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white py-2 px-5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-primary border-none"
        >
          <Plus className="w-4 h-4" />
          <span>New Landing Page</span>
        </Link>
      </div>

      {/* Pages list grid */}
      {filteredPages.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 border border-slate-200 rounded-2xl p-8 space-y-4">
          <Layout className="w-12 h-12 text-slate-400 mx-auto" />
          <p className="text-slate-500 text-sm">No landing pages built yet. Create one to link with your QRs.</p>
          <Link
            href="/dashboard/pages/new"
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white py-2 px-5 rounded-xl text-sm font-semibold transition-all duration-200 border-none"
          >
            Launch Builder
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPages.map((page) => (
            <div 
              key={page.id}
              className="bg-white border border-slate-200/80 hover:border-slate-300 p-5 rounded-2xl shadow-xs transition-all flex flex-col justify-between h-full relative overflow-hidden group"
            >
              {/* Top Row Title / Avatar */}
              <div>
                <div className="flex gap-3 items-center">
                  {page.avatarUrl ? (
                    <img 
                      src={page.avatarUrl} 
                      alt="Avatar" 
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                      {page.title.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-[#001B50] truncate max-w-[150px]" title={page.title}>{page.title}</h4>
                    <span className="text-[10px] text-slate-500 font-mono">/p/{page.slug}</span>
                  </div>
                </div>

                <div className="mt-3.5 flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">Theme:</span>
                  <span className="px-2 py-0.5 rounded bg-slate-55 text-slate-600 border border-slate-200 text-[10px]">
                    {getThemeLabel(page.theme)}
                  </span>
                </div>
              </div>

              {/* Middle count linked QRs */}
              <div className="flex gap-4 border-t border-b border-slate-100 py-3 my-2 text-center text-xs">
                <div className="flex-1 bg-slate-50 py-1 rounded border border-slate-200/50 flex items-center justify-center gap-1.5 text-slate-500">
                  <QrCode className="w-3.5 h-3.5 text-primary" />
                  <span>{page.qrCodesCount} Linked QR{page.qrCodesCount !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-3 mt-1">
                <span className="text-slate-400 font-medium">
                  {new Date(page.createdAt).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopyLink(page)}
                    className="p-1.5 text-slate-500 hover:text-[#001B50] transition-colors bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100"
                    title="Copy Public Link"
                  >
                    {copiedId === page.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleOpenQRModal(page)}
                    className="p-1.5 text-slate-500 hover:text-primary transition-colors bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100"
                    title="Get QR Code"
                  >
                    <QrCode className="w-3.5 h-3.5 text-primary" />
                  </button>
                  <a
                    href={`/p/${page.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-slate-500 hover:text-[#001B50] transition-colors bg-slate-50 border border-slate-200 rounded-lg flex items-center hover:bg-slate-100"
                    title="Open Live"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <Link
                    href={`/dashboard/pages/edit/${page.id}`}
                    className="p-1.5 text-slate-500 hover:text-[#001B50] transition-colors bg-slate-50 border border-slate-200 rounded-lg flex items-center hover:bg-slate-100"
                    title="Open Page Builder"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => triggerDeleteConfirm(page.id)}
                    className="p-1.5 text-slate-500 hover:text-red-655 transition-colors bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100"
                    title="Delete Page"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Landing Page?"
        message="Are you sure you want to delete this landing page? Connected QR codes will not be deleted, but they will revert to their fallback redirection URLs."
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
        isLoading={deleting}
        onConfirm={handleDeletePage}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingPageId(null);
        }}
      />

      {selectedPageForQR && (
        <LandingPageQRModal
          isOpen={qrModalOpen}
          onClose={() => {
            setQrModalOpen(false);
            setSelectedPageForQR(null);
            fetchPages();
          }}
          page={selectedPageForQR}
        />
      )}
    </div>
  );
}
