'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { auth } from '@/lib/firebase';
import { 
  Save, 
  Building2, 
  User as UserIcon, 
  Globe, 
  Phone, 
  MapPin, 
  Briefcase, 
  Image as ImageIcon,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'react-toastify';

interface ProfileData {
  type: 'INDIVIDUAL' | 'BUSINESS';
  businessName: string;
  industry: string;
  website: string;
  phone: string;
  address: string;
  about: string;
  logoUrl: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [data, setData] = useState<ProfileData>({
    type: 'INDIVIDUAL',
    businessName: '',
    industry: '',
    website: '',
    phone: '',
    address: '',
    about: '',
    logoUrl: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const currentUser = auth.currentUser;
        const token = await currentUser?.getIdToken();
        const res = await fetch('/api/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (res.ok) {
          const json = await res.json();
          if (json.profile) {
            setData(prev => ({ ...prev, ...json.profile }));
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const currentUser = auth.currentUser;
      const token = await currentUser?.getIdToken();
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) throw new Error('Failed to update profile');
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Could not save profile details.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#001B50] mb-2">My Profile</h1>
        <p className="text-slate-600">Manage your account details and business context.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Account Details (Readonly) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-[#001B50] mb-4 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-primary" />
              Account Details
            </h3>
            <div className="flex flex-col items-center mb-6 pt-2 relative group cursor-pointer">
              <input 
                type="file" 
                accept="image/png, image/jpeg, image/svg+xml"
                className="hidden" 
                id="avatar-upload"
                disabled={uploadingAvatar}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  if (file.size > 1024 * 1024) {
                    toast.error("Please upload an image smaller than 1MB.");
                    return;
                  }

                  setUploadingAvatar(true);
                  try {
                    const uploadData = new FormData();
                    uploadData.append('file', file);
                    const res = await fetch('/api/upload', {
                      method: 'POST',
                      body: uploadData
                    });
                    if (!res.ok) throw new Error('Upload failed');
                    const json = await res.json();
                    if (!json.success) throw new Error(json.error || 'Upload failed');
                    setData(prev => ({ ...prev, logoUrl: json.url }));
                    toast.success('Avatar image uploaded successfully!');
                  } catch (err) {
                    console.error('Avatar upload error:', err);
                    toast.error('Failed to upload avatar.');
                  } finally {
                    setUploadingAvatar(false);
                  }
                }}
              />
              <label htmlFor="avatar-upload" className="cursor-pointer relative rounded-full overflow-hidden mb-3 shadow-md border-4 border-white group-hover:border-primary/50 transition-colors">
                {uploadingAvatar ? (
                  <div className="w-24 h-24 bg-slate-900/10 flex flex-col items-center justify-center">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  </div>
                ) : (data.logoUrl || user?.photoURL) ? (
                  <img src={data.logoUrl || user?.photoURL || ''} alt="Avatar" className="w-24 h-24 object-cover" />
                ) : (
                  <div className="w-24 h-24 bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold">
                    {user?.displayName?.charAt(0) || user?.email?.charAt(0)}
                  </div>
                )}
                {/* Overlay for hover */}
                {!uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ImageIcon className="w-6 h-6 text-white" />
                  </div>
                )}
              </label>
              
              <p className="font-bold text-slate-800 text-lg">{user?.displayName || 'User'}</p>
              <label htmlFor="avatar-upload" className="text-xs text-primary font-semibold mt-1 cursor-pointer hover:underline">
                Change Picture
              </label>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-3 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold border border-emerald-100">
                <CheckCircle2 className="w-3 h-3" />
                Verified
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</label>
                <p className="text-slate-800 mt-1 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100 text-sm truncate">{user?.email}</p>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Your email is managed by your sign-in provider. Profile details below will help us customize your dashboard experience.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-[#001B50] text-lg">Profile Configuration</h3>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Type Toggle */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Account Type</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setData(prev => ({ ...prev, type: 'INDIVIDUAL' }))}
                    className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all ${
                      data.type === 'INDIVIDUAL' 
                        ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary/20' 
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <UserIcon className="w-4 h-4" />
                    Individual
                  </button>
                  <button
                    onClick={() => setData(prev => ({ ...prev, type: 'BUSINESS' }))}
                    className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all ${
                      data.type === 'BUSINESS' 
                        ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary/20' 
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    Business
                  </button>
                </div>
              </div>

              {/* Business Fields */}
              {data.type === 'BUSINESS' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 animate-fade-in">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Business Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        name="businessName"
                        value={data.businessName || ''}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                        placeholder="e.g. Acme Corp"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Industry</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select 
                        name="industry"
                        value={data.industry || ''}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm appearance-none"
                      >
                        <option value="">Select Industry</option>
                        <option value="Retail">Retail & E-commerce</option>
                        <option value="Technology">Technology & Software</option>
                        <option value="Real Estate">Real Estate</option>
                        <option value="Food & Beverage">Food & Beverage</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Education">Education</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Website</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="url" 
                        name="website"
                        value={data.website || ''}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Common Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Contact Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="tel" 
                      name="phone"
                      value={data.phone || ''}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Location / Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      name="address"
                      value={data.address || ''}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">About</label>
                  <textarea 
                    name="about"
                    value={data.about || ''}
                    onChange={handleChange}
                    rows={4}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm resize-none"
                    placeholder={`Tell us a bit about ${data.type === 'BUSINESS' ? 'your business' : 'yourself'}...`}
                  />
                </div>
              </div>

            </div>
            
            {/* Footer Action */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="bg-primary hover:bg-[#00143c] text-white px-8 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-70"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
