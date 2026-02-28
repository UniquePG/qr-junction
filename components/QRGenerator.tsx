'use client';

import dynamic from 'next/dynamic';
import { useCallback, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  AlertCircle,
  Contact as ContactIcon,
  Dot,
  Download,
  Facebook,
  Frame,
  Ghost,
  Grid2X2,
  Image as ImageIcon,
  Instagram,
  Link as LinkIcon,
  Linkedin,
  Mail,
  MessageCircle,
  MessageSquareText,
  PaintBucket,
  Palette,
  Phone,
  QrCode,
  Ruler,
  Send,
  Square,
  Target,
  Type as TypeIcon,
  Wand2,
  Wifi,
  X,
} from 'lucide-react';

import type { QRConfig } from '@/types/qrTypes';
import { DEFAULT_QR_CONFIG } from '@/types/qrTypes';
import { downloadWithFrame } from '@/utils/downloadWithFrame';

import {
  trackQRCodeGeneration,
  trackTabSwitch,
  type QRCodeType
} from '@/lib/analytics';

// ─── Lazy-load the QR preview (canvas needs client) ─────────────────────────
import type { QRPreviewHandle } from '@/components/qr/QRPreview';

const QRPreview = dynamic(() => import('@/components/qr/QRPreview'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-[300px] h-[300px] bg-slate-100 rounded-xl animate-pulse">
      <span className="text-slate-400 text-sm">Loading…</span>
    </div>
  ),
});

// Controls
import AccordionSection from '@/components/qr/AccordionSection';
import FrameRenderer from '@/components/qr/FrameRenderer';
import BackgroundCustomizer from '@/components/qr/controls/BackgroundCustomizer';
import CornerDotsCustomizer from '@/components/qr/controls/CornerDotsCustomizer';
import CornerSquaresCustomizer from '@/components/qr/controls/CornerSquaresCustomizer';
import DotsCustomizer from '@/components/qr/controls/DotsCustomizer';
import DownloadControls from '@/components/qr/controls/DownloadControls';
import ErrorCorrectionControl from '@/components/qr/controls/ErrorCorrectionControl';
import FrameSelector from '@/components/qr/controls/FrameSelector';
import LogoCustomizer from '@/components/qr/controls/LogoCustomizer';
import PresetStyles from '@/components/qr/controls/PresetStyles';
import SizeControls from '@/components/qr/controls/SizeControls';
import { ContactTabForm, EmailTabForm, FacebookTabForm, InstagramTabForm, LinkedInTabForm, PhoneTabForm, SMSTabForm, SnapchatTabForm, TelegramTabForm, TextTabForm, TwitterTabForm, URLTabForm, WhatsAppTabForm, WiFiTabForm } from './qr/TabsForms';

// ─── Form / Tab types ────────────────────────────────────────────────────────
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

// ─── Helpers (unchanged from original) ──────────────────────────────────────
const TABS: { id: TabType; label: string; Icon: LucideIcon }[] = [
  { id: 'url', label: 'URL', Icon: LinkIcon },
  { id: 'text', label: 'Text', Icon: TypeIcon },
  { id: 'instagram', label: 'Instagram', Icon: Instagram },
  { id: 'facebook', label: 'Facebook', Icon: Facebook },
  { id: 'whatsapp', label: 'WhatsApp', Icon: MessageCircle },
  { id: 'linkedin', label: 'LinkedIn', Icon: Linkedin },
  { id: 'telegram', label: 'Telegram', Icon: Send },
  { id: 'snapchat', label: 'Snapchat', Icon: Ghost },
  { id: 'twitter', label: 'X', Icon: X },
  { id: 'contact', label: 'Contact', Icon: ContactIcon },
  { id: 'phone', label: 'Phone', Icon: Phone },
  { id: 'sms', label: 'SMS', Icon: MessageSquareText },
  { id: 'email', label: 'Email', Icon: Mail },
  { id: 'wifi', label: 'WiFi', Icon: Wifi },
];

function formatQRData(tab: TabType, data: FormData): string {
  switch (tab) {
    case 'url':
      return data.url || '';
    case 'text':
      return data.text || '';
    case 'instagram':
      return `https://www.instagram.com/${data.instagram || ''}`;
    case 'facebook':
      return `https://www.facebook.com/${data.facebook || ''}`;
    case 'whatsapp': {
      const d = data.whatsapp || { number: '', message: '' };
      const num = (d.number || '').replace(/\+/g, '').replace(/\s/g, '');
      return `https://wa.me/${num}${d.message ? `?text=${encodeURIComponent(d.message)}` : ''}`;
    }
    case 'linkedin': {
      const d = data.linkedin || { type: 'profile', username: '' };
      return d.type === 'profile'
        ? `https://www.linkedin.com/in/${d.username}`
        : `https://www.linkedin.com/company/${d.username}`;
    }
    case 'telegram': {
      const d = data.telegram || { type: 'user', username: '' };
      if (d.type === 'user') return `https://t.me/${d.username}`;
      if (d.type === 'group') return `https://t.me/joinchat/${d.username}`;
      return `https://t.me/s/${d.username}`;
    }
    case 'snapchat':
      return `https://www.snapchat.com/add/${data.snapchat || ''}`;
    case 'twitter':
      return `https://twitter.com/${data.twitter || ''}`;
    case 'contact': {
      const c = data.contact || { name: '', phone: '', email: '', address: '', website: '' };
      let v = 'BEGIN:VCARD\nVERSION:3.0\n';
      if (c.name) v += `FN:${c.name}\n`;
      if (c.phone) v += `TEL:${c.phone}\n`;
      if (c.email) v += `EMAIL:${c.email}\n`;
      if (c.address) v += `ADR:;;${c.address};;;\n`;
      if (c.website) v += `URL:${c.website}\n`;
      return v + 'END:VCARD';
    }
    case 'phone':
      return `tel:${data.phone || ''}`;
    case 'sms': {
      const d = data.sms || { number: '', message: '' };
      return `SMSTO:${d.number}:${d.message}`;
    }
    case 'email': {
      const d = data.email || { address: '', subject: '', body: '' };
      return `mailto:${d.address}?subject=${encodeURIComponent(d.subject || '')}&body=${encodeURIComponent(d.body || '')}`;
    }
    case 'wifi': {
      const d = data.wifi || { ssid: '', password: '', encryption: 'WPA', hidden: false };
      let s = `WIFI:S:${d.ssid};T:${d.encryption};P:${d.password};`;
      if (d.hidden) s += 'H:true;';
      return s + ';';
    }
    default:
      return '';
  }
}

function validateForm(tab: TabType, formData: FormData): string | null {
  if (tab === 'url' && !formData.url?.trim()) return 'Please enter a URL';
  if (tab === 'text' && !formData.text?.trim()) return 'Please enter some text';
  if (tab === 'instagram' && !formData.instagram?.trim()) return 'Please enter an Instagram username';
  if (tab === 'facebook' && !formData.facebook?.trim()) return 'Please enter a Facebook username or ID';
  if (tab === 'whatsapp' && !formData.whatsapp?.number?.trim()) return 'Please enter a phone number';
  if (tab === 'linkedin' && !formData.linkedin?.username?.trim()) return 'Please enter a LinkedIn username';
  if (tab === 'telegram' && !formData.telegram?.username?.trim()) return 'Please enter a Telegram username';
  if (tab === 'snapchat' && !formData.snapchat?.trim()) return 'Please enter a Snapchat username';
  if (tab === 'twitter' && !formData.twitter?.trim()) return 'Please enter a Twitter username';
  if (tab === 'phone' && !formData.phone?.trim()) return 'Please enter a phone number';
  if (tab === 'sms' && !formData.sms?.number?.trim()) return 'Please enter a phone number';
  if (tab === 'email' && !formData.email?.address?.trim()) return 'Please enter an email address';
  if (tab === 'wifi' && !formData.wifi?.ssid?.trim()) return 'Please enter a network name (SSID)';
  return null;
}

// ─── Tab Form Components ──────────────────────────────────────────────────────
interface TabFormProps {
  formData: FormData;
  updateFormData: (field: string, value: string | boolean) => void;
}

// ─── Tab Form Renderer ───────────────────────────────────────────────────────
interface TabFormRendererProps extends TabFormProps {
  activeTab: TabType;
}

export function TabFormRenderer({ activeTab, formData, updateFormData }: TabFormRendererProps) {
  switch (activeTab) {
    case 'url':
      return <URLTabForm formData={formData} updateFormData={updateFormData} />;
    case 'text':
      return <TextTabForm formData={formData} updateFormData={updateFormData} />;
    case 'instagram':
      return <InstagramTabForm formData={formData} updateFormData={updateFormData} />;
    case 'facebook':
      return <FacebookTabForm formData={formData} updateFormData={updateFormData} />;
    case 'whatsapp':
      return <WhatsAppTabForm formData={formData} updateFormData={updateFormData} />;
    case 'linkedin':
      return <LinkedInTabForm formData={formData} updateFormData={updateFormData} />;
    case 'telegram':
      return <TelegramTabForm formData={formData} updateFormData={updateFormData} />;
    case 'snapchat':
      return <SnapchatTabForm formData={formData} updateFormData={updateFormData} />;
    case 'twitter':
      return <TwitterTabForm formData={formData} updateFormData={updateFormData} />;
    case 'contact':
      return <ContactTabForm formData={formData} updateFormData={updateFormData} />;
    case 'phone':
      return <PhoneTabForm formData={formData} updateFormData={updateFormData} />;
    case 'sms':
      return <SMSTabForm formData={formData} updateFormData={updateFormData} />;
    case 'email':
      return <EmailTabForm formData={formData} updateFormData={updateFormData} />;
    case 'wifi':
      return <WiFiTabForm formData={formData} updateFormData={updateFormData} />;
    default:
      return null;
  }
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function QRGenerator() {
  const [activeTab, setActiveTab] = useState<TabType>('url');
  const [formData, setFormData] = useState<FormData>({});
  const [qrValue, setQrValue] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [qrConfig, setQrConfig] = useState<QRConfig>(DEFAULT_QR_CONFIG);
  const [eclLockedToH, setEclLockedToH] = useState(false);

  const qrPreviewRef = useRef<QRPreviewHandle | null>(null);

  // ── Config updaters ──────────────────────────────────────────────────────
  const updateConfig = useCallback((partial: Partial<QRConfig>) => {
    setQrConfig(prev => ({ ...prev, ...partial }));
  }, []);

  const applyPreset = useCallback((partial: Partial<QRConfig>) => {
    setQrConfig(prev => ({
      ...prev,
      ...partial,
      dots: { ...prev.dots, ...partial.dots },
      cornerSquares: { ...prev.cornerSquares, ...partial.cornerSquares },
      cornerDots: { ...prev.cornerDots, ...partial.cornerDots },
      background: { ...prev.background, ...partial.background },
    }));
  }, []);

  // ── Form data updater ────────────────────────────────────────────────────
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
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  // ── Frame-aware download ─────────────────────────────────────────────────
  const handleDownload = async () => {
    const canvas = qrPreviewRef.current?.getCanvas();
    if (!canvas) return;
    await downloadWithFrame({
      qrCanvas: canvas,
      frameConfig: qrConfig.frame,
      downloadConfig: qrConfig.download,
    });
  };

  // ── Generate ─────────────────────────────────────────────────────────────
  const handleGenerate = () => {
    setError('');
    const validationError = validateForm(activeTab, formData);
    if (validationError) {
      setError(validationError);
      return;
    }
    const data = formatQRData(activeTab, formData);
    setQrValue(data);
    trackQRCodeGeneration(activeTab as QRCodeType, qrConfig.size.width);
  };

  return (
    <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
      {/* ── Header bar ───────────────────────────────────────────────── */}
      <div className="gradient-primary px-6 py-4">
        <h2 className="text-white font-bold text-lg flex items-center gap-2">
          <QrCode className="w-5 h-5" /> QR Code Generator
        </h2>
        <p className="text-white/70 text-xs mt-0.5">Generate &amp; fully customize your QR codes</p>
      </div>

      <div className="flex flex-col">
        {/* ══════════════════════════════════════════════════════════════
            LEFT COLUMN — Form
        ══════════════════════════════════════════════════════════════ */}
        <div className="flex-1 p-4 sm:p-6 lg:border-r lg:border-slate-100 border-b lg:border-b-0 border-slate-100">
          {/* Tab strip */}
          <div className="overflow-x-auto mb-4 sm:mb-6 scrollbar-thin scrollbar-thumb-primary scrollbar-track-slate-100 -mx-4 sm:-mx-6 px-4 sm:px-6">
            <div className="flex gap-2 min-w-max pb-2">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    const prev = activeTab;
                    setActiveTab(tab.id);
                    setQrValue('');
                    setError('');
                    if (prev !== tab.id) trackTabSwitch(prev, tab.id);
                  }}
                  className={`px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap text-sm ${
                    activeTab === tab.id
                      ? 'gradient-primary text-white shadow-primary'
                      : 'bg-slate-100 text-gray-700 hover:bg-slate-200'
                  }`}
                >
                  <tab.Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form content */}
          <div className="bg-slate-50 rounded-xl p-4 sm:p-5 mb-4 sm:mb-5 min-h-[180px]">
            <TabFormRenderer
              activeTab={activeTab}
              formData={formData}
              updateFormData={updateFormData}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm font-medium flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          {/* Generate button */}
          <button
            type="button"
            onClick={handleGenerate}
            className="w-full py-4 gradient-primary text-white rounded-xl font-bold text-base shadow-primary hover:-translate-y-0.5 hover:shadow-primary-hover transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Wand2 className="w-5 h-5" /> Generate QR Code
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            RIGHT COLUMN — Preview + Customization
        ══════════════════════════════════════════════════════════════ */}
        <div className="w-full flex flex-col md:flex-row mt-6">
          {/* ── QR Preview area ─────────────────────────────────────── */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-b md:border-b-0 md:border-r border-slate-100 md:w-[500px] md:flex-none w-full p-6 flex flex-col items-center gap-4">
            <div className="flex items-center justify-between w-full">
              <h3 className="font-bold text-gray-800 text-xs sm:text-sm uppercase tracking-wide">Live Preview</h3>
              {qrValue && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  Live
                </span>
              )}
            </div>

            {qrValue ? (
              <div className="w-full flex justify-center">
                <FrameRenderer frameConfig={qrConfig.frame}>
                  <QRPreview
                    ref={qrPreviewRef}
                    value={qrValue}
                    config={qrConfig}
                  />
                </FrameRenderer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-full max-w-[280px] aspect-square rounded-2xl border-2 border-dashed border-slate-300 bg-white">
                <Square className="w-10 h-10 sm:w-12 sm:h-12 mb-3 opacity-30 text-slate-700" />
                <p className="text-xs sm:text-sm text-slate-400 font-medium text-center px-4">
                  Fill in the form and click<br />
                  <span className="text-primary font-semibold">Generate QR Code</span>
                </p>
              </div>
            )}

            {/* Quick download shortcut */}
            {qrValue && (
              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-sm hover:-translate-y-0.5"
              >
                <Download className="w-4 h-4" /> Quick Download
              </button>
            )}
            {/* <AccordionSection title="Download" icon="📦"> */}
              <DownloadControls
                config={qrConfig.download}
                onChange={dl => updateConfig({ download: dl })}
                qrRef={qrPreviewRef}
                hasQRValue={!!qrValue}
                onDownload={handleDownload}
              />
            {/* </AccordionSection> */}
          </div>

          {/* ── Customization Accordion Panels ──────────────────────── */}
          <div className="flex-1 px-3 py-6 md:py-0">
            <h3 className='font-bold text-gray-800 text-xs sm:text-sm uppercase tracking-wide mb-3'>Customizations</h3>
            <div className="flex-1 px-3  overflow-y-auto max-h-[600px] sm:max-h-[700px] lg:max-h-[calc(100vh-120px)]">
              <AccordionSection
                title="Preset Styles"
                icon={<Palette className="w-4 h-4 text-slate-700" />}
                defaultOpen={true}
              >
                <PresetStyles onApply={applyPreset} />
              </AccordionSection>

              <AccordionSection title="Body Dots" icon={<Dot className="w-4 h-4 text-slate-700" />}>
                <DotsCustomizer
                  dots={qrConfig.dots}
                  onChange={dots => updateConfig({ dots })}
                />
              </AccordionSection>

              <AccordionSection title="Corner Squares" icon={<Grid2X2 className="w-4 h-4 text-slate-700" />}>
                <CornerSquaresCustomizer
                  cornerSquares={qrConfig.cornerSquares}
                  onChange={cs => updateConfig({ cornerSquares: cs })}
                />
              </AccordionSection>

              <AccordionSection title="Corner Dots" icon={<Dot className="w-4 h-4 text-slate-700" />}>
                <CornerDotsCustomizer
                  cornerDots={qrConfig.cornerDots}
                  onChange={cd => updateConfig({ cornerDots: cd })}
                />
              </AccordionSection>

              <AccordionSection
                title="Logo / Image"
                icon={<ImageIcon className="w-4 h-4 text-slate-700" />}
                badge={qrConfig.logo ? 'Active' : undefined}
              >
                <LogoCustomizer
                  logo={qrConfig.logo}
                  onChange={logo => updateConfig({ logo })}
                  onEclLocked={setEclLockedToH}
                />
              </AccordionSection>

              <AccordionSection title="Background" icon={<PaintBucket className="w-4 h-4 text-slate-700" />}>
                <BackgroundCustomizer
                  background={qrConfig.background}
                  onChange={bg => updateConfig({ background: bg })}
                />
              </AccordionSection>

              <AccordionSection
                title="Frame / Template"
                icon={<Frame className="w-4 h-4 text-slate-700" />}
                badge={qrConfig.frame.templateId ? 'Active' : undefined}
              >
                <FrameSelector
                  frame={qrConfig.frame}
                  onChange={frame => updateConfig({ frame })}
                />
              </AccordionSection>

              <AccordionSection title="Size & Margin" icon={<Ruler className="w-4 h-4 text-slate-700" />}>
                <SizeControls
                  size={qrConfig.size}
                  onChange={size => updateConfig({ size })}
                />
              </AccordionSection>

              <AccordionSection
                title="Error Correction"
                icon={<Target className="w-4 h-4 text-slate-700" />}
                badge={eclLockedToH ? 'H — Locked' : undefined}
              >
                <ErrorCorrectionControl
                  level={qrConfig.errorCorrectionLevel}
                  onChange={ecl => updateConfig({ errorCorrectionLevel: ecl })}
                  lockedToH={eclLockedToH}
                />
              </AccordionSection>

              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
