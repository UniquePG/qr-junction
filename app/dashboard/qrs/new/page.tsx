'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { QRCodeSVG } from 'qrcode.react';
import { 
  ArrowLeft, 
  Check, 
  Loader2,
  HelpCircle,
  Eye
} from 'lucide-react';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { TABS, TabType, FormData, validateForm, getDbDestination, getQrTypeFromTabType } from '@/lib/qrEngine';
import { TabFormRenderer } from '@/components/qr/TabsForms';

export default function CreateQrPage() {
  const router = useRouter();
  
  // Form State
  const [name, setName] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('url');
  const [formData, setFormData] = useState<FormData>({});
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [campaignId, setCampaignId] = useState('');

  // Style Customizer State
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');

  // UTM parameters State
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');

  // Fetch campaigns list
  React.useEffect(() => {
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
        if (res.ok) {
          const data = await res.json();
          setCampaigns(data.campaigns || []);
        }
      } catch (error) {
        console.error('Error fetching campaigns for dropdown:', error);
      }
    };
    fetchCampaigns();
  }, []);

  // Form data updater
  const updateFormData = (field: string, value: string | boolean) => {
    if (activeTab === 'whatsapp') {
      setFormData(prev => ({ ...prev, whatsapp: { ...prev.whatsapp, [field]: value } as FormData['whatsapp'] }));
    } else if (activeTab === 'linkedin') {
      setFormData(prev => ({ ...prev, linkedin: { ...prev.linkedin, [field]: value } as FormData['linkedin'] }));
    } else if (activeTab === 'telegram') {
      setFormData(prev => ({ ...prev, telegram: { ...prev.telegram, [field]: value } as FormData['telegram'] }));
    } else if (activeTab === 'contact') {
      setFormData(prev => ({ ...prev, contact: { ...prev.contact, [field]: value } as FormData['contact'] }));
    } else if (activeTab === 'sms') {
      setFormData(prev => ({ ...prev, sms: { ...prev.sms, [field]: value } as FormData['sms'] }));
    } else if (activeTab === 'email') {
      setFormData(prev => ({ ...prev, email: { ...prev.email, [field]: value } as FormData['email'] }));
    } else if (activeTab === 'wifi') {
      setFormData(prev => ({ ...prev, wifi: { ...prev.wifi, [field]: value } as FormData['wifi'] }));
    } else if (activeTab === 'app_download') {
      setFormData(prev => ({ ...prev, app_download: { ...prev.app_download, [field]: value } as FormData['app_download'] }));
    } else if (activeTab === 'landing_page') {
      setFormData(prev => ({ ...prev, landing_page: { ...prev.landing_page, [field]: value } as FormData['landing_page'] }));
    } else if (activeTab === 'review') {
      setFormData(prev => ({ ...prev, review: { ...prev.review, [field]: value } as FormData['review'] }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error('Please enter a name for the QR Code.');
      return;
    }

    const validationError = validateForm(activeTab, formData);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const destination = getDbDestination(activeTab, formData);
    const type = getQrTypeFromTabType(activeTab);

    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Unauthenticated user.');

      const token = await currentUser.getIdToken();
      const res = await fetch('/api/qrs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          type,
          destination,
          fgColor,
          bgColor,
          utmSource: utmSource || null,
          utmMedium: utmMedium || null,
          utmCampaign: utmCampaign || null,
          campaignId: campaignId ? parseInt(campaignId, 10) : null,
          landingPageId: activeTab === 'landing_page' ? destination.landingPageId : null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create QR Code');
      }

      toast.success('Dynamic QR Code created successfully!');
      router.push('/dashboard/qrs');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to create QR Code.');
    } finally {
      setLoading(false);
    }
  };

  const getCompiledDestUrl = () => {
    if (activeTab !== 'url' || !formData.url) return '';
    try {
      let u = formData.url.trim();
      if (!/^https?:\/\//i.test(u)) {
        u = `https://${u}`;
      }
      const urlObj = new URL(u);
      if (utmSource) urlObj.searchParams.set('utm_source', utmSource);
      if (utmMedium) urlObj.searchParams.set('utm_medium', utmMedium);
      if (utmCampaign) urlObj.searchParams.set('utm_campaign', utmCampaign);
      return urlObj.toString();
    } catch (e) {
      return formData.url;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Back button link */}
      <div className="flex items-center gap-3">
        <Link 
          href="/dashboard/qrs" 
          className="p-2 bg-slate-55 border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-[#001B50] rounded-xl transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-[#001B50]">Create QR Code</h2>
          <p className="text-slate-500 text-xs mt-0.5">Deploy a new dynamic, trackable scan endpoint</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Creation Form Panel */}
        <form onSubmit={handleCreate} className="lg:col-span-8 bg-white border border-slate-200 p-6 md:p-8 rounded-2xl space-y-6 shadow-sm">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* QR Code Name */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">QR Code Name</label>
              <input
                type="text"
                placeholder="e.g. Summer Flyer, WiFi Guest Card"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-55 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-3 px-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all"
                required
              />
            </div>

            {/* Campaign Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Link to Campaign (Optional)</label>
              <select
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                className="w-full bg-slate-55 border border-slate-200 focus:border-primary rounded-xl py-3 px-4 text-sm text-slate-700 outline-none cursor-pointer transition-all"
              >
                <option value="">None (Stand-alone QR)</option>
                {campaigns.map((camp) => (
                  <option key={camp.id} value={camp.id}>{camp.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* QR Type Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block">Select QR Destination Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {TABS.filter(t => t.id !== 'landing_page' && t.id !== 'review').map((t) => {
                const Icon = t.Icon;
                const isSelected = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(t.id as TabType);
                      setFormData({});
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer select-none gap-1.5 ${
                      isSelected 
                        ? 'bg-primary/10 border-primary text-primary font-semibold' 
                        : 'bg-slate-50 border border-slate-200 text-slate-500 hover:text-[#001B50] hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-slate-500'}`} />
                    <span className="text-[11px]">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Type-Specific Dynamic Fields */}
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200/60 space-y-4">
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Destination Configurations</h4>
            <TabFormRenderer
              activeTab={activeTab}
              formData={formData}
              updateFormData={updateFormData}
            />
          </div>

          {/* Design customizers */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-6 rounded-xl border border-slate-200/60">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-655 block">Foreground Color</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-8 h-8 rounded border border-slate-200 bg-transparent cursor-pointer overflow-hidden p-0"
                />
                <input
                  type="text"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="bg-white font-mono text-[10px] text-slate-750 px-2 py-1.5 rounded border border-slate-200 max-w-[70px] uppercase outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-655 block">Background Color</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-8 h-8 rounded border border-slate-200 bg-transparent cursor-pointer overflow-hidden p-0"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="bg-white font-mono text-[10px] text-slate-750 px-2 py-1.5 rounded border border-slate-200 max-w-[70px] uppercase outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* UTM parameters */}
          <div className="bg-slate-50/50 p-6 rounded-xl border border-slate-200/60 space-y-4">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-655 uppercase tracking-wide">UTM Attributes (Optional)</span>
              <span className="cursor-help" title="Used to track campaign referrals in external analytics like Google Analytics.">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-500 uppercase">UTM Source</label>
                <input
                  type="text"
                  placeholder="e.g. newsletter, flyer"
                  value={utmSource}
                  onChange={(e) => setUtmSource(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-primary rounded-lg py-2 px-3 text-xs text-slate-800 placeholder-slate-450 outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-500 uppercase">UTM Medium</label>
                <input
                  type="text"
                  placeholder="e.g. print, qr"
                  value={utmMedium}
                  onChange={(e) => setUtmMedium(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-primary rounded-lg py-2 px-3 text-xs text-slate-800 placeholder-slate-450 outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-500 uppercase">UTM Campaign</label>
                <input
                  type="text"
                  placeholder="e.g. summer_2026"
                  value={utmCampaign}
                  onChange={(e) => setUtmCampaign(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-primary rounded-lg py-2 px-3 text-xs text-slate-800 placeholder-slate-450 outline-none transition-all"
                />
              </div>
            </div>
            
            {activeTab === 'url' && formData.url && (
              <div className="text-[10px] text-slate-500 font-mono break-all mt-2 p-3 bg-slate-100 rounded-xl border border-slate-200 leading-normal">
                <span className="text-primary font-bold block mb-1">Compiled Final Destination URL:</span>
                <span className="text-slate-600 select-all">{getCompiledDestUrl()}</span>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-grow py-3 px-4 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold cursor-pointer active:scale-95 transition-all shadow-primary disabled:opacity-50 flex items-center justify-center gap-2 border-none"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Generate QR Code</span>
                </>
              )}
            </button>
            <Link
              href="/dashboard/qrs"
              className="flex-grow border border-slate-200 hover:bg-slate-100 text-slate-600 py-3 px-4 rounded-xl text-sm font-semibold text-center transition-all cursor-pointer bg-white"
            >
              Cancel
            </Link>
          </div>
        </form>

        {/* Live Preview Sidebar (col-span-4) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 shadow-sm p-6 rounded-2xl space-y-6 lg:sticky lg:top-24">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Eye className="w-4 h-4 text-primary animate-pulse" />
            <h3 className="text-sm font-semibold text-[#001B50]">Live Design Preview</h3>
          </div>

          <div className="bg-white p-6 rounded-xl flex items-center justify-center border border-slate-200 shadow-md aspect-square max-w-[200px] mx-auto transition-transform hover:scale-102">
            <QRCodeSVG
              value="https://qrjunction.in/q/preview"
              size={150}
              fgColor={fgColor}
              bgColor={bgColor}
              level="M"
            />
          </div>

          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5 text-xs text-slate-500">
              <div>
                <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-0.5">Campaign Name</span>
                <span className="text-slate-800 font-semibold truncate block">{name || 'Unnamed Campaign'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-slate-200 pt-2">
                <div>
                  <span className="text-[10px] font-semibold uppercase text-slate-400 block">Type</span>
                  <span className="text-primary font-bold uppercase">{activeTab}</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase text-slate-400 block">Status</span>
                  <span className="text-emerald-650 font-bold">ACTIVE</span>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-[10px] text-slate-400 leading-normal">
              💡 <strong>Dynamic Redirect</strong>: You can print this QR code immediately. You can change its destination fields later without reprinting or changing the physical QR image.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
