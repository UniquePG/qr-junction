'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/components/AuthContext';
import Link from 'next/link';
import { 
  FolderOpen, 
  Plus, 
  Search, 
  Calendar, 
  TrendingUp, 
  QrCode, 
  Trash2, 
  Edit, 
  Eye, 
  Loader2, 
  X, 
  Check, 
  AlertCircle,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'react-toastify';

interface CampaignData {
  id: number;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  qrCodesCount: number;
  totalScans: number;
  uniqueScans: number;
}

interface CampaignDetailData extends CampaignData {
  qrCodes: Array<{
    id: number;
    shortCode: string;
    name: string;
    type: string;
    status: string;
    totalScans: number;
    uniqueScans: number;
    createdAt: string;
  }>;
}

import ConfirmModal from '@/components/ConfirmModal';

export default function CampaignsPage() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Custom Confirm Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingCampaignId, setDeletingCampaignId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Modal & Drawer State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  
  // Selected Campaign for Detail/Edit
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [campaignDetail, setCampaignDetail] = useState<CampaignDetailData | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCampaigns = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const res = await fetch('/api/campaigns', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch campaigns.');
      const data = await res.json();
      setCampaigns(data.campaigns);
    } catch (error) {
      console.error(error);
      toast.error('Could not load campaigns.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [user]);

  const fetchCampaignDetails = async (id: number) => {
    setDetailLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const res = await fetch(`/api/campaigns/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch campaign details.');
      const data = await res.json();
      setCampaignDetail(data.campaign);
    } catch (error) {
      console.error(error);
      toast.error('Could not load campaign details.');
      setIsDetailDrawerOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOpenDetail = (id: number) => {
    setSelectedCampaignId(id);
    setIsDetailDrawerOpen(true);
    fetchCampaignDetails(id);
  };

  const handleOpenCreate = () => {
    setFormName('');
    setFormDescription('');
    setFormStartDate('');
    setFormEndDate('');
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (campaign: CampaignData) => {
    setSelectedCampaignId(campaign.id);
    setFormName(campaign.name);
    setFormDescription(campaign.description || '');
    setFormStartDate(campaign.startDate ? campaign.startDate.substring(0, 10) : '');
    setFormEndDate(campaign.endDate ? campaign.endDate.substring(0, 10) : '');
    setIsEditModalOpen(true);
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error('Campaign name is required.');
      return;
    }

    setSubmitting(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formName,
          description: formDescription || null,
          startDate: formStartDate || null,
          endDate: formEndDate || null,
        }),
      });

      if (!res.ok) throw new Error('Failed to create campaign.');
      
      toast.success('Campaign created successfully!');
      setIsCreateModalOpen(false);
      fetchCampaigns();
    } catch (error) {
      console.error(error);
      toast.error('Failed to create campaign.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error('Campaign name is required.');
      return;
    }

    setSubmitting(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const res = await fetch(`/api/campaigns/${selectedCampaignId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formName,
          description: formDescription || null,
          startDate: formStartDate || null,
          endDate: formEndDate || null,
        }),
      });

      if (!res.ok) throw new Error('Failed to update campaign.');

      toast.success('Campaign updated successfully!');
      setIsEditModalOpen(false);
      fetchCampaigns();
      if (isDetailDrawerOpen && selectedCampaignId) {
        fetchCampaignDetails(selectedCampaignId);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to update campaign.');
    } finally {
      setSubmitting(false);
    }
  };

  const triggerDeleteConfirm = (id: number) => {
    setDeletingCampaignId(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteCampaign = async () => {
    if (!deletingCampaignId) return;

    setDeleting(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const res = await fetch(`/api/campaigns/${deletingCampaignId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete campaign.');

      toast.success('Campaign deleted successfully.');
      setIsDetailDrawerOpen(false);
      fetchCampaigns();
      setDeleteModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete campaign.');
    } finally {
      setDeleting(false);
      setDeletingCampaignId(null);
    }
  };

  const getCampaignStatus = (start: string | null, end: string | null) => {
    if (!start && !end) return { label: 'Ongoing', color: 'text-emerald-650 bg-emerald-50 border-emerald-250', icon: CheckCircle2 };
    const now = new Date();
    const startTime = start ? new Date(start) : null;
    const endTime = end ? new Date(end) : null;

    if (startTime && startTime > now) {
      return { label: 'Scheduled', color: 'text-amber-650 bg-amber-50 border-amber-250', icon: Clock };
    }
    if (endTime && endTime < now) {
      return { label: 'Ended', color: 'text-slate-500 bg-slate-100 border-slate-250', icon: AlertTriangle };
    }
    return { label: 'Active', color: 'text-emerald-650 bg-emerald-50 border-emerald-250', icon: CheckCircle2 };
  };

  const filteredCampaigns = campaigns.filter(camp => {
    return camp.name.toLowerCase().includes(search.toLowerCase()) ||
           (camp.description && camp.description.toLowerCase().includes(search.toLowerCase()));
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-slate-400 text-sm">Loading marketing campaigns...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top action layout */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-2 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all"
          />
        </div>

        {/* Add Campaign Button */}
        <button
          onClick={handleOpenCreate}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white py-2 px-5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer shadow-primary border-none"
        >
          <Plus className="w-4 h-4" />
          <span>New Campaign</span>
        </button>
      </div>

      {/* Campaigns Grid */}
      {filteredCampaigns.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 border border-slate-200 rounded-2xl p-8 space-y-4">
          <FolderOpen className="w-12 h-12 text-slate-400 mx-auto" />
          <p className="text-slate-500 text-sm">No campaigns found. Group your QRs into clean promotional events.</p>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white py-2 px-5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer border-none"
          >
            Create Your First Campaign
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((camp) => {
            const status = getCampaignStatus(camp.startDate, camp.endDate);
            const StatusIcon = status.icon;

            return (
              <div 
                key={camp.id}
                className="bg-white border border-slate-200/80 hover:border-slate-300 p-5 rounded-2xl shadow-xs transition-all flex flex-col justify-between h-full group relative overflow-hidden"
              >
                {/* Visual indicator bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/60 to-secondary/60" />

                <div>
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-[#001B50] truncate max-w-[170px]" title={camp.name}>
                      {camp.name}
                    </h4>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${status.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      <span>{status.label}</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 h-8 leading-relaxed">
                    {camp.description || 'No description provided.'}
                  </p>
                </div>

                {/* Metrics Summary */}
                <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 my-2 text-center">
                  <div className="bg-slate-50 py-1.5 rounded border border-slate-200/60">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block">QR Codes</span>
                    <span className="text-sm font-bold text-[#001B50] mt-0.5 block">{camp.qrCodesCount}</span>
                  </div>
                  <div className="bg-slate-50 py-1.5 rounded border border-slate-200/60">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Total Scans</span>
                    <span className="text-sm font-bold text-[#001B50] mt-0.5 block">{camp.totalScans}</span>
                  </div>
                  <div className="bg-slate-50 py-1.5 rounded border border-slate-200/60">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Unique</span>
                    <span className="text-sm font-bold text-primary mt-0.5 block">{camp.uniqueScans}</span>
                  </div>
                </div>

                {/* Bottom Row Actions */}
                <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-3 mt-1">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      {camp.startDate ? new Date(camp.startDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : '∞'} 
                      {' - '} 
                      {camp.endDate ? new Date(camp.endDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : '∞'}
                    </span>
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenDetail(camp.id)}
                      className="p-1.5 text-slate-500 hover:text-[#001B50] transition-colors flex items-center gap-1 cursor-pointer bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(camp)}
                      className="p-1.5 text-slate-500 hover:text-[#001B50] transition-colors flex items-center gap-1 cursor-pointer bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg"
                      title="Edit Campaign"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => triggerDeleteConfirm(camp.id)}
                      className="p-1.5 text-slate-500 hover:text-red-655 transition-colors flex items-center gap-1 cursor-pointer bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg"
                      title="Delete Campaign"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Campaign Details Drawer */}
      {isDetailDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div 
            className="absolute inset-0"
            onClick={() => setIsDetailDrawerOpen(false)}
          />
          
          <div className="relative w-full max-w-2xl bg-white border-l border-slate-200 h-full p-6 sm:p-8 flex flex-col justify-between shadow-2xl z-10 animate-slide-in overflow-y-auto">
            
            {/* Header detail */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold text-[#001B50]">Campaign Report</h3>
                </div>
                <button
                  onClick={() => setIsDetailDrawerOpen(false)}
                  className="p-2 text-slate-500 hover:text-[#001B50] bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {detailLoading || !campaignDetail ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <p className="text-slate-500 text-xs">Loading analytics summaries...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Campaign Card metadata */}
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xl font-bold text-[#001B50]">{campaignDetail.name}</h4>
                        <p className="text-xs text-slate-500 mt-1">{campaignDetail.description || 'No description provided.'}</p>
                      </div>
                      <button
                        onClick={() => handleOpenEdit(campaignDetail)}
                        className="text-xs text-slate-600 hover:text-[#001B50] flex items-center gap-1 px-3 py-1.5 bg-white rounded-xl border border-slate-200 cursor-pointer"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Edit Details</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-3 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>
                          Timeline: {campaignDetail.startDate ? new Date(campaignDetail.startDate).toLocaleDateString() : 'Immediate'} 
                          {' to '} 
                          {campaignDetail.endDate ? new Date(campaignDetail.endDate).toLocaleDateString() : 'Forever'}
                        </span>
                      </div>
                      <div className="flex justify-end">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getCampaignStatus(campaignDetail.startDate, campaignDetail.endDate).color}`}>
                          {getCampaignStatus(campaignDetail.startDate, campaignDetail.endDate).label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Cumulative stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center">
                      <QrCode className="w-5 h-5 text-secondary mx-auto mb-1.5" />
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">QR Codes</span>
                      <span className="text-xl font-extrabold text-[#001B50] mt-1 block">{campaignDetail.qrCodesCount}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center">
                      <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1.5" />
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Scans</span>
                      <span className="text-xl font-extrabold text-[#001B50] mt-1 block">{campaignDetail.totalScans}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center">
                      <Eye className="w-5 h-5 text-accent mx-auto mb-1.5" />
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Unique Scans</span>
                      <span className="text-xl font-extrabold text-primary mt-1 block">{campaignDetail.uniqueScans}</span>
                    </div>
                  </div>

                  {/* Linked QRs List */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Linked QR Codes ({campaignDetail.qrCodes.length})</h4>
                    
                    {campaignDetail.qrCodes.length === 0 ? (
                      <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-xl p-6 text-slate-400 text-xs">
                        No QR codes are linked to this campaign yet. Go to QR Codes panel to link endpoints.
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                        {campaignDetail.qrCodes.map((qr) => (
                          <div 
                            key={qr.id}
                            className="bg-slate-50/50 border border-slate-200 p-4 rounded-xl flex items-center justify-between hover:bg-slate-50 transition-colors"
                          >
                            <div className="space-y-1">
                              <p className="text-sm font-semibold text-slate-800 truncate max-w-[200px]" title={qr.name}>{qr.name}</p>
                              <div className="flex gap-2 items-center text-[10px]">
                                <span className="font-mono text-slate-400">/q/{qr.shortCode}</span>
                                <span className="px-1.5 py-0.5 rounded bg-white text-slate-500 uppercase font-bold text-[8px] border border-slate-200">{qr.type}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-6">
                              <div className="text-right text-xs">
                                <span className="text-slate-400 text-[9px] uppercase tracking-wider block">Total Scans</span>
                                <span className="font-bold text-[#001B50] mt-0.5 block">{qr.totalScans}</span>
                              </div>
                              <Link
                                href={`/dashboard/qrs/edit/${qr.id}`}
                                className="p-2 hover:bg-slate-100 text-slate-500 hover:text-[#001B50] rounded-lg border border-slate-200 transition-colors"
                                title="Edit QR"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Delete button detail footer */}
            {campaignDetail && !detailLoading && (
              <div className="pt-6 border-t border-slate-200 flex gap-4 mt-6">
                <button
                  onClick={() => triggerDeleteConfirm(campaignDetail.id)}
                  className="w-full flex items-center justify-center gap-2 bg-red-50 border border-red-250 hover:bg-red-100 text-red-655 py-3 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Campaign</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Creation Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 animate-scale-in relative shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-[#001B50] flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-primary" />
                <span>Create New Campaign</span>
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-500 hover:text-[#001B50] bg-slate-50 p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase block">Campaign Name</label>
                <input
                  type="text"
                  placeholder="e.g. Summer Promo 2026"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-primary rounded-xl py-3 px-4 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase block">Description</label>
                <textarea
                  placeholder="Summarize the targets, placements, or goals of this campaign..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-primary rounded-xl py-3 px-4 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase block">Start Date</label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-primary rounded-xl py-2.5 px-4 text-xs text-slate-800 outline-none cursor-pointer"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase block">End Date</label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-primary rounded-xl py-2.5 px-4 text-xs text-slate-800 outline-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4 border-t border-slate-100 mt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 px-4 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold cursor-pointer active:scale-95 transition-all shadow-primary disabled:opacity-50 flex items-center justify-center gap-2 border-none"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Generate Campaign</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 border border-slate-200 hover:bg-slate-100 text-slate-600 py-3 px-4 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer bg-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Editing Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 animate-scale-in relative shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-[#001B50] flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-primary" />
                <span>Edit Campaign Details</span>
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-500 hover:text-[#001B50] bg-slate-50 p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateCampaign} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase block">Campaign Name</label>
                <input
                  type="text"
                  placeholder="e.g. Summer Promo 2026"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-primary rounded-xl py-3 px-4 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase block">Description</label>
                <textarea
                  placeholder="Summarize the targets, placements, or goals of this campaign..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-primary rounded-xl py-3 px-4 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase block">Start Date</label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-primary rounded-xl py-2.5 px-4 text-xs text-slate-800 outline-none cursor-pointer"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase block">End Date</label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-primary rounded-xl py-2.5 px-4 text-xs text-slate-800 outline-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4 border-t border-slate-100 mt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-grow py-3 px-4 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold cursor-pointer active:scale-95 transition-all shadow-primary disabled:opacity-50 flex items-center justify-center gap-2 border-none"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Save Changes</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-grow border border-slate-200 hover:bg-slate-100 text-slate-655 py-3 px-4 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer bg-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Campaign?"
        message="Are you sure you want to delete this campaign? Connected QR codes will not be deleted, but they will be unlinked from this campaign folder."
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
        isLoading={deleting}
        onConfirm={handleDeleteCampaign}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingCampaignId(null);
        }}
      />
    </div>
  );
}
