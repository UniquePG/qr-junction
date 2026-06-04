'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/components/AuthContext';
import { 
  Users, 
  Search, 
  Copy, 
  Check, 
  Trash2, 
  CheckSquare, 
  Loader2, 
  Save, 
  PhoneCall, 
  Mail 
} from 'lucide-react';
import { toast } from 'react-toastify';

interface LeadData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'WON' | 'LOST';
  notes: string | null;
  createdAt: string;
  qrCode: {
    name: string;
    type: string;
    shortCode: string;
  } | null;
}

import ConfirmModal from '@/components/ConfirmModal';

export default function LeadsPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Notes editing states
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState('');
  
  // Copy clipboard states
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Custom Confirm Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingLeadId, setDeletingLeadId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchLeads = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const res = await fetch('/api/leads', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to load leads list.');
      const data = await res.json();
      setLeads(data.leads);
    } catch (error) {
      console.error(error);
      toast.error('Could not fetch leads list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [user]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status.');

      setLeads(prev => prev.map(lead => lead.id === id ? { ...lead, status: newStatus as any } : lead));
      toast.success('Lead status updated!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update status.');
    }
  };

  const handleStartEditNotes = (lead: LeadData) => {
    setEditingNotesId(lead.id);
    setTempNotes(lead.notes || '');
  };

  const handleSaveNotes = async (id: string) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ notes: tempNotes }),
      });

      if (!res.ok) throw new Error('Failed to save notes.');

      setLeads(prev => prev.map(lead => lead.id === id ? { ...lead, notes: tempNotes } : lead));
      setEditingNotesId(null);
      toast.success('Notes updated.');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update notes.');
    }
  };

  const triggerDeleteConfirm = (id: string) => {
    setDeletingLeadId(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteLead = async () => {
    if (!deletingLeadId) return;

    setDeleting(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const res = await fetch(`/api/leads/${deletingLeadId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete lead.');

      setLeads(prev => prev.filter(lead => lead.id !== deletingLeadId));
      toast.success('Lead removed from CRM.');
      setDeleteModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete lead.');
    } finally {
      setDeleting(false);
      setDeletingLeadId(null);
    }
  };

  // Filtered Leads list
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.email.toLowerCase().includes(search.toLowerCase()) ||
      (lead.phone && lead.phone.includes(search)) ||
      (lead.qrCode && lead.qrCode.name.toLowerCase().includes(search.toLowerCase()));
    
    const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-slate-400 text-sm">Loading lead registry...</p>
      </div>
    );
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-50 border-blue-200 text-blue-650';
      case 'CONTACTED':
        return 'bg-amber-50 border-amber-250 text-amber-650';
      case 'QUALIFIED':
        return 'bg-purple-50 border-purple-250 text-purple-650';
      case 'WON':
        return 'bg-emerald-50 border-emerald-250 text-emerald-655';
      case 'LOST':
        return 'bg-red-50 border-red-250 text-red-650';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-600';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search & Filter Header layout */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search leads, email, campaign..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-2 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 text-sm text-slate-700 outline-none focus:border-primary cursor-pointer"
        >
          <option value="ALL">All Statuses</option>
          <option value="NEW">New</option>
          <option value="CONTACTED">Contacted</option>
          <option value="QUALIFIED">Qualified</option>
          <option value="WON">Won (Converted)</option>
          <option value="LOST">Lost</option>
        </select>
      </div>

      {/* CRM Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {filteredLeads.length === 0 ? (
          <div className="text-center py-16 p-8 space-y-2 text-slate-500">
            <Users className="w-8 h-8 mx-auto text-slate-450 mb-1" />
            <p className="text-sm font-semibold text-[#001B50]">No leads captured yet.</p>
            <p className="text-xs text-slate-400">Enable lead collection forms on your WiFi / PDF template redirects.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-4 px-6">Lead Details</th>
                  <th className="py-4 px-6">Source QR Campaign</th>
                  <th className="py-4 px-6">Status Stage</th>
                  <th className="py-4 px-6">Follow-up Notes</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 text-slate-650">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                    {/* Details Column */}
                    <td className="py-4 px-6 space-y-1">
                      <p className="font-semibold text-[#001B50] text-sm">{lead.name}</p>
                      
                      {/* Email info */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 select-all">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{lead.email}</span>
                        <button
                          onClick={() => handleCopy(`email-${lead.id}`, lead.email)}
                          className="text-slate-400 hover:text-[#001B50] p-0.5 cursor-pointer"
                          title="Copy Email"
                        >
                          {copiedId === `email-${lead.id}` ? <Check className="w-3 h-3 text-emerald-650" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>

                      {/* Phone info */}
                      {lead.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                          <span>{lead.phone}</span>
                          <button
                            onClick={() => handleCopy(`phone-${lead.id}`, lead.phone || '')}
                            className="text-slate-400 hover:text-[#001B50] p-0.5 cursor-pointer"
                            title="Copy Phone"
                          >
                            {copiedId === `phone-${lead.id}` ? <Check className="w-3 h-3 text-emerald-650" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Attribution Campaign Badge */}
                    <td className="py-4 px-6">
                      {lead.qrCode ? (
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-slate-700 truncate max-w-[150px]" title={lead.qrCode.name}>
                            {lead.qrCode.name}
                          </p>
                          <span className="text-[9px] font-mono text-slate-400">
                            /q/{lead.qrCode.shortCode}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-450 italic">Direct Referral</span>
                      )}
                    </td>

                    {/* CRM Stage Selector */}
                    <td className="py-4 px-6">
                      <select
                        value={lead.status}
                        onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                        className={`text-xs font-bold py-1.5 px-3 rounded-lg border outline-none cursor-pointer ${getStatusBadgeClass(lead.status)}`}
                      >
                        <option value="NEW">New</option>
                        <option value="CONTACTED">Contacted</option>
                        <option value="QUALIFIED">Qualified</option>
                        <option value="WON">Won (Converted)</option>
                        <option value="LOST">Lost</option>
                      </select>
                    </td>

                    {/* Inline notes modifier */}
                    <td className="py-4 px-6 max-w-xs">
                      {editingNotesId === lead.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={tempNotes}
                            onChange={(e) => setTempNotes(e.target.value)}
                            className="bg-slate-50 border border-primary text-xs rounded p-1.5 text-slate-800 outline-none w-full"
                            placeholder="Add lead note..."
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveNotes(lead.id)}
                            className="p-1.5 bg-primary hover:bg-primary-hover text-white rounded hover:opacity-90 cursor-pointer border-none flex items-center justify-center"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => handleStartEditNotes(lead)}
                          className="text-xs text-slate-500 cursor-pointer hover:text-[#001B50] italic py-1 border border-transparent hover:border-slate-200 px-2 rounded min-h-[28px] truncate"
                          title="Click to edit notes"
                        >
                          {lead.notes || 'Click to add notes...'}
                        </div>
                      )}
                    </td>

                    {/* Row controls */}
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => triggerDeleteConfirm(lead.id)}
                        className="p-2 text-slate-550 hover:text-red-655 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Delete Lead"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Lead Entry?"
        message="Are you sure you want to delete this lead? This will permanently remove their records from your dashboard CRM."
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
        isLoading={deleting}
        onConfirm={handleDeleteLead}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingLeadId(null);
        }}
      />
    </div>
  );
}
