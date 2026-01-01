'use client';

import QRCode from 'qrcode';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import {
  trackQRCodeGeneration,
  trackQRCodeDownload,
  trackTabSwitch,
  trackError,
  type QRCodeType,
} from '@/lib/analytics';

type TabType = 
  | 'url' 
  | 'text' 
  | 'instagram' 
  | 'facebook' 
  | 'whatsapp' 
  | 'linkedin' 
  | 'telegram' 
  | 'snapchat' 
  | 'twitter' 
  | 'contact' 
  | 'phone' 
  | 'sms' 
  | 'email' 
  | 'wifi';

interface FormData {
  url?: string;
  text?: string;
  instagram?: string;
  facebook?: string;
  whatsapp?: { number: string; message: string };
  linkedin?: { type: 'profile' | 'company'; username: string };
  telegram?: { type: 'user' | 'group' | 'channel'; username: string };
  snapchat?: string;
  twitter?: string;
  contact?: {
    name: string;
    phone: string;
    email: string;
    address: string;
    website: string;
  };
  phone?: string;
  sms?: { number: string; message: string };
  email?: { address: string; subject: string; body: string };
  wifi?: { ssid: string; password: string; encryption: string; hidden: boolean };
}

export default function QRGenerator() {
  const [activeTab, setActiveTab] = useState<TabType>('url');
  const [formData, setFormData] = useState<FormData>({});
  const [qrValue, setQrValue] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [size, setSize] = useState<number>(200);

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'url', label: 'URL', icon: 'fas fa-link' },
    { id: 'text', label: 'Text', icon: 'fas fa-font' },
    { id: 'instagram', label: 'Instagram', icon: 'fab fa-instagram' },
    { id: 'facebook', label: 'Facebook', icon: 'fab fa-facebook' },
    { id: 'whatsapp', label: 'WhatsApp', icon: 'fab fa-whatsapp' },
    { id: 'linkedin', label: 'LinkedIn', icon: 'fab fa-linkedin' },
    { id: 'telegram', label: 'Telegram', icon: 'fab fa-telegram' },
    { id: 'snapchat', label: 'Snapchat', icon: 'fab fa-snapchat' },
    { id: 'twitter', label: 'Twitter', icon: 'fab fa-twitter' },
    { id: 'contact', label: 'Contact', icon: 'fas fa-address-card' },
    { id: 'phone', label: 'Phone', icon: 'fas fa-phone' },
    { id: 'sms', label: 'SMS', icon: 'fas fa-sms' },
    { id: 'email', label: 'Email', icon: 'fas fa-envelope' },
    { id: 'wifi', label: 'WiFi', icon: 'fas fa-wifi' },
  ];

  const formatQRData = (tab: TabType, data: FormData): string => {
    switch (tab) {
      case 'url':
        return data.url || '';
      case 'text':
        return data.text || '';
      case 'instagram':
        return `https://www.instagram.com/${data.instagram || ''}`;
      case 'facebook':
        return `https://www.facebook.com/${data.facebook || ''}`;
      case 'whatsapp':
        const whatsappData = data.whatsapp || { number: '', message: '' };
        const number = (whatsappData.number || '').replace(/\+/g, '').replace(/\s/g, '');
        return `https://wa.me/${number}${whatsappData.message ? `?text=${encodeURIComponent(whatsappData.message)}` : ''}`;
      case 'linkedin':
        const linkedinData = data.linkedin || { type: 'profile', username: '' };
        if (linkedinData.type === 'profile') {
          return `https://www.linkedin.com/in/${linkedinData.username}`;
        }
        return `https://www.linkedin.com/company/${linkedinData.username}`;
      case 'telegram':
        const telegramData = data.telegram || { type: 'user', username: '' };
        if (telegramData.type === 'user') {
          return `https://t.me/${telegramData.username}`;
        } else if (telegramData.type === 'group') {
          return `https://t.me/joinchat/${telegramData.username}`;
        } else if (telegramData.type === 'channel') {
          return `https://t.me/s/${telegramData.username}`;
        }
        return '';
      case 'snapchat':
        return `https://www.snapchat.com/add/${data.snapchat || ''}`;
      case 'twitter':
        return `https://twitter.com/${data.twitter || ''}`;
      case 'contact':
        const contactData = data.contact || { name: '', phone: '', email: '', address: '', website: '' };
        let vcard = 'BEGIN:VCARD\nVERSION:3.0\n';
        if (contactData.name) vcard += `FN:${contactData.name}\n`;
        if (contactData.phone) vcard += `TEL:${contactData.phone}\n`;
        if (contactData.email) vcard += `EMAIL:${contactData.email}\n`;
        if (contactData.address) vcard += `ADR:;;${contactData.address};;;\n`;
        if (contactData.website) vcard += `URL:${contactData.website}\n`;
        vcard += 'END:VCARD';
        return vcard;
      case 'phone':
        return `tel:${data.phone || ''}`;
      case 'sms':
        const smsData = data.sms || { number: '', message: '' };
        return `SMSTO:${smsData.number}:${smsData.message}`;
      case 'email':
        const emailData = data.email || { address: '', subject: '', body: '' };
        return `mailto:${emailData.address}?subject=${encodeURIComponent(emailData.subject || '')}&body=${encodeURIComponent(emailData.body || '')}`;
      case 'wifi':
        const wifiData = data.wifi || { ssid: '', password: '', encryption: 'WPA', hidden: false };
        let wifiString = `WIFI:S:${wifiData.ssid};T:${wifiData.encryption};P:${wifiData.password};`;
        if (wifiData.hidden) wifiString += 'H:true;';
        return wifiString + ';';
      default:
        return '';
    }
  };

  const validateForm = (tab: TabType): boolean => {
    switch (tab) {
      case 'url':
        if (!formData.url?.trim()) {
          setError('Please enter a URL');
          return false;
        }
        break;
      case 'text':
        if (!formData.text?.trim()) {
          setError('Please enter some text');
          return false;
        }
        break;
      case 'instagram':
        if (!formData.instagram?.trim()) {
          setError('Please enter an Instagram username');
          return false;
        }
        break;
      case 'facebook':
        if (!formData.facebook?.trim()) {
          setError('Please enter a Facebook username or ID');
          return false;
        }
        break;
      case 'whatsapp':
        if (!formData.whatsapp?.number?.trim()) {
          setError('Please enter a phone number');
          return false;
        }
        break;
      case 'linkedin':
        if (!formData.linkedin?.username?.trim()) {
          setError('Please enter a LinkedIn username or company ID');
          return false;
        }
        break;
      case 'telegram':
        if (!formData.telegram?.username?.trim()) {
          setError('Please enter a Telegram username');
          return false;
        }
        break;
      case 'snapchat':
        if (!formData.snapchat?.trim()) {
          setError('Please enter a Snapchat username');
          return false;
        }
        break;
      case 'twitter':
        if (!formData.twitter?.trim()) {
          setError('Please enter a Twitter username');
          return false;
        }
        break;
      case 'phone':
        if (!formData.phone?.trim()) {
          setError('Please enter a phone number');
          return false;
        }
        break;
      case 'sms':
        if (!formData.sms?.number?.trim()) {
          setError('Please enter a phone number');
          return false;
        }
        break;
      case 'email':
        if (!formData.email?.address?.trim()) {
          setError('Please enter an email address');
          return false;
        }
        break;
      case 'wifi':
        if (!formData.wifi?.ssid?.trim()) {
          setError('Please enter a network name (SSID)');
          return false;
        }
        break;
    }
    return true;
  };

  const handleGenerate = () => {
    setError('');
    if (!validateForm(activeTab)) {
      return;
    }

    const qrData = formatQRData(activeTab, formData);
    setQrValue(qrData);
    
    // Track QR code generation event
    trackQRCodeGeneration(activeTab, size);
  };

  const handleDownload = async () => {
    if (!qrValue) {
      setError('No QR code available to download.');
      return;
    }

    try {
      // Use QRCode library to generate PNG
      const dataUrl = await QRCode.toDataURL(qrValue, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `qrcode-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Track QR code download event
      trackQRCodeDownload(activeTab, size);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download QR code.';
      setError('Failed to download QR code.');
      console.error(err);
      
      // Track error event
      trackError(errorMessage, 'qr_download');
    }
  };

  const updateFormData = (field: string, value: string | boolean) => {
    if (activeTab === 'whatsapp') {
      setFormData(prev => ({
        ...prev,
        whatsapp: { ...prev.whatsapp, [field]: value } as FormData['whatsapp'],
      }));
    } else if (activeTab === 'linkedin') {
      setFormData(prev => ({
        ...prev,
        linkedin: { ...prev.linkedin, [field]: value } as FormData['linkedin'],
      }));
    } else if (activeTab === 'telegram') {
      setFormData(prev => ({
        ...prev,
        telegram: { ...prev.telegram, [field]: value } as FormData['telegram'],
      }));
    } else if (activeTab === 'contact') {
      setFormData(prev => ({
        ...prev,
        contact: { ...prev.contact, [field]: value } as FormData['contact'],
      }));
    } else if (activeTab === 'sms') {
      setFormData(prev => ({
        ...prev,
        sms: { ...prev.sms, [field]: value } as FormData['sms'],
      }));
    } else if (activeTab === 'email') {
      setFormData(prev => ({
        ...prev,
        email: { ...prev.email, [field]: value } as FormData['email'],
      }));
    } else if (activeTab === 'wifi') {
      setFormData(prev => ({
        ...prev,
        wifi: { ...prev.wifi, [field]: value } as FormData['wifi'],
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-2xl p-6 md:p-8 animate-fade-in-up">
      {/* Tabs */}
      <div className="overflow-x-auto mb-8 scrollbar-thin scrollbar-thumb-primary scrollbar-track-slate-100">
        <div className="flex gap-2 min-w-max pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                const previousTab = activeTab;
                setActiveTab(tab.id);
                setQrValue('');
                setError('');
                
                // Track tab switch if switching to a different tab
                if (previousTab !== tab.id) {
                  trackTabSwitch(previousTab, tab.id);
                }
              }}
              className={`px-5 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'gradient-primary text-white shadow-primary'
                  : 'bg-slate-100 text-gray-900 hover:bg-slate-200'
              }`}
            >
              <i className={tab.icon}></i>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-slate-50 rounded-lg p-6 mb-6 min-h-[200px]">
        {activeTab === 'url' && (
          <div className="mb-5">
            <label className="block mb-2 font-semibold text-gray-900">Enter URL:</label>
            <input
              type="url"
              value={formData.url || ''}
              onChange={e => updateFormData('url', e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        )}

        {activeTab === 'text' && (
          <div className="mb-5">
            <label className="block mb-2 font-semibold text-gray-900">Enter Text:</label>
            <textarea
              value={formData.text || ''}
              onChange={e => updateFormData('text', e.target.value)}
              rows={4}
              placeholder="Enter your text here"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        )}

        {activeTab === 'instagram' && (
          <div className="mb-5">
            <label className="block mb-2 font-semibold text-gray-900">Instagram Username:</label>
            <div className="relative">
              <i className="fab fa-instagram absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg"></i>
              <input
                type="text"
                value={formData.instagram || ''}
                onChange={e => updateFormData('instagram', e.target.value)}
                placeholder="username"
                className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">Enter without @ symbol</p>
          </div>
        )}

        {activeTab === 'facebook' && (
          <div className="mb-5">
            <label className="block mb-2 font-semibold text-gray-900">Facebook Username or ID:</label>
            <div className="relative">
              <i className="fab fa-facebook absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg"></i>
              <input
                type="text"
                value={formData.facebook || ''}
                onChange={e => updateFormData('facebook', e.target.value)}
                placeholder="username or profile ID"
                className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">For profiles, enter username. For pages, enter page name.</p>
          </div>
        )}

        {activeTab === 'whatsapp' && (
          <>
            <div className="mb-5">
              <label className="block mb-2 font-semibold text-gray-900">Phone Number:</label>
              <div className="relative">
                <i className="fab fa-whatsapp absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg"></i>
                <input
                  type="tel"
                  value={formData.whatsapp?.number || ''}
                  onChange={e => updateFormData('number', e.target.value)}
                  placeholder="+1234567890"
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">Include country code (e.g., +1 for US)</p>
            </div>
            <div className="mb-5">
              <label className="block mb-2 font-semibold text-gray-900">Pre-filled Message (Optional):</label>
              <textarea
                value={formData.whatsapp?.message || ''}
                onChange={e => updateFormData('message', e.target.value)}
                rows={3}
                placeholder="Hello, I'm contacting you from your QR code!"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </>
        )}

        {activeTab === 'linkedin' && (
          <>
            <div className="mb-5">
              <label className="block mb-2 font-semibold text-gray-900">LinkedIn Profile Type:</label>
              <select
                value={formData.linkedin?.type || 'profile'}
                onChange={e => updateFormData('type', e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="profile">Personal Profile</option>
                <option value="company">Company Page</option>
              </select>
            </div>
            <div className="mb-5">
              <label className="block mb-2 font-semibold text-gray-900">LinkedIn Username or Company ID:</label>
              <div className="relative">
                <i className="fab fa-linkedin absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg"></i>
                <input
                  type="text"
                  value={formData.linkedin?.username || ''}
                  onChange={e => updateFormData('username', e.target.value)}
                  placeholder="username or company name"
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">For personal profiles, enter your username (from linkedin.com/in/username)</p>
            </div>
          </>
        )}

        {activeTab === 'telegram' && (
          <>
            <div className="mb-5">
              <label className="block mb-2 font-semibold text-gray-900">Telegram Type:</label>
              <select
                value={formData.telegram?.type || 'user'}
                onChange={e => updateFormData('type', e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="user">User</option>
                <option value="group">Group</option>
                <option value="channel">Channel</option>
              </select>
            </div>
            <div className="mb-5">
              <label className="block mb-2 font-semibold text-gray-900">Username:</label>
              <div className="relative">
                <i className="fab fa-telegram absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg"></i>
                <input
                  type="text"
                  value={formData.telegram?.username || ''}
                  onChange={e => updateFormData('username', e.target.value)}
                  placeholder="username"
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">Enter without @ symbol</p>
            </div>
          </>
        )}

        {activeTab === 'snapchat' && (
          <div className="mb-5">
            <label className="block mb-2 font-semibold text-gray-900">Snapchat Username:</label>
            <div className="relative">
              <i className="fab fa-snapchat absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg"></i>
              <input
                type="text"
                value={formData.snapchat || ''}
                onChange={e => updateFormData('snapchat', e.target.value)}
                placeholder="username"
                className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">Enter without @ symbol</p>
          </div>
        )}

        {activeTab === 'twitter' && (
          <div className="mb-5">
            <label className="block mb-2 font-semibold text-gray-900">Twitter Username:</label>
            <div className="relative">
              <i className="fab fa-twitter absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg"></i>
              <input
                type="text"
                value={formData.twitter || ''}
                onChange={e => updateFormData('twitter', e.target.value)}
                placeholder="username"
                className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">Enter without @ symbol</p>
          </div>
        )}

        {activeTab === 'contact' && (
          <>
            <div className="mb-5">
              <label className="block mb-2 font-semibold text-gray-900">Name:</label>
              <div className="relative">
                <i className="fas fa-user absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg"></i>
                <input
                  type="text"
                  value={formData.contact?.name || ''}
                  onChange={e => updateFormData('name', e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="mb-5">
              <label className="block mb-2 font-semibold text-gray-900">Phone:</label>
              <div className="relative">
                <i className="fas fa-phone absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg"></i>
                <input
                  type="tel"
                  value={formData.contact?.phone || ''}
                  onChange={e => updateFormData('phone', e.target.value)}
                  placeholder="+1234567890"
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="mb-5">
              <label className="block mb-2 font-semibold text-gray-900">Email:</label>
              <div className="relative">
                <i className="fas fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg"></i>
                <input
                  type="email"
                  value={formData.contact?.email || ''}
                  onChange={e => updateFormData('email', e.target.value)}
                  placeholder="john@example.com"
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="mb-5">
              <label className="block mb-2 font-semibold text-gray-900">Address:</label>
              <div className="relative">
                <i className="fas fa-map-marker-alt absolute left-3 top-3 text-gray-500 text-lg"></i>
                <textarea
                  value={formData.contact?.address || ''}
                  onChange={e => updateFormData('address', e.target.value)}
                  rows={2}
                  placeholder="123 Main St, City, Country"
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="mb-5">
              <label className="block mb-2 font-semibold text-gray-900">Website:</label>
              <div className="relative">
                <i className="fas fa-globe absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg"></i>
                <input
                  type="url"
                  value={formData.contact?.website || ''}
                  onChange={e => updateFormData('website', e.target.value)}
                  placeholder="https://example.com"
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </>
        )}

        {activeTab === 'phone' && (
          <div className="mb-5">
            <label className="block mb-2 font-semibold text-gray-900">Phone Number:</label>
            <div className="relative">
              <i className="fas fa-phone absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg"></i>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={e => updateFormData('phone', e.target.value)}
                placeholder="+1234567890"
                className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">Include country code (e.g., +1 for US)</p>
          </div>
        )}

        {activeTab === 'sms' && (
          <>
            <div className="mb-5">
              <label className="block mb-2 font-semibold text-gray-900">Phone Number:</label>
              <div className="relative">
                <i className="fas fa-mobile-alt absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg"></i>
                <input
                  type="tel"
                  value={formData.sms?.number || ''}
                  onChange={e => updateFormData('number', e.target.value)}
                  placeholder="+1234567890"
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">Include country code (e.g., +1 for US)</p>
            </div>
            <div className="mb-5">
              <label className="block mb-2 font-semibold text-gray-900">Message:</label>
              <textarea
                value={formData.sms?.message || ''}
                onChange={e => updateFormData('message', e.target.value)}
                rows={3}
                placeholder="Enter your message here"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </>
        )}

        {activeTab === 'email' && (
          <>
            <div className="mb-5">
              <label className="block mb-2 font-semibold text-gray-900">Email Address:</label>
              <div className="relative">
                <i className="fas fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg"></i>
                <input
                  type="email"
                  value={formData.email?.address || ''}
                  onChange={e => updateFormData('address', e.target.value)}
                  placeholder="recipient@example.com"
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="mb-5">
              <label className="block mb-2 font-semibold text-gray-900">Subject:</label>
              <div className="relative">
                <i className="fas fa-heading absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg"></i>
                <input
                  type="text"
                  value={formData.email?.subject || ''}
                  onChange={e => updateFormData('subject', e.target.value)}
                  placeholder="Email Subject"
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="mb-5">
              <label className="block mb-2 font-semibold text-gray-900">Message:</label>
              <textarea
                value={formData.email?.body || ''}
                onChange={e => updateFormData('body', e.target.value)}
                rows={3}
                placeholder="Enter your email content here"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </>
        )}

        {activeTab === 'wifi' && (
          <>
            <div className="mb-5">
              <label className="block mb-2 font-semibold text-gray-900">Network Name (SSID):</label>
              <div className="relative">
                <i className="fas fa-wifi absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg"></i>
                <input
                  type="text"
                  value={formData.wifi?.ssid || ''}
                  onChange={e => updateFormData('ssid', e.target.value)}
                  placeholder="WiFi Network Name"
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="mb-5">
              <label className="block mb-2 font-semibold text-gray-900">Password:</label>
              <div className="relative">
                <i className="fas fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg"></i>
                <input
                  type="password"
                  value={formData.wifi?.password || ''}
                  onChange={e => updateFormData('password', e.target.value)}
                  placeholder="WiFi Password"
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="mb-5">
              <label className="block mb-2 font-semibold text-gray-900">Encryption Type:</label>
              <select
                value={formData.wifi?.encryption || 'WPA'}
                onChange={e => updateFormData('encryption', e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">No Encryption</option>
              </select>
            </div>
            <div className="mb-5 flex items-center">
              <input
                type="checkbox"
                id="hidden-ssid"
                checked={formData.wifi?.hidden || false}
                onChange={e => updateFormData('hidden', e.target.checked)}
                className="w-4 h-4 mr-2"
              />
              <label htmlFor="hidden-ssid" className="text-gray-900 font-medium">Hidden Network</label>
            </div>
          </>
        )}
      </div>

      {/* Size Selector */}
      <div className="mb-6">
        <label className="block mb-2 font-semibold text-gray-900">
          <i className="fas fa-expand-arrows-alt mr-2"></i>QR Code Size:
        </label>
        <select
          value={size}
          onChange={e => setSize(Number(e.target.value))}
          className="w-full md:w-auto px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value={128}>Small (128x128)</option>
          <option value={200}>Medium (200x200)</option>
          <option value={300}>Large (300x300)</option>
          <option value={400}>Extra Large (400x400)</option>
        </select>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        className="w-full py-4 gradient-primary text-white rounded-lg font-semibold text-lg mb-6 shadow-primary hover:-translate-y-0.5 hover:shadow-primary-hover transition-all"
      >
        <i className="fas fa-magic mr-2"></i>Generate QR Code
      </button>

      {/* Error Message */}
      {error && (
        <div className="text-red-600 mb-4 text-center font-medium">{error}</div>
      )}

      {/* QR Code Output */}
      <div className="flex flex-col items-center mt-8">
        {qrValue && (
          <>
            <div className="bg-white p-5 rounded-lg shadow-lg mb-5">
              <QRCodeSVG
                value={qrValue}
                size={size}
                level="M"
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-6 py-3 bg-green-500 text-white rounded-lg font-semibold shadow-lg hover:bg-green-600 hover:-translate-y-0.5 transition-all"
            >
              <i className="fas fa-download mr-2"></i>Download QR Code
            </button>
          </>
        )}
      </div>
    </div>
  );
}

