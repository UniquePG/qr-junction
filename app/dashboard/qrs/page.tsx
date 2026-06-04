'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/components/AuthContext';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Search, 
  Filter, 
  Copy, 
  Check, 
  Download, 
  Trash2, 
  Edit, 
  Play, 
  Pause, 
  ExternalLink, 
  Loader2,
  Eye
} from 'lucide-react';
import { toast } from 'react-toastify';

interface QRCodeData {
  id: string;
  shortCode: string;
  name: string;
  type: string;
  status: 'ACTIVE' | 'PAUSED' | 'DELETED';
  destination: any;
  fgColor: string;
  bgColor: string;
  totalScans: number;
  uniqueScans: number;
  createdAt: string;
  campaign?: {
    id: number;
    name: string;
  } | null;
}

import ConfirmModal from '@/components/ConfirmModal';

export default function QrListPage() {
  const { user } = useAuth();
  const [qrs, setQrs] = useState<QRCodeData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  
  // Clipboard copied hint
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // QR Modal viewer state
  const [selectedQR, setSelectedQR] = useState<QRCodeData | null>(null);

  // Custom Confirm Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingQrId, setDeletingQrId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchQRs = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const res = await fetch('/api/qrs', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch QR codes.');
      const data = await res.json();
      setQrs(data.qrCodes);
    } catch (error: any) {
      console.error(error);
      toast.error('Could not load QR codes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQRs();
  }, [user]);

  const handleCopy = (id: string, shortCode: string) => {
    const fullUrl = `${window.location.origin}/q/${shortCode}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    toast.success('Redirect URL copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleStatus = async (qr: QRCodeData) => {
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

      if (!res.ok) throw new Error('Failed to update status.');
      
      // Update local state
      setQrs(prev => prev.map(item => item.id === qr.id ? { ...item, status: newStatus } : item));
      if (selectedQR?.id === qr.id) {
        setSelectedQR(prev => prev ? { ...prev, status: newStatus } : null);
      }
      
      toast.success(`Campaign ${newStatus === 'ACTIVE' ? 'activated' : 'paused'} successfully!`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update status.');
    }
  };

  const triggerDeleteConfirm = (id: string) => {
    setDeletingQrId(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
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

      if (!res.ok) throw new Error('Failed to delete QR code.');
      
      setQrs(prev => prev.filter(item => item.id !== deletingQrId));
      toast.success('QR Code deleted.');
      setDeleteModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete QR code.');
    } finally {
      setDeleting(false);
      setDeletingQrId(null);
    }
  };

  const downloadQR = (shortCode: string, fgColor: string, bgColor: string) => {
    const svg = document.getElementById(`qr-svg-${shortCode}`);
    if (!svg) return;
    const svgXml = new XMLSerializer().serializeToString(svg);
    const svgBase64 = btoa(unescape(encodeURIComponent(svgXml)));
    
    // Create image and draw to canvas to export PNG
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
        downloadLink.download = `qr-code-${shortCode}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    };
  };

  // Filtered QR list
  const filteredQrs = qrs.filter(qr => {
    const matchesSearch = qr.name.toLowerCase().includes(search.toLowerCase()) || 
                          qr.shortCode.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'ALL' || qr.type === typeFilter;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-slate-400 text-sm">Loading your QR portfolio...</p>
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
            placeholder="Search QR codes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-2 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all"
          />
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500 hidden sm:block" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 text-sm text-slate-700 outline-none focus:border-primary cursor-pointer"
          >
            <option value="ALL">All Types</option>
            <option value="URL">Website (URL)</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="EMAIL">Email</option>
            <option value="PHONE">Phone Dialer</option>
            <option value="APP_DOWNLOAD">App Downloads</option>
            <option value="WIFI">Wi-Fi Network</option>
          </select>
        </div>
      </div>

      {/* Main Grid / Cards */}
      {filteredQrs.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 border border-slate-200 rounded-2xl p-8 space-y-4">
          <p className="text-slate-500 text-sm">No QR codes found matching your criteria.</p>
          <Link
            href="/dashboard/qrs/new"
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white py-2 px-5 rounded-xl text-sm font-semibold transition-all duration-200 border-none"
          >
            Create Your First QR
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQrs.map((qr) => (
            <div 
              key={qr.id} 
              className={`bg-white border p-5 rounded-2xl shadow-xs transition-all relative overflow-hidden group flex flex-col justify-between h-full ${
                qr.status === 'PAUSED' ? 'border-amber-200 bg-amber-50/10 opacity-75' : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              {/* Hidden QR Code element for exporting */}
              <div className="hidden">
                <QRCodeSVG
                  id={`qr-svg-${qr.shortCode}`}
                  value={`${window.location.origin}/q/${qr.shortCode}`}
                  size={500}
                  fgColor={qr.fgColor}
                  bgColor={qr.bgColor}
                  level="H"
                />
              </div>

              {/* Top Row: Title, type */}
              <div>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-[#001B50] truncate max-w-[170px]" title={qr.name}>{qr.name}</h4>
                    <div className="flex gap-1.5 flex-wrap items-center">
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-50 text-primary border border-slate-200">
                        {qr.type}
                      </span>
                      {qr.campaign && (
                        <span className="inline-block text-[9px] font-semibold text-slate-655 px-2 py-0.5 rounded bg-slate-50 border border-slate-200 truncate max-w-[110px]" title={`Campaign: ${qr.campaign.name}`}>
                          📁 {qr.campaign.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions right */}
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setSelectedQR(qr)}
                      className="p-2 bg-slate-50 border border-slate-200 text-slate-500 hover:text-[#001B50] rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                      title="View QR Code"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(qr)}
                      className={`p-2 border rounded-lg transition-all cursor-pointer ${
                        qr.status === 'ACTIVE' 
                          ? 'bg-amber-50 border-amber-250 text-amber-600 hover:bg-amber-100' 
                          : 'bg-emerald-50 border-emerald-250 text-emerald-650 hover:bg-emerald-100'
                      }`}
                      title={qr.status === 'ACTIVE' ? 'Pause Campaign' : 'Activate Campaign'}
                    >
                      {qr.status === 'ACTIVE' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Redirect Details */}
                <div className="mt-3 flex items-center justify-between bg-slate-50 py-1.5 px-3 rounded-lg border border-slate-200">
                  <span className="font-mono text-xs text-slate-600 truncate max-w-[160px]">
                    /q/{qr.shortCode}
                  </span>
                  <button
                    onClick={() => handleCopy(qr.id, qr.shortCode)}
                    className="text-slate-500 hover:text-[#001B50] transition-colors cursor-pointer"
                  >
                    {copiedId === qr.id ? <Check className="w-3.5 h-3.5 text-emerald-650" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Metrics Middle */}
              <div className="flex gap-4 border-t border-b border-slate-100 py-3 my-2">
                <div className="flex-1 text-center bg-slate-50 py-1 rounded border border-slate-200/50">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">Scans</p>
                  <p className="text-sm font-bold text-[#001B50] mt-0.5">{qr.totalScans}</p>
                </div>
                <div className="flex-1 text-center bg-slate-50 py-1 rounded border border-slate-200/50">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">Unique</p>
                  <p className="text-sm font-bold text-primary mt-0.5">{qr.uniqueScans}</p>
                </div>
              </div>

              {/* Bottom Row: Actions */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">
                  {new Date(qr.createdAt).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-1">
                  <Link
                    href={`/dashboard/qrs/edit/${qr.id}`}
                    className="p-1.5 text-slate-500 hover:text-[#001B50] transition-colors flex items-center gap-1"
                    title="Edit Destination"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </Link>
                  <button
                    onClick={() => triggerDeleteConfirm(qr.id)}
                    className="p-1.5 text-slate-500 hover:text-red-650 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Delete QR"
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

      {/* QR Viewer Modal overlay */}
      {selectedQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 space-y-6 animate-scale-in relative shadow-xl">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-[#001B50] truncate max-w-[250px]">{selectedQR.name}</h3>
              <button
                onClick={() => setSelectedQR(null)}
                className="text-slate-500 hover:text-[#001B50] text-sm bg-slate-50 p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* QR Card Container */}
            <div className="bg-white p-6 rounded-xl flex items-center justify-center border border-slate-200 shadow-inner max-w-[240px] mx-auto">
              <QRCodeSVG
                value={`${window.location.origin}/q/${selectedQR.shortCode}`}
                size={180}
                fgColor={selectedQR.fgColor}
                bgColor={selectedQR.bgColor}
                level="H"
              />
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="font-bold text-slate-800 uppercase">{selectedQR.type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shortcode:</span>
                  <span className="font-mono text-slate-850">/q/{selectedQR.shortCode}</span>
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
                  className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white py-2.5 rounded-xl text-xs font-semibold cursor-pointer active:scale-95 transition-all shadow-primary border-none"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PNG</span>
                </button>
                <a
                  href={`${window.location.origin}/q/${selectedQR.shortCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-750 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 transition-all text-center"
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
        title="Delete QR Code?"
        message="Are you sure you want to delete this QR Code? Permanent redirects will stop working."
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
        isLoading={deleting}
        onConfirm={handleDelete}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingQrId(null);
        }}
      />
    </div>
  );
}
