'use client';

import React, { useState, useEffect } from 'react';
import { qrService, reviewService } from '@/lib/api';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/components/AuthContext';
import Link from 'next/link';
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
  StarOff,
  Palette,
  Search,
  Filter,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Mail,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar,
  Legend
} from 'recharts';
import { toast } from 'react-toastify';
import ConfirmModal from '@/components/ConfirmModal';
import { getQrUrl } from '@/utils/qrUrl';
import CustomizableQRCode from '@/components/CustomizableQRCode';
import QRDesignModal from '@/components/QRDesignModal';

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
    reviewCategory?: string;
    language?: string;
  };
  fgColor: string;
  bgColor: string;
  logoUrl?: string | null;
  customDesign?: any | null;
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
  selectedTags?: string;
  sentiment?: string;
  category?: string;
  urgency?: string;
  aiReply?: string;
  aiAnalysis?: any;
  createdAt: string;
}

export default function ReviewSuiteDirectory() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'campaigns' | 'inbox' | 'insights'>('campaigns');
  
  // Data State
  const [qrs, setQrs] = useState<ReviewCampaign[]>([]);
  const [reviews, setReviews] = useState<FeedbackResponse[]>([]);
  const [stats, setStats] = useState({ averageRating: 0, totalRatings: 0, negativeFeedbackCount: 0 });
  const [loading, setLoading] = useState(true);

  // Global Campaign Filter
  const [selectedQrFilter, setSelectedQrFilter] = useState<string>('all');

  // Copy States
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedReplyId, setCopiedReplyId] = useState<number | null>(null);

  // QR Viewer Modal
  const [selectedQR, setSelectedQR] = useState<ReviewCampaign | null>(null);
  const [selectedDesignQr, setSelectedDesignQr] = useState<any | null>(null);

  // Confirm Delete
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingQrId, setDeletingQrId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Inbox Search/Filter
  const [inboxSearch, setInboxSearch] = useState('');
  const [inboxRatingFilter, setInboxRatingFilter] = useState<string>('all');
  const [selectedInboxReview, setSelectedInboxReview] = useState<FeedbackResponse | null>(null);

  // AI Reply Editing
  const [editingReplyText, setEditingReplyText] = useState('');
  const [savingReply, setSavingReply] = useState(false);

  // AI Weekly Insights State
  const [aiInsights, setAiInsights] = useState<{
    summary: string;
    strengths: string[];
    complaints: string[];
    recommendations: string[];
  } | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  // Recovery Workflow
  const [recoveryModalOpen, setRecoveryModalOpen] = useState(false);
  const [recoveryReview, setRecoveryReview] = useState<FeedbackResponse | null>(null);
  const [copiedRecovery, setCopiedRecovery] = useState(false);

  const fetchSuiteData = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const res = await reviewService.summary();

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

  const fetchWeeklyInsights = async (qrId: string) => {
    setInsightsLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const res = await reviewService.weeklyInsights(qrId);

      if (res.ok) {
        const data = await res.json();
        setAiInsights(data);
      }
    } catch (error) {
      console.error('Insights fetch error:', error);
    } finally {
      setInsightsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuiteData();
  }, [user]);

  // Refetch insights whenever the global filter or tab changes
  useEffect(() => {
    if (activeTab === 'insights') {
      fetchWeeklyInsights(selectedQrFilter);
    }
  }, [selectedQrFilter, activeTab]);

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

      const res = await qrService.update(qr.id, { status: newStatus });

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

      const res = await qrService.remove(deletingQrId);

      if (!res.ok) throw new Error('Failed to delete review campaign.');
      setQrs(prev => prev.filter(item => item.id !== deletingQrId));
      toast.success('Review campaign deleted.');
      setDeleteModalOpen(false);
      fetchSuiteData();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete review campaign.');
    } finally {
      setDeleting(false);
      setDeletingQrId(null);
    }
  };

  const handleSaveAIResponse = async () => {
    if (!selectedInboxReview) return;
    setSavingReply(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const res = await reviewService.save({
        id: selectedInboxReview.id,
        aiReply: editingReplyText,
      });

      if (res.ok) {
        toast.success('AI reply suggestion updated.');
        setReviews(prev => prev.map(r => r.id === selectedInboxReview.id ? { ...r, aiReply: editingReplyText } : r));
        setSelectedInboxReview(prev => prev ? { ...prev, aiReply: editingReplyText } : null);
      }
    } catch (error) {
      toast.error('Failed to update reply.');
    } finally {
      setSavingReply(false);
    }
  };

  const downloadQR = (qr: any, filename: string) => {
    const svg = document.getElementById(`qr-svg-review-${qr.shortCode}`);
    if (!svg) return;
    const design = qr.customDesign || {};
    const hasFrame = design.frameId && design.frameId !== 'no_frame';

    try {
      const svgXml = new XMLSerializer().serializeToString(svg);
      const svgBase64 = btoa(unescape(encodeURIComponent(svgXml)));
      
      const img = new Image();
      img.src = `data:image/svg+xml;base64,${svgBase64}`;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        if (hasFrame) {
          canvas.width = 1050; 
          canvas.height = 1260;
        } else {
          canvas.width = 1000;
          canvas.height = 1000;
        }
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = qr.bgColor || '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const pngUrl = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.href = pngUrl;
          downloadLink.download = `${filename}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          toast.success('QR Code downloaded!');
        }
      };
    } catch (err) {
      console.error(err);
      toast.error('Failed to download QR code');
    }
  };

  // Filter logic across tabs
  const filteredQrsList = selectedQrFilter === 'all' 
    ? qrs 
    : qrs.filter(q => q.id.toString() === selectedQrFilter);

  const filteredReviews = reviews.filter(r => {
    // 1. QR Code filter
    const matchesQr = selectedQrFilter === 'all' || r.qrCodeId.toString() === selectedQrFilter;
    
    // 2. Rating filter
    let matchesRating = true;
    if (inboxRatingFilter === 'positive') {
      matchesRating = r.rating >= 4;
    } else if (inboxRatingFilter === 'negative') {
      matchesRating = r.rating <= 3;
    }

    // 3. Search text
    const text = inboxSearch.toLowerCase();
    const matchesSearch = !text || 
      (r.name && r.name.toLowerCase().includes(text)) || 
      (r.feedback && r.feedback.toLowerCase().includes(text)) || 
      (r.phone && r.phone.includes(text)) || 
      (r.businessName && r.businessName.toLowerCase().includes(text));

    return matchesQr && matchesRating && matchesSearch;
  });

  // Urgency detection warning alert count
  const urgentCount = reviews.filter(r => r.urgency === 'High' && (selectedQrFilter === 'all' || r.qrCodeId.toString() === selectedQrFilter)).length;

  // Chart data calculations
  // 1. Review trends: Count reviews by date
  const reviewTrendsMap: Record<string, number> = {};
  filteredReviews.forEach(r => {
    const dStr = new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    reviewTrendsMap[dStr] = (reviewTrendsMap[dStr] || 0) + 1;
  });
  const trendsChartData = Object.entries(reviewTrendsMap).map(([date, count]) => ({ date, reviews: count })).reverse();

  // 2. Sentiment distribution
  const sentiments = { Positive: 0, Neutral: 0, Negative: 0 };
  filteredReviews.forEach(r => {
    const sent = r.sentiment || (r.rating >= 4 ? 'Positive' : r.rating === 3 ? 'Neutral' : 'Negative');
    if (sent === 'Positive') sentiments.Positive++;
    else if (sent === 'Neutral') sentiments.Neutral++;
    else sentiments.Negative++;
  });
  const sentimentChartData = [
    { name: 'Positive', value: sentiments.Positive, color: '#10b981' },
    { name: 'Neutral', value: sentiments.Neutral, color: '#f59e0b' },
    { name: 'Negative', value: sentiments.Negative, color: '#ef4444' }
  ].filter(s => s.value > 0);

  // 3. Top Strengths & Complaints tag counters
  const strengthsMap: Record<string, number> = {};
  const complaintsMap: Record<string, number> = {};
  filteredReviews.forEach(r => {
    if (r.selectedTags) {
      const tags = r.selectedTags.split(',').map(t => t.trim());
      tags.forEach(tag => {
        if (!tag) return;
        if (r.rating >= 4) {
          strengthsMap[tag] = (strengthsMap[tag] || 0) + 1;
        } else {
          complaintsMap[tag] = (complaintsMap[tag] || 0) + 1;
        }
      });
    }
  });

  const strengthsChartData = Object.entries(strengthsMap)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const complaintsChartData = Object.entries(complaintsMap)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Launch Recovery Email template builder
  const startRecovery = (review: FeedbackResponse) => {
    setRecoveryReview(review);
    setCopiedRecovery(false);
    setRecoveryModalOpen(true);
  };

  const getRecoveryEmailContent = (review: FeedbackResponse) => {
    const name = review.name || 'valued customer';
    const business = review.businessName;
    const issue = review.selectedTags || 'your recent experience';
    return `Subject: Sincere apologies from ${business}

Dear ${name},

Thank you for sharing your feedback with us regarding your recent visit. We are deeply sorry to hear that you experienced issues with "${issue}".

At ${business}, we strive to provide the best possible experience for our clients, and it's clear we fell short in your case. We are currently looking into this issue with our team to make sure it doesn't happen again.

We would love the opportunity to make things right for you. Please let us know if we can contact you directly at your convenience, or call us back at your earliest availability.

Warm regards,
Management team
${business}`;
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#001B50]">Smart Review QR Suite ⭐️</h2>
          <p className="text-slate-500 text-xs mt-1">Collect feedback, suggest reviews using AI, isolate negative ratings, and generate business improvement insights.</p>
        </div>
        
        {/* Persistent QR Selector & Add QR */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-700 min-w-[200px] flex-grow md:flex-grow-0">
            <Filter className="w-3.5 h-3.5 text-slate-450" />
            <select
              value={selectedQrFilter}
              onChange={(e) => setSelectedQrFilter(e.target.value)}
              className="bg-transparent border-none outline-none w-full cursor-pointer font-medium text-slate-700"
            >
              <option value="all">All Review QR Codes</option>
              {qrs.map(q => (
                <option key={q.id} value={q.id}>{q.name}</option>
              ))}
            </select>
          </div>

          <Link
            href="/dashboard/reviews/new"
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-primary border-none whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>New Review QR</span>
          </Link>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="border-b border-slate-200 flex gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`pb-3 px-1 transition-all relative border-none cursor-pointer bg-transparent ${
            activeTab === 'campaigns' ? 'text-primary border-b-2 border-primary font-bold' : 'text-slate-500 hover:text-[#001B50]'
          }`}
        >
          QR Campaigns & Setup
        </button>
        <button
          onClick={() => setActiveTab('inbox')}
          className={`pb-3 px-1 transition-all relative border-none cursor-pointer bg-transparent flex items-center gap-2 ${
            activeTab === 'inbox' ? 'text-primary border-b-2 border-primary font-bold' : 'text-slate-500 hover:text-[#001B50]'
          }`}
        >
          <span>Feedback Inbox</span>
          {filteredReviews.length > 0 && (
            <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
              {filteredReviews.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`pb-3 px-1 transition-all relative border-none cursor-pointer bg-transparent flex items-center gap-2 ${
            activeTab === 'insights' ? 'text-primary border-b-2 border-primary font-bold' : 'text-slate-500 hover:text-[#001B50]'
          }`}
        >
          <span>Weekly AI Insights</span>
          <span className="bg-amber-500/10 text-amber-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
            <Sparkles className="w-2.5 h-2.5 fill-current" /> AI
          </span>
        </button>
      </div>

      {/* Urgency warning alert banner */}
      {urgentCount > 0 && activeTab !== 'campaigns' && (
        <div className="bg-red-50 border border-red-200 text-red-750 p-4 rounded-xl flex items-start gap-3 animate-pulse">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold">⚠️ Urgent Attention Required!</h4>
            <p className="mt-0.5">There are <strong>{urgentCount} unresolved High Urgency</strong> negative complaints. Use the Recovery Workflow tool in the Inbox tab to contact these customers immediately and protect your reputation.</p>
          </div>
        </div>
      )}

      {/* TAB 1: Campaigns Directory */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          {filteredQrsList.length === 0 ? (
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
              {filteredQrsList.map((qr) => (
                <div 
                  key={qr.id}
                  className={`bg-white border p-5 rounded-2xl shadow-xs transition-all flex flex-col justify-between h-full relative group ${
                    qr.status === 'PAUSED' ? 'border-amber-200 bg-amber-50/5 opacity-75' : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  {/* QR SVG Element for download */}
                  <div className="hidden">
                    <CustomizableQRCode
                      id={`qr-svg-review-${qr.shortCode}`}
                      value={getQrUrl(qr.shortCode)}
                      fgColor={qr.fgColor || '#000000'}
                      bgColor={qr.bgColor || '#FFFFFF'}
                      logoUrl={qr.logoUrl}
                      logoPreset={qr.customDesign?.logoPreset || 'none'}
                      frameId={qr.customDesign?.frameId || 'no_frame'}
                      frameText={qr.customDesign?.frameText || ''}
                      frameColor={qr.customDesign?.frameColor || '#001b50'}
                      frameTextColor={qr.customDesign?.frameTextColor || '#ffffff'}
                      size={500}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1 min-w-0">
                        <h4 className="font-bold text-[#001B50] truncate max-w-[150px]" title={qr.destination.businessName}>
                          {qr.destination.businessName}
                        </h4>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="inline-block text-[8px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                            {qr.destination.reviewCategory || 'Review'}
                          </span>
                          <span className="inline-block text-[8px] font-bold text-slate-400 uppercase tracking-widest bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded">
                            {qr.destination.language || 'English'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setSelectedQR(qr)}
                          className="p-1.5 bg-slate-50 border border-slate-200 text-slate-500 hover:text-[#001B50] rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Quick Preview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSelectedDesignQr(qr)}
                          className="p-1.5 bg-slate-50 border border-slate-200 text-slate-500 hover:text-[#001B50] rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                          title="QR Design"
                        >
                          <Palette className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(qr)}
                          className={`p-1.5 border rounded-lg transition-colors cursor-pointer ${
                            qr.status === 'ACTIVE'
                              ? 'bg-amber-50 border-amber-250 text-amber-600 hover:bg-amber-100'
                              : 'bg-emerald-50 border-emerald-250 text-emerald-650 hover:bg-emerald-100'
                          }`}
                          title={qr.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                        >
                          {qr.status === 'ACTIVE' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between bg-slate-50 py-1.5 px-3 rounded-lg border border-slate-200">
                      <span className="font-mono text-[10px] text-slate-650 truncate max-w-[160px]">
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

                  <div className="flex gap-4 border-t border-b border-slate-100 py-3 my-3">
                    <div className="flex-1 text-center bg-slate-50 py-1.5 rounded border border-slate-200/50">
                      <span className="text-[8px] text-slate-400 uppercase font-bold tracking-wider block">Avg Rating</span>
                      <span className="text-xs font-extrabold text-slate-800 flex items-center justify-center gap-1 mt-0.5">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        {qr.averageRating > 0 ? qr.averageRating : '0.0'}
                      </span>
                    </div>
                    
                    <div className="flex-1 text-center bg-slate-50 py-1.5 rounded border border-slate-200/50">
                      <span className="text-[8px] text-slate-400 uppercase font-bold tracking-wider block">Ratings</span>
                      <span className="text-xs font-extrabold text-slate-800 mt-0.5 block">{qr.totalRatings}</span>
                    </div>

                    <div className="flex-1 text-center bg-slate-50 py-1.5 rounded border border-slate-200/50">
                      <span className="text-[8px] text-slate-400 uppercase font-bold tracking-wider block">Scans</span>
                      <span className="text-xs font-extrabold text-slate-800 mt-0.5 block">{qr.totalScans}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">
                      {new Date(qr.createdAt).toLocaleDateString()}
                    </span>
                    
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/dashboard/reviews/edit/${qr.id}`}
                        className="p-1.5 text-slate-500 hover:text-[#001B50] transition-colors flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Link>
                      <button
                        onClick={() => triggerDeleteConfirm(qr.id)}
                        className="p-1.5 text-slate-500 hover:text-red-650 transition-colors flex items-center gap-1 cursor-pointer bg-transparent border-none"
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
      )}

      {/* TAB 2: Feedback Inbox */}
      {activeTab === 'inbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Inbox Feed & Filters */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Filters panel */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search name, phone, comment..."
                  value={inboxSearch}
                  onChange={(e) => setInboxSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-primary rounded-lg py-2 pl-9 pr-4 text-xs text-slate-800 outline-none outline-offset-0 transition-all"
                />
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setInboxRatingFilter('all')}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                    inboxRatingFilter === 'all' 
                      ? 'bg-primary text-white border-primary' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setInboxRatingFilter('positive')}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                    inboxRatingFilter === 'positive' 
                      ? 'bg-emerald-500 text-white border-emerald-500' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Positive (4-5★)
                </button>
                <button
                  onClick={() => setInboxRatingFilter('negative')}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                    inboxRatingFilter === 'negative' 
                      ? 'bg-red-500 text-white border-red-500' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Negative (1-3★)
                </button>
              </div>
            </div>

            {/* Reviews List */}
            {filteredReviews.length === 0 ? (
              <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl p-8 text-slate-400 text-xs">
                No reviews match your selected filter criteria.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReviews.map((rev) => {
                  const isSelected = selectedInboxReview?.id === rev.id;
                  const isNegative = rev.rating <= 3;
                  const isUrgent = rev.urgency === 'High';

                  return (
                    <div
                      key={rev.id}
                      onClick={() => {
                        setSelectedInboxReview(rev);
                        setEditingReplyText(rev.aiReply || '');
                      }}
                      className={`bg-white border p-5 rounded-2xl shadow-xs transition-all cursor-pointer relative ${
                        isSelected 
                          ? 'border-primary ring-1 ring-primary/30' 
                          : 'border-slate-200 hover:border-slate-350'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800 text-sm">{rev.name || 'Anonymous Customer'}</span>
                            {rev.phone && <span className="text-[10px] text-slate-450 font-mono">({rev.phone})</span>}
                          </div>
                          
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <div className="flex gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${
                                    i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                                  }`}
                                />
                              ))}
                            </div>
                            
                            {rev.sentiment && (
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                rev.sentiment === 'Positive' 
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                  : rev.sentiment === 'Neutral'
                                    ? 'bg-amber-50 text-amber-600 border border-amber-100'
                                    : 'bg-red-50 text-red-650 border border-red-100'
                              }`}>
                                {rev.sentiment}
                              </span>
                            )}

                            {isUrgent && (
                              <span className="bg-red-100 text-red-700 text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-0.5 border border-red-200 animate-pulse">
                                <AlertTriangle className="w-2.5 h-2.5" /> Severe Complaint
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="text-[10px] text-slate-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                      </div>

                      {rev.selectedTags && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {rev.selectedTags.split(',').map((t, idx) => (
                            <span key={idx} className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[9px] font-medium text-slate-600">
                              {t.trim()}
                            </span>
                          ))}
                        </div>
                      )}

                      {rev.feedback ? (
                        <p className="text-xs text-slate-650 mt-3 line-clamp-3 leading-relaxed font-sans">{rev.feedback}</p>
                      ) : (
                        <p className="text-xs text-slate-400 italic mt-3">Rating submitted with no comments.</p>
                      )}

                      {/* Display Reply indicator if already exists */}
                      {rev.aiReply && (
                        <div className="mt-3.5 border-t border-slate-100 pt-3 flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Owner reply generated</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Inbox Detail View & AI Reply Generation */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm sticky top-24">
            {selectedInboxReview ? (
              <div className="space-y-6 animate-fade-in">
                
                {/* Header detail */}
                <div className="border-b border-slate-100 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-[#001B50] text-sm uppercase tracking-wider">Review Details</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Submitted via {selectedInboxReview.qrName}</p>
                    </div>
                    {selectedInboxReview.rating <= 3 && (
                      <button
                        onClick={() => startRecovery(selectedInboxReview)}
                        className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-650 border border-red-200 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                        title="Contact Customer / Start Recovery"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Start Recovery</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Rating & User block */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Customer name:</span>
                    <span className="font-semibold text-slate-800">{selectedInboxReview.name || 'Anonymous'}</span>
                  </div>
                  {selectedInboxReview.phone && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Phone number:</span>
                      <span className="font-mono text-slate-800">{selectedInboxReview.phone}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Score rating:</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      {selectedInboxReview.rating} / 5 <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 inline" />
                    </span>
                  </div>
                  {selectedInboxReview.category && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Primary category:</span>
                      <span className="bg-slate-200 px-2 py-0.5 rounded text-[10px] font-semibold text-slate-700">{selectedInboxReview.category}</span>
                    </div>
                  )}
                </div>

                {/* Feedback Comment */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer Comment</span>
                  <div className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-sans min-h-[60px]">
                    {selectedInboxReview.feedback || <span className="text-slate-400 italic">No text review submitted.</span>}
                  </div>
                </div>

                {/* AI generated reply & editor */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 fill-primary/10" /> AI Business Reply Response
                    </span>
                    {selectedInboxReview.aiReply && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(editingReplyText);
                          setCopiedReplyId(selectedInboxReview.id);
                          toast.success('AI Reply copied to clipboard!');
                          setTimeout(() => setCopiedReplyId(null), 2000);
                        }}
                        className="text-[10px] text-slate-500 hover:text-primary transition-all flex items-center gap-1 bg-transparent border-none cursor-pointer p-0"
                      >
                        {copiedReplyId === selectedInboxReview.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-600 font-bold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Response</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <textarea
                    rows={6}
                    value={editingReplyText}
                    onChange={(e) => setEditingReplyText(e.target.value)}
                    placeholder="No reply generated. If the customer leaves text feedback, AI will suggest a response here."
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 focus:border-primary rounded-xl outline-none text-xs text-slate-700 leading-relaxed font-sans resize-none"
                  />

                  {editingReplyText && (
                    <button
                      onClick={handleSaveAIResponse}
                      disabled={savingReply}
                      className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all border-none cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      {savingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      <span>Save & Finalize Reply</span>
                    </button>
                  )}
                </div>

              </div>
            ) : (
              <div className="text-center py-16 text-slate-400 text-xs flex flex-col items-center justify-center space-y-3">
                <FileText className="w-8 h-8 text-slate-300" />
                <p>Select any customer feedback card on the left to view full details and manage AI Replies.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 3: AI Weekly Insights Dashboard */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Reviews over time chart */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2">
              <div className="flex items-center gap-1.5 border-b border-slate-100 pb-3 mb-4">
                <BarChart3 className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-bold text-[#001B50] uppercase tracking-wider">Feedback Volume Trend</h3>
              </div>
              <div className="w-full h-64 pt-2">
                {trendsChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendsChartData} margin={{ left: -25, right: 5, top: 5, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorReviews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0046a1" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#0046a1" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px' }} />
                      <Area type="monotone" dataKey="reviews" name="Reviews" stroke="#0046a1" strokeWidth={2} fillOpacity={1} fill="url(#colorReviews)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">No feedback trend data.</div>
                )}
              </div>
            </div>

            {/* Sentiment breakdown pie chart */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-1.5 border-b border-slate-100 pb-3 mb-4">
                <Sparkles className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-bold text-[#001B50] uppercase tracking-wider">Sentiment Breakdown</h3>
              </div>
              <div className="w-full h-64 flex items-center justify-center">
                {sentimentChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sentimentChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {sentimentChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value} reviews`} />
                      <Legend verticalAlign="bottom" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">No sentiment records.</div>
                )}
              </div>
            </div>

          </div>

          {/* Top complaints and strengths list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Top Strengths (ratings 4-5) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-1.5 border-b border-slate-100 pb-3 mb-4">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Key Business Strengths</h3>
              </div>
              <div className="space-y-3 min-h-[150px]">
                {strengthsChartData.length > 0 ? (
                  strengthsChartData.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-700">{item.tag}</span>
                      <span className="bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold px-2 py-0.5 rounded-full">{item.count} votes</span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 italic py-8 text-center">Collect positive ratings to generate strengths list.</div>
                )}
              </div>
            </div>

            {/* Top complaints (ratings 1-3) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-1.5 border-b border-slate-100 pb-3 mb-4">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <h3 className="text-xs font-bold text-red-800 uppercase tracking-wider">Frequent Complaint Issues</h3>
              </div>
              <div className="space-y-3 min-h-[150px]">
                {complaintsChartData.length > 0 ? (
                  complaintsChartData.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-700">{item.tag}</span>
                      <span className="bg-red-50 border border-red-100 text-red-650 font-bold px-2 py-0.5 rounded-full">{item.count} complaints</span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 italic py-8 text-center">No complaints recorded yet! Great job.</div>
                )}
              </div>
            </div>

          </div>

          {/* AI-Generated Weekly Analysis Text Box */}
          <div className="bg-[#001B50] p-6 rounded-2xl border border-blue-900 text-white space-y-6 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-blue-800/80 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
                <h3 className="text-sm font-extrabold uppercase tracking-wider">Weekly AI Business Summary & Actions</h3>
              </div>
              <button
                onClick={() => fetchWeeklyInsights(selectedQrFilter)}
                disabled={insightsLoading}
                className="p-2 hover:bg-blue-800/50 rounded-xl text-blue-300 hover:text-white transition-all cursor-pointer bg-transparent border-none"
                title="Regenerate Insights"
              >
                <RefreshCw className={`w-4 h-4 ${insightsLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {insightsLoading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-3">
                <Loader2 className="w-8 h-8 text-blue-300 animate-spin" />
                <span className="text-xs text-blue-200 tracking-wide font-semibold uppercase">Analyzing customer feedback history...</span>
              </div>
            ) : aiInsights ? (
              <div className="space-y-6 animate-fade-in text-xs leading-relaxed">
                
                {/* Executive summary */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest block">Executive Summary</span>
                  <p className="text-blue-50 text-sm font-sans">{aiInsights.summary}</p>
                </div>

                {/* Bullets lists grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-blue-800/60">
                  
                  {/* Strengths */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">Core Strengths</span>
                    <ul className="space-y-2 text-slate-200 list-disc pl-4">
                      {aiInsights.strengths.map((str, idx) => <li key={idx}>{str}</li>)}
                    </ul>
                  </div>

                  {/* Complaints */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest block">Areas to Improve</span>
                    <ul className="space-y-2 text-slate-200 list-disc pl-4">
                      {aiInsights.complaints.map((comp, idx) => <li key={idx}>{comp}</li>)}
                    </ul>
                  </div>

                  {/* Recommendations */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">Suggested Actions</span>
                    <ul className="space-y-2 text-slate-200 list-disc pl-4">
                      {aiInsights.recommendations.map((rec, idx) => <li key={idx}>{rec}</li>)}
                    </ul>
                  </div>

                </div>

              </div>
            ) : (
              <div className="text-center py-16 text-blue-200 text-xs italic">
                Click the Refresh button above to generate AI Insights for your reviews.
              </div>
            )}
          </div>

        </div>
      )}

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
            <div className="bg-white p-6 rounded-xl flex items-center justify-center border border-slate-200 shadow-inner max-w-[240px] max-h-[288px] mx-auto overflow-hidden">
              <div className="w-full h-full flex items-center justify-center">
                <CustomizableQRCode
                  value={getQrUrl(selectedQR.shortCode)}
                  fgColor={selectedQR.fgColor || '#000000'}
                  bgColor={selectedQR.bgColor || '#FFFFFF'}
                  logoUrl={selectedQR.logoUrl}
                  logoPreset={selectedQR.customDesign?.logoPreset || 'none'}
                  frameId={selectedQR.customDesign?.frameId || 'no_frame'}
                  frameText={selectedQR.customDesign?.frameText || ''}
                  frameColor={selectedQR.customDesign?.frameColor || '#001b50'}
                  frameTextColor={selectedQR.customDesign?.frameTextColor || '#ffffff'}
                  size={180}
                />
              </div>
            </div>
 
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-550">
                <div className="flex justify-between">
                  <span>Shortcode:</span>
                  <span className="font-mono text-slate-800">/q/{selectedQR.shortCode}</span>
                </div>
                <div className="flex justify-between">
                  <span>Threshold:</span>
                  <span className="font-semibold text-slate-800">
                    &ge; {selectedQR.destination.positiveThreshold} Stars Redirection
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={`font-bold ${selectedQR.status === 'ACTIVE' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {selectedQR.status}
                  </span>
                </div>
              </div>
 
              <div className="flex gap-3">
                <button
                  onClick={() => downloadQR(selectedQR, selectedQR.destination.businessName)}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white py-2.5 rounded-xl text-xs font-semibold cursor-pointer active:scale-95 transition-all border-none"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PNG</span>
                </button>
                <a
                  href={getQrUrl(selectedQR.shortCode)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 transition-all text-center"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Test Link</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recovery Modal */}
      {recoveryModalOpen && recoveryReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 space-y-6 animate-scale-in relative shadow-xl">
            <div className="flex justify-between items-center">
              <h3 className="text-md font-bold text-red-700 flex items-center gap-1.5">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span>Review Recovery Workflow</span>
              </h3>
              <button
                onClick={() => {
                  setRecoveryModalOpen(false);
                  setRecoveryReview(null);
                }}
                className="text-slate-500 hover:text-slate-700 text-xs bg-slate-50 p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
            </div>

            <p className="text-slate-500 text-xs">
              Sending a fast, personalized outreach to a dissatisfied customer shows extreme professionalism and often leads to the deletion of poor reviews. Send this template to <strong>{recoveryReview.name || 'this customer'}</strong>.
            </p>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <textarea
                readOnly
                rows={12}
                value={getRecoveryEmailContent(recoveryReview)}
                className="w-full bg-transparent border-none outline-none text-xs text-slate-700 font-sans leading-relaxed resize-none"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(getRecoveryEmailContent(recoveryReview));
                  setCopiedRecovery(true);
                  toast.success('Recovery template copied to clipboard!');
                  setTimeout(() => setCopiedRecovery(false), 2000);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                {copiedRecovery ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copiedRecovery ? 'Copied!' : 'Copy Template'}</span>
              </button>
              {recoveryReview.phone && (
                <a
                  href={`tel:${recoveryReview.phone}`}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold transition-all shadow-xs text-center border-none"
                >
                  <Play className="w-4 h-4 fill-current text-white" />
                  <span>Call Customer</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
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

      {/* Universal QR Customization Modal */}
      {selectedDesignQr && (
        <QRDesignModal
          isOpen={!!selectedDesignQr}
          onClose={() => setSelectedDesignQr(null)}
          qrCode={selectedDesignQr}
          onSave={(updatedQr) => {
            setQrs(prev => prev.map(q => q.id === updatedQr.id ? { ...q, ...updatedQr } : q));
            setSelectedQR(prev => prev && prev.id === updatedQr.id ? { ...prev, ...updatedQr } : prev);
          }}
        />
      )}
    </div>
  );
}
