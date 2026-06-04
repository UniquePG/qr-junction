import { 
  Link as LinkIcon, 
  Type as TypeIcon, 
  Instagram, 
  Facebook, 
  MessageCircle, 
  Linkedin, 
  Send, 
  Ghost, 
  X, 
  Contact as ContactIcon, 
  Phone, 
  MessageSquareText, 
  Mail, 
  Wifi,
  Smartphone,
  Layout
} from 'lucide-react';
import { QRType } from '@prisma/client';

export type TabType =
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
  | 'wifi'
  | 'app_download'
  | 'landing_page';

export interface FormData {
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
  app_download?: { iosUrl: string; androidUrl: string; fallbackUrl: string };
  landing_page?: { landingPageId: string };
}

export interface TabConfig {
  id: TabType;
  label: string;
  Icon: any;
  qrType: QRType;
}

export const TABS: TabConfig[] = [
  { id: 'url', label: 'URL', Icon: LinkIcon, qrType: QRType.URL },
  { id: 'text', label: 'Text', Icon: TypeIcon, qrType: QRType.TEXT },
  { id: 'instagram', label: 'Instagram', Icon: Instagram, qrType: QRType.INSTAGRAM },
  { id: 'facebook', label: 'Facebook', Icon: Facebook, qrType: QRType.FACEBOOK },
  { id: 'whatsapp', label: 'WhatsApp', Icon: MessageCircle, qrType: QRType.WHATSAPP },
  { id: 'linkedin', label: 'LinkedIn', Icon: Linkedin, qrType: QRType.LINKEDIN },
  { id: 'telegram', label: 'Telegram', Icon: Send, qrType: QRType.TELEGRAM },
  { id: 'snapchat', label: 'Snapchat', Icon: Ghost, qrType: QRType.SNAPCHAT },
  { id: 'twitter', label: 'X', Icon: X, qrType: QRType.TWITTER },
  { id: 'contact', label: 'Contact', Icon: ContactIcon, qrType: QRType.CONTACT },
  { id: 'phone', label: 'Phone', Icon: Phone, qrType: QRType.PHONE },
  { id: 'sms', label: 'SMS', Icon: MessageSquareText, qrType: QRType.SMS },
  { id: 'email', label: 'Email', Icon: Mail, qrType: QRType.EMAIL },
  { id: 'wifi', label: 'WiFi', Icon: Wifi, qrType: QRType.WIFI },
  { id: 'app_download', label: 'App Store', Icon: Smartphone, qrType: QRType.APP_DOWNLOAD },
  { id: 'landing_page', label: 'Landing Page', Icon: Layout, qrType: QRType.LANDING_PAGE },
];

export function formatQRData(tab: TabType, data: FormData): string {
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
    case 'app_download': {
      const d = data.app_download || { iosUrl: '', androidUrl: '', fallbackUrl: '' };
      return d.fallbackUrl || '';
    }
    case 'landing_page':
      return data.landing_page?.landingPageId ? `landing-page-${data.landing_page.landingPageId}` : '';
    default:
      return '';
  }
}

export function validateForm(tab: TabType, formData: FormData): string | null {
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
  if (tab === 'app_download' && !formData.app_download?.fallbackUrl?.trim()) return 'Please enter a fallback redirect URL';
  if (tab === 'landing_page' && !formData.landing_page?.landingPageId) return 'Please select a landing page';
  return null;
}

export function getTabTypeFromQrType(type: QRType): TabType {
  return type.toLowerCase() as TabType;
}

export function getQrTypeFromTabType(tab: TabType): QRType {
  const match = TABS.find(t => t.id === tab);
  return match ? match.qrType : QRType.URL;
}

export function getDbDestination(tab: TabType, data: FormData): any {
  switch (tab) {
    case 'url':
      return { url: data.url };
    case 'text':
      return { text: data.text };
    case 'instagram':
      return { username: data.instagram };
    case 'facebook':
      return { username: data.facebook };
    case 'whatsapp':
      return { phone: data.whatsapp?.number, message: data.whatsapp?.message };
    case 'linkedin':
      return { type: data.linkedin?.type, username: data.linkedin?.username };
    case 'telegram':
      return { type: data.telegram?.type, username: data.telegram?.username };
    case 'snapchat':
      return { username: data.snapchat };
    case 'twitter':
      return { username: data.twitter };
    case 'contact':
      return { 
        name: data.contact?.name, 
        phone: data.contact?.phone, 
        email: data.contact?.email, 
        address: data.contact?.address, 
        website: data.contact?.website 
      };
    case 'phone':
      return { phone: data.phone };
    case 'sms':
      return { phone: data.sms?.number, message: data.sms?.message };
    case 'email':
      return { email: data.email?.address, subject: data.email?.subject, body: data.email?.body };
    case 'wifi':
      return { 
        ssid: data.wifi?.ssid, 
        password: data.wifi?.password, 
        encryption: data.wifi?.encryption, 
        hidden: data.wifi?.hidden 
      };
    case 'app_download':
      return { 
        iosUrl: data.app_download?.iosUrl, 
        androidUrl: data.app_download?.androidUrl, 
        fallbackUrl: data.app_download?.fallbackUrl 
      };
    case 'landing_page':
      return { landingPageId: data.landing_page?.landingPageId };
    default:
      return {};
  }
}

export function getFormDataFromDb(tab: TabType, dest: any): FormData {
  if (!dest) return {};
  switch (tab) {
    case 'url':
      return { url: dest.url };
    case 'text':
      return { text: dest.text };
    case 'instagram':
      return { instagram: dest.username };
    case 'facebook':
      return { facebook: dest.username };
    case 'whatsapp':
      return { whatsapp: { number: dest.phone || '', message: dest.message || '' } };
    case 'linkedin':
      return { linkedin: { type: dest.type || 'profile', username: dest.username || '' } };
    case 'telegram':
      return { telegram: { type: dest.type || 'user', username: dest.username || '' } };
    case 'snapchat':
      return { snapchat: dest.username };
    case 'twitter':
      return { twitter: dest.username };
    case 'contact':
      return { 
        contact: {
          name: dest.name || '',
          phone: dest.phone || '',
          email: dest.email || '',
          address: dest.address || '',
          website: dest.website || ''
        }
      };
    case 'phone':
      return { phone: dest.phone };
    case 'sms':
      return { sms: { number: dest.phone || '', message: dest.message || '' } };
    case 'email':
      return { email: { address: dest.email || '', subject: dest.subject || '', body: dest.body || '' } };
    case 'wifi':
      return { wifi: { ssid: dest.ssid || '', password: dest.password || '', encryption: dest.encryption || 'WPA', hidden: !!dest.hidden } };
    case 'app_download':
      return { app_download: { iosUrl: dest.iosUrl || '', androidUrl: dest.androidUrl || '', fallbackUrl: dest.fallbackUrl || '' } };
    case 'landing_page':
      return { landing_page: { landingPageId: dest.landingPageId || '' } };
    default:
      return {};
  }
}
