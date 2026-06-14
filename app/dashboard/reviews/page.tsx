'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/components/AuthContext';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Star, 
  Loader2, 
  Plus, 
  QrCode, 
  Trash2, 
  Edit, 
  ExternalLink, 
  Eye, 
  Play, 
  Pause, 
  Download, 
  FileText, 
  Check, 
  Copy,
  BarChart3,
  MessageSquareWarning,
  StarOff
} from 'lucide-react';
import { toast } from 'react-toastify';
import ConfirmModal from '@/components/ConfirmModal';
import { getQrUrl } from '@/utils/qrUrl';

interface ReviewCampaign {
  id: string;
  shortCode: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'DELETED';
  destination: {
    businessName: string;
    logoUrl?: string;
    publicReviewUrl: string;
    positiveThreshold: number;
    welcomeMessage?: string;
    privateFeedbackMessage?: string;
    thankYouMessage?: string;
  };
  fgColor: string;
  bgColor: string;
  totalScans: number;
  uniqueScans: number;
  createdAt: string;
  totalRatings: number;
  averageRating: number;
}

interface FeedbackResponse {
  id: number;
  qrCodeId: string;
  qrName: string;
  businessName: string;
  rating: number;
  feedback: string;
  name: string;
  phone: string;
  createdAt: string;
}

export default function ReviewSuiteDirectory() {
  const { user } = useAuth();
  const [qrs, setQrs] = useState<ReviewCampaign[]>([]);
  const [reviews, setReviews] = useState<FeedbackResponse[]>([]);
  const [stats, setStats] = useState({ averageRating: 0, totalRatings: 0, negativeFeedbackCount: 0 });
  const [loading, setLoading] = useState(true);

  // Copied clipboard state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // QR Viewer Modal state
  const [selectedQR, setSelectedQR] = useState<ReviewCampaign | null>(null);

  // Confirm delete campaign state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingQrId, setDeletingQrId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSuiteData = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const res = await fetch('/api/reviews/summary', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to retrieve review suite data.');
      const data = await res.json();
      setQrs(data.qrCodes || []);
      setReviews(data.reviews || []);
      setStats(data.stats || { averageRating: 0, totalRatings: 0, negativeFeedbackCount: 0 });
    } catch (error) {
      console.error(error);
      toast.error('Could not load Review QR Suite data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuiteData();
  }, [user]);

  const handleCopyLink = (id: string, shortCode: string) => {
    const fullUrl = getQrUrl(shortCode);
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    toast.success('Campaign review link copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleStatus = async (qr: ReviewCampaign) => {
    const newStatus = qr.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const res = await fetch(`/api/qrs/${qr.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to toggle status.');
      setQrs(prev => prev.map(item => item.id === qr.id ? { ...item, status: newStatus } : item));
      toast.success(`Campaign ${newStatus === 'ACTIVE' ? 'activated' : 'paused'}`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to change campaign status.');
    }
  };

  const triggerDeleteConfirm = (id: string) => {
    setDeletingQrId(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteCampaign = async () => {
    if (!deletingQrId) return;

    setDeleting(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const res = await fetch(`/api/qrs/${deletingQrId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete review campaign.');
      setQrs(prev => prev.filter(item => item.id !== deletingQrId));
      toast.success('Review campaign deleted.');
      setDeleteModalOpen(false);
      // Refresh page to update stats
      fetchSuiteData();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete review campaign.');
    } finally {
      setDeleting(false);
      setDeletingQrId(null);
    }
  };

  const downloadQR = (shortCode: string, fgColor: string, bgColor: string) => {
    const svg = document.getElementById(`qr-svg-review-${shortCode}`);
    if (!svg) return;
    const svgXml = new XMLSerializer().serializeToString(svg);
    const svgBase64 = btoa(unescape(encodeURIComponent(svgXml)));
    
    const img = new Image();
    img.src = `data:image/svg+xml;base64,${svgBase64}`;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1000;
      canvas.height = 1000;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, 1000, 1000);
        ctx.drawImage(img, 0, 0, 1000, 1000);
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `review-qr-${shortCode}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-slate-400 text-sm">Opening Review Suite...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Banner and Quick Creator Link */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#001B50]">Review QR Suite ⭐️</h2>
          <p className="text-slate-500 text-xs mt-1">Isolate negative ratings as private feedback and redirect positive scores to Google/Yelp reviews.</p>
        </div>
        <Link
          href="/dashboard/reviews/new"
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white py-2.5 px-5 rounded-xl text-xs font-bold transition-all shadow-primary border-none whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>New Review QR</span>
        </Link>
      </div>

      {/* consolidated statistics summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Rating Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
            <Star className="w-6 h-6 fill-current" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Suite Average Rating</p>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-0.5">
              {stats.averageRating > 0 ? stats.averageRating : '0.0'} <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
            </h3>
          </div>
        </div>

        {/* Responses Count */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Responses</p>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-0.5">{stats.totalRatings}</h3>
          </div>
        </div>

        {/* Private Negative Feedback */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
            <MessageSquareWarning className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Negative Feedbacks (≤3 Stars)</p>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-0.5">{stats.negativeFeedbackCount}</h3>
          </div>
        </div>
      </div>

      {/* Review QRs Directory */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-[#001B50] uppercase tracking-wider">Review Campaigns</h3>
        {qrs.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 border border-slate-200 rounded-2xl p-8 space-y-4">
            <StarOff className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-slate-500 text-sm">No active review QR campaigns. Get started to capture customer scores.</p>
            <Link
              href="/dashboard/reviews/new"
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white py-2 px-4 rounded-xl text-xs font-bold transition-all border-none"
            >
              Configure Review QR
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {qrs.map((qr) => (
              <div 
                key={qr.id}
                className={`bg-white border p-5 rounded-2xl shadow-xs transition-all flex flex-col justify-between h-full relative group ${
                  qr.status === 'PAUSED' ? 'border-amber-200 bg-amber-50/5 opacity-75' : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                {/* QR Code hidden element */}
                <div className="hidden">
                  <QRCodeSVG
                    id={`qr-svg-review-${qr.shortCode}`}
                    value={getQrUrl(qr.shortCode)}
                    size={500}
                    fgColor={qr.fgColor}
                    bgColor={qr.bgColor}
                    level="H"
                  />
                </div>

                {/* Top content */}
                <div>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 min-w-0">
                      <h4 className="font-bold text-[#001B50] truncate max-w-[150px]" title={qr.destination.businessName}>
                        {qr.destination.businessName}
                      </h4>
                      <span className="inline-block text-[8px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                        Review Campaign
                      </span>
                    </div>
                    
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setSelectedQR(qr)}
                        className="p-1.5 bg-slate-50 border border-slate-200 text-slate-500 hover:text-[#001B50] rounded-lg hover:bg-slate-100 transition-colors"
                        title="Quick Preview QR"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(qr)}
                        className={`p-1.5 border rounded-lg transition-colors ${
                          qr.status === 'ACTIVE'
                            ? 'bg-amber-50 border-amber-250 text-amber-600 hover:bg-amber-100'
                            : 'bg-emerald-50 border-emerald-250 text-emerald-650 hover:bg-emerald-100'
                        }`}
                        title={qr.status === 'ACTIVE' ? 'Pause QR' : 'Activate QR'}
                      >
                        {qr.status === 'ACTIVE' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* QR Link copy wrapper */}
                  <div className="mt-3 flex items-center justify-between bg-slate-50 py-1.5 px-3 rounded-lg border border-slate-200">
                    <span className="font-mono text-[10px] text-slate-655 truncate max-w-[160px]">
                      /q/{qr.shortCode}
                    </span>
                    <button
                      onClick={() => handleCopyLink(qr.id, qr.shortCode)}
                      className="text-slate-400 hover:text-primary transition-colors bg-transparent border-none cursor-pointer p-0"
                    >
                      {copiedId === qr.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Stars and counts middle summary */}
                <div className="flex gap-4 border-t border-b border-slate-100 py-3 my-3">
                  <div className="flex-1 text-center bg-slate-55 py-1.5 rounded border border-slate-200/50">
                    <span className="text-[8px] text-slate-400 uppercase font-bold tracking-wider block">Avg Rating</span>
                    <span className="text-xs font-extrabold text-slate-800 flex items-center justify-center gap-1 mt-0.5">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      {qr.averageRating > 0 ? qr.averageRating : '0.0'}
                    </span>
                  </div>
                  
                  <div className="flex-1 text-center bg-slate-55 py-1.5 rounded border border-slate-200/50">
                    <span className="text-[8px] text-slate-400 uppercase font-bold tracking-wider block">Ratings</span>
                    <span className="text-xs font-extrabold text-slate-800 mt-0.5 block">{qr.totalRatings}</span>
                  </div>

                  <div className="flex-1 text-center bg-slate-55 py-1.5 rounded border border-slate-200/50">
                    <span className="text-[8px] text-slate-400 uppercase font-bold tracking-wider block">Scans</span>
                    <span className="text-xs font-extrabold text-slate-800 mt-0.5 block">{qr.totalScans}</span>
                  </div>
                </div>

                {/* Bottom Row Actions */}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">
                    {new Date(qr.createdAt).toLocaleDateString()}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/dashboard/qrs/${qr.id}/reviews`}
                      className="p-1.5 text-slate-500 hover:text-primary transition-colors flex items-center gap-1"
                      title="View Responses"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Reviews</span>
                    </Link>
                    <Link
                      href={`/dashboard/reviews/edit/${qr.id}`}
                      className="p-1.5 text-slate-500 hover:text-[#001B50] transition-colors flex items-center gap-1"
                      title="Edit Campaign Settings"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </Link>
                    <button
                      onClick={() => triggerDeleteConfirm(qr.id)}
                      className="p-1.5 text-slate-500 hover:text-red-650 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Delete Campaign"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Consolidated feedback reviews inbox */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-2">
          <FileText className="w-4.5 h-4.5 text-[#001B50]" />
          <h3 className="font-bold text-[#001B50] text-sm uppercase tracking-wider">Consolidated Feedback Inbox</h3>
        </div>

        <div className="overflow-x-auto">
          {reviews.length === 0 ? (
            <div className="p-8 text-center text-slate-450 text-xs">
              No customer review responses received yet.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="p-4">Date</th>
                  <th className="p-4">Business</th>
                  <th className="p-4">Score</th>
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Feedback Comments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                {reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-4 text-slate-500 whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-semibold text-slate-800">
                      {r.businessName}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} 
                          />
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{r.name || 'Anonymous'}</div>
                      {r.phone && <div className="text-[10px] text-slate-500 mt-0.5">{r.phone}</div>}
                    </td>
                    <td className="p-4 text-slate-600 max-w-sm">
                      <p className="line-clamp-2" title={r.feedback}>{r.feedback || '-'}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* QR Viewer Modal overlay */}
      {selectedQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 space-y-6 animate-scale-in relative shadow-xl">
            <div className="flex justify-between items-center">
              <h3 className="text-md font-bold text-[#001B50] truncate max-w-[250px]">
                {selectedQR.destination.businessName}
              </h3>
              <button
                onClick={() => setSelectedQR(null)}
                className="text-slate-500 hover:text-slate-750 text-xs bg-slate-50 p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* QR Card Container */}
            <div className="bg-white p-6 rounded-xl flex items-center justify-center border border-slate-200 shadow-inner max-w-[240px] mx-auto">
              <QRCodeSVG
                value={getQrUrl(selectedQR.shortCode)}
                size={180}
                fgColor={selectedQR.fgColor}
                bgColor={selectedQR.bgColor}
                level="H"
              />
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Shortcode:</span>
                  <span className="font-mono text-slate-800">/q/{selectedQR.shortCode}</span>
                </div>
                <div className="flex justify-between">
                  <span>Threshold:</span>
                  <span className="font-semibold text-slate-850">
                    &ge; {selectedQR.destination.positiveThreshold} Stars Direct Redirection
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={`font-bold ${selectedQR.status === 'ACTIVE' ? 'text-emerald-650' : 'text-amber-650'}`}>
                    {selectedQR.status}
                  </span>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => downloadQR(selectedQR.shortCode, selectedQR.fgColor, selectedQR.bgColor)}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white py-2.5 rounded-xl text-xs font-semibold cursor-pointer active:scale-95 transition-all border-none"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PNG</span>
                </button>
                <a
                  href={getQrUrl(selectedQR.shortCode)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-755 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 transition-all text-center"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Test Link</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Review QR Campaign?"
        message="Are you sure you want to delete this review QR campaign? Permanent redirect and analytics tracking will be stopped."
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
        isLoading={deleting}
        onConfirm={handleDeleteCampaign}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingQrId(null);
        }}
      />
    </div>
  );
}
