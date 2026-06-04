'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Loader2,
  Sparkles,
  Link2,
  Instagram, 
  Facebook, 
  Linkedin, 
  Twitter, 
  MessageCircle, 
  Phone, 
  Mail,
  Palette,
  ExternalLink,
  Laptop
} from 'lucide-react';
import { toast } from 'react-toastify';
import Link from 'next/link';

interface LandingPageBuilderProps {
  pageId?: number; // optional, provided in Edit Mode
}

interface ButtonItem {
  id: string;
  label: string;
  url: string;
  order: number;
}

export default function LandingPageBuilder({ pageId }: LandingPageBuilderProps) {
  const router = useRouter();
  const isEditMode = !!pageId;

  // Data Loading/Saving States
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);

  // Form State variables
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [theme, setTheme] = useState('dark');
  const [profileName, setProfileName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Social Links State variables
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [twitter, setTwitter] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');

  // Custom Buttons State
  const [buttons, setButtons] = useState<ButtonItem[]>([]);
  const [newBtnLabel, setNewBtnLabel] = useState('');
  const [newBtnUrl, setNewBtnUrl] = useState('');

  // Load page data (Edit Mode)
  useEffect(() => {
    if (!isEditMode) return;

    const fetchPageData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const token = await currentUser.getIdToken();
        const res = await fetch(`/api/landing-pages/${pageId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Failed to load page configurations.');
        const data = await res.json();
        const page = data.landingPage;

        setTitle(page.title);
        setSlug(page.slug);
        setTheme(page.theme);
        setProfileName(page.profileName || '');
        setBio(page.bio || '');
        setAvatarUrl(page.avatarUrl || '');

        const socials = typeof page.socialLinks === 'string' ? JSON.parse(page.socialLinks) : (page.socialLinks || {});
        setInstagram(socials.instagram || '');
        setFacebook(socials.facebook || '');
        setLinkedin(socials.linkedin || '');
        setTwitter(socials.twitter || '');
        setWhatsapp(socials.whatsapp || '');
        setPhoneNumber(socials.phone || '');
        setEmailAddress(socials.email || '');

        const btns = typeof page.buttons === 'string' ? JSON.parse(page.buttons) : (page.buttons || []);
        setButtons(Array.isArray(btns) ? btns : []);

      } catch (err) {
        console.error(err);
        toast.error('Failed to load landing page data.');
        router.push('/dashboard/pages');
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [pageId, isEditMode, router]);

  // Button management
  const handleAddButton = () => {
    if (!newBtnLabel.trim() || !newBtnUrl.trim()) {
      toast.error('Button Label and Link URL are both required.');
      return;
    }

    let url = newBtnUrl.trim();
    if (!/^https?:\/\//i.test(url) && !url.startsWith('mailto:') && !url.startsWith('tel:')) {
      url = `https://${url}`;
    }

    const newBtn: ButtonItem = {
      id: `btn_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`,
      label: newBtnLabel.trim(),
      url,
      order: buttons.length,
    };

    setButtons(prev => [...prev, newBtn]);
    setNewBtnLabel('');
    setNewBtnUrl('');
  };

  const handleRemoveButton = (id: string) => {
    setButtons(prev => prev.filter(btn => btn.id !== id).map((btn, idx) => ({ ...btn, order: idx })));
  };

  const handleMoveButton = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === buttons.length - 1) return;

    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...buttons];
    
    // Swap items
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    // Recalculate order indices
    const finalized = updated.map((btn, idx) => ({ ...btn, order: idx }));
    setButtons(finalized);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Title is required.');
      return;
    }

    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    if (!cleanSlug) {
      toast.error('Please enter a valid page URL slug.');
      return;
    }

    setSaving(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Unauthenticated user.');

      const token = await currentUser.getIdToken();
      const endpoint = isEditMode ? `/api/landing-pages/${pageId}` : '/api/landing-pages';
      const method = isEditMode ? 'PUT' : 'POST';

      const socialLinks = {
        instagram: instagram.trim() || null,
        facebook: facebook.trim() || null,
        linkedin: linkedin.trim() || null,
        twitter: twitter.trim() || null,
        whatsapp: whatsapp.trim() || null,
        phone: phoneNumber.trim() || null,
        email: emailAddress.trim() || null,
      };

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          slug: cleanSlug,
          theme,
          profileName: profileName.trim() || title.trim(),
          bio: bio.trim() || null,
          avatarUrl: avatarUrl.trim() || null,
          socialLinks,
          buttons,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save page.');
      }

      toast.success(isEditMode ? 'Landing page updated!' : 'Landing page created successfully!');
      router.push('/dashboard/pages');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to save landing page.');
    } finally {
      setSaving(false);
    }
  };

  // Mock phone renderer helpers
  const themeClasses: { [key: string]: { wrapper: string; text: string; subtext: string; btn: string; social: string } } = {
    dark: {
      wrapper: 'bg-[#0a0f1d] text-white',
      text: 'text-white',
      subtext: 'text-slate-400',
      btn: 'bg-slate-900 border border-slate-800 text-white',
      social: 'bg-slate-900 text-slate-300 border border-slate-800'
    },
    light: {
      wrapper: 'bg-slate-50 text-slate-800',
      text: 'text-slate-900',
      subtext: 'text-slate-500',
      btn: 'bg-white border border-slate-200 text-slate-800 shadow-sm',
      social: 'bg-white text-slate-650 border border-slate-200 shadow-xs'
    },
    sunset: {
      wrapper: 'bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 text-white',
      text: 'text-white',
      subtext: 'text-orange-50',
      btn: 'bg-white/10 border border-white/20 text-white',
      social: 'bg-white/10 text-white border border-white/20'
    },
    ocean: {
      wrapper: 'bg-gradient-to-br from-blue-900 via-indigo-950 to-teal-900 text-white',
      text: 'text-white',
      subtext: 'text-blue-200',
      btn: 'bg-white/5 border border-white/10 text-white',
      social: 'bg-white/5 text-white border border-white/10'
    },
    glassmorphism: {
      wrapper: 'bg-gradient-to-tr from-violet-950 via-[#0a051d] to-indigo-950 text-white',
      text: 'text-white',
      subtext: 'text-slate-350',
      btn: 'bg-white/10 border border-white/20 text-white',
      social: 'bg-white/10 text-white border border-white/10'
    }
  };

  const activeTheme = themeClasses[theme] || themeClasses.dark;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-slate-400 text-sm">Loading visual editor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard/pages" 
            className="p-2 bg-slate-55 border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-[#001B50] rounded-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-[#001B50]">{isEditMode ? 'Edit Landing Page' : 'Create Landing Page'}</h2>
            <p className="text-slate-500 text-xs mt-0.5">Design a custom mobile-first digital profile</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white py-2.5 px-5 rounded-xl text-xs font-semibold cursor-pointer active:scale-95 transition-all shadow-primary disabled:opacity-50 border-none"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{isEditMode ? 'Save Details' : 'Publish Page'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Builder Controls */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSave} className="bg-white border border-slate-200 p-6 md:p-8 rounded-2xl space-y-6 shadow-sm">
            
            {/* Base Settings Panel */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-slate-200/80 pb-2 flex items-center gap-1.5">
                <Palette className="w-4 h-4" />
                <span>Base Settings &amp; Theme</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 block">Page Title (Admin name)</label>
                  <input
                    type="text"
                    placeholder="e.g. Jane Doe Portfolio"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-55 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-2.5 px-4 text-xs text-slate-800 outline-none placeholder-slate-400 transition-all"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 block">URL Path Slug (Unique)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-450 font-mono">/p/</span>
                    <input
                      type="text"
                      placeholder="e.g. janedoe"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full bg-slate-55 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-2.5 pl-8 pr-4 text-xs text-slate-800 outline-none placeholder-slate-400 font-mono transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Theme Selector */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-slate-600 block">Visual Background Theme</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {Object.keys(themeClasses).map((themeKey) => (
                    <button
                      key={themeKey}
                      type="button"
                      onClick={() => setTheme(themeKey)}
                      className={`py-2 px-3 text-center border rounded-xl text-[10px] uppercase font-bold tracking-wide transition-all cursor-pointer ${
                        theme === themeKey 
                          ? 'bg-primary/10 border-primary text-primary font-semibold' 
                          : 'bg-slate-50 border border-slate-200 text-slate-500 hover:text-[#001B50] hover:bg-slate-100'
                      }`}
                    >
                      {themeKey === 'glassmorphism' ? 'Glass' : themeKey}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Profile Configurations */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-slate-200/80 pb-2">
                Profile Configuration
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 block">Display Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Jane Doe"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-slate-55 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-2.5 px-4 text-xs text-slate-800 outline-none placeholder-slate-400 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 block">Avatar Image URL</label>
                  <input
                    type="text"
                    placeholder="Paste direct HTTPS link to image..."
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full bg-slate-55 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-2.5 px-4 text-xs text-slate-800 outline-none placeholder-slate-400 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 block">Short Bio (Headline description)</label>
                <textarea
                  placeholder="Tell your audience about yourself or list services..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-55 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-2.5 px-4 text-xs text-slate-800 outline-none placeholder-slate-400 transition-all resize-none"
                />
              </div>
            </div>

            {/* Social Links Panel */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-slate-200/80 pb-2">
                Social Link Accounts
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase flex items-center gap-1.5">
                    <Instagram className="w-3.5 h-3.5 text-slate-500" />
                    <span>Instagram Profile URL</span>
                  </label>
                  <input
                    type="text"
                    placeholder="https://instagram.com/username"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="w-full bg-slate-55 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-2 px-3 text-xs text-slate-800 outline-none placeholder-slate-400 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase flex items-center gap-1.5">
                    <Facebook className="w-3.5 h-3.5 text-slate-500" />
                    <span>Facebook Profile URL</span>
                  </label>
                  <input
                    type="text"
                    placeholder="https://facebook.com/username"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    className="w-full bg-slate-55 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-2 px-3 text-xs text-slate-800 outline-none placeholder-slate-400 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase flex items-center gap-1.5">
                    <Linkedin className="w-3.5 h-3.5 text-slate-500" />
                    <span>LinkedIn Profile URL</span>
                  </label>
                  <input
                    type="text"
                    placeholder="https://linkedin.com/in/username"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="w-full bg-slate-55 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-2 px-3 text-xs text-slate-800 outline-none placeholder-slate-400 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase flex items-center gap-1.5">
                    <Twitter className="w-3.5 h-3.5 text-slate-500" />
                    <span>X (Twitter) Profile URL</span>
                  </label>
                  <input
                    type="text"
                    placeholder="https://twitter.com/username"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    className="w-full bg-slate-55 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-2 px-3 text-xs text-slate-800 outline-none placeholder-slate-400 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-slate-500" />
                    <span>WhatsApp (Phone + Country code)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 919876543210"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-slate-55 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-2 px-3 text-xs text-slate-800 outline-none placeholder-slate-400 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>Phone Number Dialer</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +1234567890"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-slate-55 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-2 px-3 text-xs text-slate-800 outline-none placeholder-slate-400 transition-all"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. business@domain.com"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    className="w-full bg-slate-55 border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-2 px-3 text-xs text-slate-800 outline-none placeholder-slate-400 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Custom Link Buttons Panel */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-slate-200/80 pb-2">
                Custom Links &amp; Buttons
              </h3>

              {/* Add Link Widget */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Button Label (e.g. Book Consultation)"
                    value={newBtnLabel}
                    onChange={(e) => setNewBtnLabel(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 outline-none placeholder-slate-400 focus:border-primary transition-all"
                  />
                  <input
                    type="text"
                    placeholder="Target Link URL (e.g. calendly.com/jane)"
                    value={newBtnUrl}
                    onChange={(e) => setNewBtnUrl(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 outline-none placeholder-slate-400 focus:border-primary transition-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddButton}
                  className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Link Button</span>
                </button>
              </div>

              {/* Buttons Stack */}
              {buttons.length === 0 ? (
                <p className="text-slate-400 text-xs italic">No custom buttons added. Visitors will only see social icons.</p>
              ) : (
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {buttons.map((btn, index) => (
                    <div 
                      key={btn.id}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 truncate">{btn.label}</p>
                        <p className="text-[10px] text-slate-400 truncate font-mono">{btn.url}</p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveButton(index, 'up')}
                          disabled={index === 0}
                          className="p-1 hover:bg-slate-200 text-slate-500 hover:text-slate-700 disabled:opacity-30 rounded cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveButton(index, 'down')}
                          disabled={index === buttons.length - 1}
                          className="p-1 hover:bg-slate-200 text-slate-500 hover:text-slate-700 disabled:opacity-30 rounded cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveButton(btn.id)}
                          className="p-1 hover:bg-slate-200 text-slate-500 hover:text-red-650 rounded cursor-pointer ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </form>
        </div>

        {/* Right Side: Phone Simulator Preview */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 flex flex-col items-center">
          
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase tracking-wider mb-3">
            <Laptop className="w-4 h-4 text-primary" />
            <span>Interactive Mobile Preview</span>
          </div>

          {/* Simulator Chassis */}
          <div className="w-[290px] h-[580px] border-[8px] border-slate-900 rounded-[44px] bg-slate-950 shadow-2xl relative overflow-hidden flex flex-col justify-start p-1.5 shadow-primary/5">
            {/* Top Notch speaker */}
            <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-slate-900 rounded-full z-20 flex items-center justify-center">
              <div className="w-10 h-1 bg-black/60 rounded-full" />
            </div>

            {/* Inner viewport screen wrapper */}
            <div className={`w-full h-full rounded-[34px] overflow-hidden ${activeTheme.wrapper} p-5 flex flex-col justify-between select-none`}>
              
              {/* Dynamic Header details */}
              <div className="flex flex-col items-center text-center space-y-4 pt-8">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Mock Avatar" 
                    className="w-16 h-16 rounded-full object-cover border border-white/20 shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/20 border border-dashed border-white/20 flex items-center justify-center text-lg font-bold text-white shadow-inner">
                    {profileName ? profileName.charAt(0).toUpperCase() : title ? title.charAt(0).toUpperCase() : '?'}
                  </div>
                )}

                <div className="space-y-1 w-full">
                  <p className={`text-sm font-bold truncate px-2 ${activeTheme.text}`}>
                    {profileName || title || 'Placeholder Name'}
                  </p>
                  <p className={`text-[10px] leading-relaxed line-clamp-3 px-3 mt-1 ${activeTheme.subtext}`}>
                    {bio || 'Create a custom short bio showing details about your business offerings.'}
                  </p>
                </div>
              </div>

              {/* Social icons row mock */}
              <div className="flex flex-wrap justify-center gap-2 max-w-[200px] mx-auto py-1">
                {instagram && <span className={`p-2 rounded-full text-xs ${activeTheme.social}`}><Instagram className="w-4 h-4" /></span>}
                {facebook && <span className={`p-2 rounded-full text-xs ${activeTheme.social}`}><Facebook className="w-4 h-4" /></span>}
                {linkedin && <span className={`p-2 rounded-full text-xs ${activeTheme.social}`}><Linkedin className="w-4 h-4" /></span>}
                {twitter && <span className={`p-2 rounded-full text-xs ${activeTheme.social}`}><Twitter className="w-4 h-4" /></span>}
                {whatsapp && <span className={`p-2 rounded-full text-xs ${activeTheme.social}`}><MessageCircle className="w-4 h-4" /></span>}
                {phoneNumber && <span className={`p-2 rounded-full text-xs ${activeTheme.social}`}><Phone className="w-4 h-4" /></span>}
                {emailAddress && <span className={`p-2 rounded-full text-xs ${activeTheme.social}`}><Mail className="w-4 h-4" /></span>}
                {!instagram && !facebook && !linkedin && !twitter && !whatsapp && !phoneNumber && !emailAddress && (
                  <span className="text-[9px] text-slate-500">Links will show here</span>
                )}
              </div>

              {/* Buttons list mock */}
              <div className="space-y-2 flex-1 mt-4 overflow-y-auto max-h-[160px] pr-0.5">
                {buttons.length === 0 ? (
                  <div className={`py-4 rounded-xl border border-dashed border-white/10 text-[9px] text-center ${activeTheme.subtext} font-medium px-2`}>
                    Dynamic link buttons will be displayed in vertical order.
                  </div>
                ) : (
                  buttons.map(btn => (
                    <div
                      key={btn.id}
                      className={`w-full py-2.5 px-3.5 rounded-xl flex items-center justify-between text-[10px] font-semibold ${activeTheme.btn}`}
                    >
                      <span className="truncate max-w-[150px]">{btn.label}</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </div>
                  ))
                )}
              </div>

              {/* Mock Lead Form */}
              <div className="border-t border-white/10 pt-3 mt-4 space-y-1.5">
                <p className={`text-[9px] font-bold uppercase tracking-wider block text-center ${activeTheme.text}`}>Connect With Us</p>
                <div className="space-y-1.5">
                  <div className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-[9px] text-slate-500">Your Name</div>
                  <div className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-[9px] text-slate-500">Email Address</div>
                </div>
                <div className="w-full py-2 bg-primary text-white text-[9px] rounded-lg font-bold text-center">Subscribe Details</div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
