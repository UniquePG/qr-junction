'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { auth } from '@/lib/firebase';
import { 
  Save, 
  Store, 
  Image as ImageIcon,
  Loader2,
  DollarSign,
  Percent,
  FileText
} from 'lucide-react';
import { toast } from 'react-toastify';

interface RestaurantData {
  name: string;
  description: string;
  logoUrl: string;
  coverImage: string;
  currency: string;
  taxRate: number;
  taxName: string;
}

export default function RestaurantProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [data, setData] = useState<RestaurantData>({
    name: '',
    description: '',
    logoUrl: '',
    coverImage: '',
    currency: 'INR',
    taxRate: 0,
    taxName: 'GST'
  });

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const currentUser = auth.currentUser;
        const token = await currentUser?.getIdToken();
        const res = await fetch('/api/restaurant/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (res.ok) {
          const json = await res.json();
          if (json.restaurant) {
            setData({
              name: json.restaurant.name || '',
              description: json.restaurant.description || '',
              logoUrl: json.restaurant.logoUrl || '',
              coverImage: json.restaurant.coverImage || '',
              currency: json.restaurant.currency || 'INR',
              taxRate: Number(json.restaurant.taxRate) || 0,
              taxName: json.restaurant.taxName || 'GST'
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch restaurant profile', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchRestaurant();
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ 
      ...prev, 
      [name]: name === 'taxRate' ? Number(value) : value 
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'coverImage') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Please upload an image smaller than 2MB.");
      return;
    }

    if (field === 'logoUrl') setUploadingLogo(true);
    else setUploadingCover(true);

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
      setData(prev => ({ ...prev, [field]: json.url }));
      toast.success(`${field === 'logoUrl' ? 'Logo' : 'Cover image'} uploaded successfully!`);
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Failed to upload image.');
    } finally {
      if (field === 'logoUrl') setUploadingLogo(false);
      else setUploadingCover(false);
    }
  };

  const handleSave = async () => {
    if (!data.name.trim()) {
      toast.error('Restaurant Name is required.');
      return;
    }

    setSaving(true);
    try {
      const currentUser = auth.currentUser;
      const token = await currentUser?.getIdToken();
      const res = await fetch('/api/restaurant/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) throw new Error('Failed to update restaurant profile');
      toast.success('Restaurant profile saved successfully!');
    } catch (error) {
      toast.error('Could not save details.');
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#001B50] mb-2">Profile Settings</h1>
        <p className="text-slate-600 font-sans">Set up your brand identity, contact info, and tax configurations.</p>
      </div>

      <div className="space-y-6">
        {/* Cover & Logo Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
          {/* Cover image */}
          <div className="h-48 w-full bg-slate-100 relative group">
            {data.coverImage ? (
              <img src={data.coverImage} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                <ImageIcon className="w-10 h-10" />
              </div>
            )}
            <input 
              type="file" 
              accept="image/*"
              id="cover-upload" 
              className="hidden" 
              onChange={(e) => handleFileUpload(e, 'coverImage')}
              disabled={uploadingCover}
            />
            <label 
              htmlFor="cover-upload" 
              className="absolute right-4 bottom-4 bg-white/90 backdrop-blur-md hover:bg-white text-slate-800 text-xs font-semibold py-2 px-3 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 shadow-sm"
            >
              {uploadingCover ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
              Update Cover Image
            </label>
          </div>

          {/* Logo overlay */}
          <div className="px-6 pb-6 pt-16 relative flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="absolute -top-12 left-6 relative">
              <input 
                type="file" 
                accept="image/*" 
                id="logo-upload" 
                className="hidden" 
                onChange={(e) => handleFileUpload(e, 'logoUrl')}
                disabled={uploadingLogo}
              />
              <label 
                htmlFor="logo-upload" 
                className="cursor-pointer relative block w-24 h-24 rounded-2xl border-4 border-white bg-slate-50 overflow-hidden shadow-md group"
              >
                {uploadingLogo ? (
                  <div className="w-full h-full flex items-center justify-center bg-white">
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  </div>
                ) : data.logoUrl ? (
                  <img src={data.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50">
                    <Store className="w-8 h-8" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ImageIcon className="w-5 h-5 text-white" />
                </div>
              </label>
            </div>

            <div className="flex-1 md:pl-28 -mt-12 md:mt-0">
              <h2 className="text-xl font-bold text-[#001B50]">{data.name || 'Unnamed Restaurant'}</h2>
              <p className="text-sm text-slate-500">Configure your restaurant identity card.</p>
            </div>
          </div>
        </div>

        {/* Basic Brand Settings */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <h3 className="font-bold text-[#001B50] text-lg flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" />
            General Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Restaurant Name</label>
              <input 
                type="text" 
                name="name"
                value={data.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-sans"
                placeholder="e.g. Royal Taste Bistro"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description / Tagline</label>
              <textarea 
                name="description"
                value={data.description}
                onChange={handleChange}
                rows={3}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-sans resize-none"
                placeholder="Brief intro displayed to customers at the top of your digital menu page..."
              />
            </div>
          </div>
        </div>

        {/* Financials & Taxes */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <h3 className="font-bold text-[#001B50] text-lg flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Currency & Taxes Setup
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Currency</label>
              <select 
                name="currency"
                value={data.currency}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-sans"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="AED">AED (د.إ)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tax Name</label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  name="taxName"
                  value={data.taxName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-sans"
                  placeholder="e.g. GST, VAT, Service Tax"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tax Percentage (%)</label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="number" 
                  name="taxRate"
                  value={data.taxRate}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-sans"
                  placeholder="e.g. 5.00"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end pt-4">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-primary hover:bg-[#00143c] text-white px-10 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-70 cursor-pointer animate-pulse-slow"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Profile Settings
          </button>
        </div>
      </div>
    </div>
  );
}
