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
  }
interface TabFormProps {
    formData: FormData;
    updateFormData: (field: string, value: string | boolean) => void;
  }

  const INPUT_CLASS =
  'w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition-colors';
const ICON_INPUT_CLASS =
  'w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition-colors';
  
  export function URLTabForm({ formData, updateFormData }: TabFormProps) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block mb-2 font-semibold text-gray-800 text-sm">Enter URL:</label>
          <input
            type="url"
            value={formData.url || ''}
            onChange={e => updateFormData('url', e.target.value)}
            placeholder="https://example.com"
            className={INPUT_CLASS}
          />
        </div>
      </div>
    );
  }
  
  export function TextTabForm({ formData, updateFormData }: TabFormProps) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block mb-2 font-semibold text-gray-800 text-sm">Enter Text:</label>
          <textarea
            value={formData.text || ''}
            onChange={e => updateFormData('text', e.target.value)}
            rows={4}
            placeholder="Enter your text here"
            className={INPUT_CLASS}
          />
        </div>
      </div>
    );
  }
  
  export function InstagramTabForm({ formData, updateFormData }: TabFormProps) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block mb-2 font-semibold text-gray-800 text-sm">Instagram Username:</label>
          <div className="relative">
            <i className="fab fa-instagram absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={formData.instagram || ''}
              onChange={e => updateFormData('instagram', e.target.value)}
              placeholder="username"
              className={ICON_INPUT_CLASS}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">Without @ symbol</p>
        </div>
      </div>
    );
  }
  
  export function FacebookTabForm({ formData, updateFormData }: TabFormProps) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block mb-2 font-semibold text-gray-800 text-sm">Facebook Username or ID:</label>
          <div className="relative">
            <i className="fab fa-facebook absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={formData.facebook || ''}
              onChange={e => updateFormData('facebook', e.target.value)}
              placeholder="username or page ID"
              className={ICON_INPUT_CLASS}
            />
          </div>
        </div>
      </div>
    );
  }
  
  export function WhatsAppTabForm({ formData, updateFormData }: TabFormProps) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block mb-2 font-semibold text-gray-800 text-sm">Phone Number:</label>
          <div className="relative">
            <i className="fab fa-whatsapp absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="tel"
              value={formData.whatsapp?.number || ''}
              onChange={e => updateFormData('number', e.target.value)}
              placeholder="+1234567890"
              className={ICON_INPUT_CLASS}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">Include country code</p>
        </div>
        <div>
          <label className="block mb-2 font-semibold text-gray-800 text-sm">Pre-filled Message (Optional):</label>
          <textarea
            value={formData.whatsapp?.message || ''}
            onChange={e => updateFormData('message', e.target.value)}
            rows={3}
            placeholder="Hello!"
            className={INPUT_CLASS}
          />
        </div>
      </div>
    );
  }
  
  export function LinkedInTabForm({ formData, updateFormData }: TabFormProps) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block mb-2 font-semibold text-gray-800 text-sm">Profile Type:</label>
          <select
            value={formData.linkedin?.type || 'profile'}
            onChange={e => updateFormData('type', e.target.value)}
            className={INPUT_CLASS}
          >
            <option value="profile">Personal Profile</option>
            <option value="company">Company Page</option>
          </select>
        </div>
        <div>
          <label className="block mb-2 font-semibold text-gray-800 text-sm">Username / Company ID:</label>
          <div className="relative">
            <i className="fab fa-linkedin absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={formData.linkedin?.username || ''}
              onChange={e => updateFormData('username', e.target.value)}
              placeholder="username"
              className={ICON_INPUT_CLASS}
            />
          </div>
        </div>
      </div>
    );
  }
  
  export function TelegramTabForm({ formData, updateFormData }: TabFormProps) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block mb-2 font-semibold text-gray-800 text-sm">Type:</label>
          <select
            value={formData.telegram?.type || 'user'}
            onChange={e => updateFormData('type', e.target.value)}
            className={INPUT_CLASS}
          >
            <option value="user">User</option>
            <option value="group">Group</option>
            <option value="channel">Channel</option>
          </select>
        </div>
        <div>
          <label className="block mb-2 font-semibold text-gray-800 text-sm">Username:</label>
          <div className="relative">
            <i className="fab fa-telegram absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={formData.telegram?.username || ''}
              onChange={e => updateFormData('username', e.target.value)}
              placeholder="username"
              className={ICON_INPUT_CLASS}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">Without @ symbol</p>
        </div>
      </div>
    );
  }
  
  export function SnapchatTabForm({ formData, updateFormData }: TabFormProps) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block mb-2 font-semibold text-gray-800 text-sm">Snapchat Username:</label>
          <div className="relative">
            <i className="fab fa-snapchat absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={formData.snapchat || ''}
              onChange={e => updateFormData('snapchat', e.target.value)}
              placeholder="username"
              className={ICON_INPUT_CLASS}
            />
          </div>
        </div>
      </div>
    );
  }
  
  export function TwitterTabForm({ formData, updateFormData }: TabFormProps) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block mb-2 font-semibold text-gray-800 text-sm">Twitter Username:</label>
          <div className="relative">
            <i className="fab fa-twitter absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={formData.twitter || ''}
              onChange={e => updateFormData('twitter', e.target.value)}
              placeholder="username"
              className={ICON_INPUT_CLASS}
            />
          </div>
        </div>
      </div>
    );
  }
  
  export function ContactTabForm({ formData, updateFormData }: TabFormProps) {
    const contactFields = [
      { field: 'name', label: 'Name', icon: 'fas fa-user', type: 'text', placeholder: 'John Doe' },
      { field: 'phone', label: 'Phone', icon: 'fas fa-phone', type: 'tel', placeholder: '+1234567890' },
      { field: 'email', label: 'Email', icon: 'fas fa-envelope', type: 'email', placeholder: 'john@example.com' },
      { field: 'website', label: 'Website', icon: 'fas fa-globe', type: 'url', placeholder: 'https://example.com' },
    ];
  
    return (
      <div className="space-y-4">
        {contactFields.map(f => (
          <div key={f.field}>
            <label className="block mb-1.5 font-semibold text-gray-800 text-sm">{f.label}:</label>
            <div className="relative">
              <i className={`${f.icon} absolute left-3 top-1/2 -translate-y-1/2 text-gray-400`} />
              <input
                type={f.type}
                value={(formData.contact as Record<string, string>)?.[f.field] || ''}
                onChange={e => updateFormData(f.field, e.target.value)}
                placeholder={f.placeholder}
                className={ICON_INPUT_CLASS}
              />
            </div>
          </div>
        ))}
        <div>
          <label className="block mb-1.5 font-semibold text-gray-800 text-sm">Address:</label>
          <textarea
            value={formData.contact?.address || ''}
            onChange={e => updateFormData('address', e.target.value)}
            rows={2}
            placeholder="123 Main St, City"
            className={INPUT_CLASS}
          />
        </div>
      </div>
    );
  }
  
  export function PhoneTabForm({ formData, updateFormData }: TabFormProps) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block mb-2 font-semibold text-gray-800 text-sm">Phone Number:</label>
          <div className="relative">
            <i className="fas fa-phone absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={e => updateFormData('phone', e.target.value)}
              placeholder="+1234567890"
              className={ICON_INPUT_CLASS}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">Include country code</p>
        </div>
      </div>
    );
  }
  
  export function SMSTabForm({ formData, updateFormData }: TabFormProps) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block mb-2 font-semibold text-gray-800 text-sm">Phone Number:</label>
          <div className="relative">
            <i className="fas fa-mobile-alt absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="tel"
              value={formData.sms?.number || ''}
              onChange={e => updateFormData('number', e.target.value)}
              placeholder="+1234567890"
              className={ICON_INPUT_CLASS}
            />
          </div>
        </div>
        <div>
          <label className="block mb-2 font-semibold text-gray-800 text-sm">Message:</label>
          <textarea
            value={formData.sms?.message || ''}
            onChange={e => updateFormData('message', e.target.value)}
            rows={3}
            placeholder="Your message"
            className={INPUT_CLASS}
          />
        </div>
      </div>
    );
  }
  
  export function EmailTabForm({ formData, updateFormData }: TabFormProps) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block mb-2 font-semibold text-gray-800 text-sm">Email Address:</label>
          <div className="relative">
            <i className="fas fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              value={formData.email?.address || ''}
              onChange={e => updateFormData('address', e.target.value)}
              placeholder="recipient@example.com"
              className={ICON_INPUT_CLASS}
            />
          </div>
        </div>
        <div>
          <label className="block mb-2 font-semibold text-gray-800 text-sm">Subject:</label>
          <input
            type="text"
            value={formData.email?.subject || ''}
            onChange={e => updateFormData('subject', e.target.value)}
            placeholder="Email Subject"
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className="block mb-2 font-semibold text-gray-800 text-sm">Message:</label>
          <textarea
            value={formData.email?.body || ''}
            onChange={e => updateFormData('body', e.target.value)}
            rows={3}
            placeholder="Email body"
            className={INPUT_CLASS}
          />
        </div>
      </div>
    );
  }
  
  export function WiFiTabForm({ formData, updateFormData }: TabFormProps) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block mb-2 font-semibold text-gray-800 text-sm">Network Name (SSID):</label>
          <div className="relative">
            <i className="fas fa-wifi absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={formData.wifi?.ssid || ''}
              onChange={e => updateFormData('ssid', e.target.value)}
              placeholder="WiFi Name"
              className={ICON_INPUT_CLASS}
            />
          </div>
        </div>
        <div>
          <label className="block mb-2 font-semibold text-gray-800 text-sm">Password:</label>
          <div className="relative">
            <i className="fas fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              value={formData.wifi?.password || ''}
              onChange={e => updateFormData('password', e.target.value)}
              placeholder="WiFi Password"
              className={ICON_INPUT_CLASS}
            />
          </div>
        </div>
        <div>
          <label className="block mb-2 font-semibold text-gray-800 text-sm">Encryption:</label>
          <select
            value={formData.wifi?.encryption || 'WPA'}
            onChange={e => updateFormData('encryption', e.target.value)}
            className={INPUT_CLASS}
          >
            <option value="WPA">WPA/WPA2</option>
            <option value="WEP">WEP</option>
            <option value="nopass">No Encryption</option>
          </select>
        </div>
        <div>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.wifi?.hidden || false}
              onChange={e => updateFormData('hidden', e.target.checked)}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2 cursor-pointer"
            />
            <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Hidden Network</span>
          </label>
        </div>
      </div>
    );
  }