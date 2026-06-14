'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { QRCodeSVG } from 'qrcode.react';
import { 
  ArrowLeft, 
  Check, 
  Loader2, 
  HelpCircle, 
  Eye, 
  Star 
} from 'lucide-react';
import { toast } from 'react-toastify';
import Link from 'next/link';

export default function CreateReviewQrPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // General Settings
  const [name, setName] = useState('');
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [campaignId, setCampaignId] = useState('');

  // Review System Configurations
  const [businessName, setBusinessName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [publicReviewUrl, setPublicReviewUrl] = useState('');
  const [positiveThreshold, setPositiveThreshold] = useState('4');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [privateFeedbackMessage, setPrivateFeedbackMessage] = useState('');
  const [thankYouMessage, setThankYouMessage] = useState('');

  // Style Customizer
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');

  // UTM tracking
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');

  // Fetch campaigns dropdown list
  useEffect(() => {
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
        console.error('Error fetching campaigns:', error);
      }
    };
    fetchCampaigns();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a name for the review campaign.');
      return;
    }
    if (!businessName.trim()) {
      toast.error('Please enter the business name.');
      return;
    }
    if (!publicReviewUrl.trim()) {
      toast.error('Please enter the public review redirection link.');
      return;
    }

    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Unauthenticated user.');

      const token = await currentUser.getIdToken();

      const destination = {
        businessName,
        logoUrl: logoUrl.trim() || undefined,
        publicReviewUrl: publicReviewUrl.trim(),
        positiveThreshold: parseInt(positiveThreshold, 10),
        welcomeMessage: welcomeMessage.trim() || undefined,
        privateFeedbackMessage: privateFeedbackMessage.trim() || undefined,
        thankYouMessage: thankYouMessage.trim() || undefined
      };

      const res = await fetch('/api/qrs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          type: 'REVIEW',
          destination,
          fgColor,
          bgColor,
          utmSource: utmSource || null,
          utmMedium: utmMedium || null,
          utmCampaign: utmCampaign || null,
          campaignId: campaignId ? parseInt(campaignId, 10) : null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to generate review campaign.');
      }

      toast.success('Review QR Code Campaign generated successfully!');
      router.push('/dashboard/reviews');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to configure review campaign.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header bar */}
      <div className="flex items-center gap-3">
        <Link 
          href="/dashboard/reviews" 
          className="p-2 bg-slate-55 border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-[#001B50] rounded-xl transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-[#001B50]">Configure Review QR Code</h2>
          <p className="text-slate-500 text-xs mt-0.5">Generate a smart redirect system for local ratings collection</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Settings form panel */}
        <form onSubmit={handleCreate} className="lg:col-span-8 bg-white border border-slate-200 p-6 md:p-8 rounded-2xl space-y-6 shadow-sm">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Campaign Name */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-655 uppercase tracking-wide">Campaign Name</label>
              <input
                type="text"
                placeholder="e.g. Noida Outlet Table Feedback"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-3 px-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all"
                required
              />
            </div>

            {/* Campaign Group */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-655 uppercase tracking-wide">Link to Campaign Group (Optional)</label>
              <select
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-primary rounded-xl py-3 px-4 text-sm text-slate-700 outline-none cursor-pointer transition-all"
              >
                <option value="">None (Stand-alone campaign)</option>
                {campaigns.map((camp) => (
                  <option key={camp.id} value={camp.id}>{camp.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Business Core Setup */}
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200/60 space-y-4">
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Review Destination Setup</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Business Name</label>
                <input
                  type="text"
                  placeholder="e.g. Burger Junction Noida"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-primary rounded-lg py-2.5 px-3 text-xs text-slate-800 outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Logo Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-primary rounded-lg py-2.5 px-3 text-xs text-slate-800 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-500 uppercase flex items-center gap-1">
                  Public Review Redirect Link (Google Maps / Yelp)
                  <span className="cursor-help" title="Positive ratings matching or exceeding threshold will automatically redirect to this URL.">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  </span>
                </label>
                <input
                  type="url"
                  placeholder="e.g. https://g.page/r/your-google-review-link"
                  value={publicReviewUrl}
                  onChange={(e) => setPublicReviewUrl(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-primary rounded-lg py-2.5 px-3 text-xs text-slate-800 outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-500 uppercase flex items-center gap-1">
                  Positive Rating Threshold
                  <span className="cursor-help" title="Score required to redirect user to Google. Lower ratings go to negative private feedback.">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  </span>
                </label>
                <select
                  value={positiveThreshold}
                  onChange={(e) => setPositiveThreshold(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-primary rounded-lg py-2.5 px-3 text-xs text-slate-700 outline-none cursor-pointer transition-all"
                >
                  <option value="5">5 Stars only</option>
                  <option value="4">4 Stars or more</option>
                  <option value="3">3 Stars or more</option>
                </select>
              </div>
            </div>
          </div>

          {/* Custom Messaging setup */}
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200/60 space-y-4">
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Custom Message Screen (Optional)</h4>
            
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Welcome Greeting Message</label>
                <input
                  type="text"
                  placeholder="Default: How was your experience with us?"
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-primary rounded-lg py-2 px-3 text-xs text-slate-800 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Negative Feedback Prompt Helper</label>
                <input
                  type="text"
                  placeholder="Default: We are sorry to hear that. How can we improve?"
                  value={privateFeedbackMessage}
                  onChange={(e) => setPrivateFeedbackMessage(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-primary rounded-lg py-2 px-3 text-xs text-slate-800 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Thank You Note</label>
                <input
                  type="text"
                  placeholder="Default: Thank you for your feedback! Your review helps us grow."
                  value={thankYouMessage}
                  onChange={(e) => setThankYouMessage(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-primary rounded-lg py-2 px-3 text-xs text-slate-800 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Color pickers */}
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

          {/* UTM Parameters */}
          <div className="bg-slate-50/50 p-6 rounded-xl border border-slate-200/60 space-y-4">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-655 uppercase tracking-wide">UTM Attributes (Optional)</span>
              <span className="cursor-help" title="Used to track campaign referrals in analytics.">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-500 uppercase">UTM Source</label>
                <input
                  type="text"
                  placeholder="e.g. restaurant_table"
                  value={utmSource}
                  onChange={(e) => setUtmSource(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-primary rounded-lg py-2 px-3 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-500 uppercase">UTM Medium</label>
                <input
                  type="text"
                  placeholder="e.g. print_sticker"
                  value={utmMedium}
                  onChange={(e) => setUtmMedium(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-primary rounded-lg py-2 px-3 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-500 uppercase">UTM Campaign</label>
                <input
                  type="text"
                  placeholder="e.g. table_reviews_2026"
                  value={utmCampaign}
                  onChange={(e) => setUtmCampaign(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-primary rounded-lg py-2 px-3 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all"
                />
              </div>
            </div>
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
                  <span>Generate Review QR</span>
                </>
              )}
            </button>
            <Link
              href="/dashboard/reviews"
              className="flex-grow border border-slate-200 hover:bg-slate-100 text-slate-655 py-3 px-4 rounded-xl text-sm font-semibold text-center transition-all cursor-pointer bg-white"
            >
              Cancel
            </Link>
          </div>
        </form>

        {/* Live design preview */}
        <div className="lg:col-span-4 bg-white border border-slate-200 shadow-sm p-6 rounded-2xl space-y-6 lg:sticky lg:top-24">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Eye className="w-4 h-4 text-primary animate-pulse" />
            <h3 className="text-sm font-semibold text-[#001B50]">Live QR Design Preview</h3>
          </div>

          <div className="bg-white p-6 rounded-xl flex items-center justify-center border border-slate-200 shadow-md aspect-square max-w-[200px] mx-auto transition-transform hover:scale-102 animate-fade-in">
            <QRCodeSVG
              value="https://qrjunction.in/q/preview-review"
              size={150}
              fgColor={fgColor}
              bgColor={bgColor}
              level="M"
            />
          </div>

          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5 text-slate-500">
              <div>
                <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-0.5">Campaign Name</span>
                <span className="text-slate-800 font-semibold truncate block">{name || 'Unnamed Review Campaign'}</span>
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-0.5">Business Details</span>
                <span className="text-slate-800 font-semibold truncate block">{businessName || 'Business Name not specified'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-slate-200 pt-2">
                <div>
                  <span className="text-[10px] font-semibold uppercase text-slate-400 block">Threshold</span>
                  <span className="text-[#d97706] font-bold uppercase flex items-center gap-0.5">
                    {positiveThreshold} <Star className="w-3 h-3 fill-current inline-block" /> +
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase text-slate-400 block">QR Type</span>
                  <span className="text-primary font-bold">REVIEW CAMPAIGN</span>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-[10px] text-slate-400 leading-normal">
              💡 <strong>Smart Routing</strong>: Ratings under the threshold score will present a local feedback form, logging reviews privately in your dashboard without impacting your public store rating.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
