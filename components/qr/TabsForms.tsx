import { auth } from "@/lib/firebase";
import { FormData } from "@/lib/qrEngine";
import {
  ExternalLink,
  Facebook,
  Ghost,
  Instagram,
  Key,
  Link2,
  Linkedin,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Send,
  Smartphone,
  User,
  Wifi,
  X,
  Star,
  Building2,
  Upload,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useEffect, useState } from "react";

interface TabFormProps {
  formData: FormData;
  updateFormData: (field: string, value: string | boolean) => void;
}

const INPUT_CONTAINER = "space-y-1.5";
const LABEL_CLASS =
  "text-xs font-semibold text-slate-500 block mb-1.5 uppercase tracking-wide";
const INPUT_CLASS =
  "w-full bg-white border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-3 px-4 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all";
const ICON_INPUT_CLASS =
  "w-full bg-white border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-3 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all";
const TEXTAREA_CLASS =
  "w-full bg-white border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all resize-none";
const SELECT_CLASS =
  "w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-xs text-slate-700 outline-none focus:border-primary cursor-pointer";
const HINT_CLASS = "text-[10px] text-slate-500 mt-1 block";

export function URLTabForm({ formData, updateFormData }: TabFormProps) {
  return (
    <div className={INPUT_CONTAINER}>
      <label className={LABEL_CLASS}>Enter URL</label>
      <div className="relative">
        <Link2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="url"
          value={formData.url || ""}
          onChange={(e) => updateFormData("url", e.target.value)}
          placeholder="https://example.com"
          className={ICON_INPUT_CLASS}
          required
        />
      </div>
      <span className={HINT_CLASS}>
        Scanners will be forwarded to this web address.
      </span>
    </div>
  );
}

export function TextTabForm({ formData, updateFormData }: TabFormProps) {
  return (
    <div className={INPUT_CONTAINER}>
      <label className={LABEL_CLASS}>Enter Plain Text</label>
      <textarea
        value={formData.text || ""}
        onChange={(e) => updateFormData("text", e.target.value)}
        rows={4}
        placeholder="Type any message, note, or raw text here..."
        className={TEXTAREA_CLASS}
        required
      />
      <span className={HINT_CLASS}>
        Displays this text message upon scanning.
      </span>
    </div>
  );
}

export function InstagramTabForm({ formData, updateFormData }: TabFormProps) {
  return (
    <div className={INPUT_CONTAINER}>
      <label className={LABEL_CLASS}>Instagram Username</label>
      <div className="relative">
        <Instagram className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={formData.instagram || ""}
          onChange={(e) => updateFormData("instagram", e.target.value)}
          placeholder="e.g. champions_league"
          className={ICON_INPUT_CLASS}
          required
        />
      </div>
      <span className={HINT_CLASS}>
        Provide the handle without the '@' symbol.
      </span>
    </div>
  );
}

export function FacebookTabForm({ formData, updateFormData }: TabFormProps) {
  return (
    <div className={INPUT_CONTAINER}>
      <label className={LABEL_CLASS}>Facebook Username or Page ID</label>
      <div className="relative">
        <Facebook className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={formData.facebook || ""}
          onChange={(e) => updateFormData("facebook", e.target.value)}
          placeholder="e.g. SpaceXRockets"
          className={ICON_INPUT_CLASS}
          required
        />
      </div>
      <span className={HINT_CLASS}>
        Routes directly to the Facebook page or profile.
      </span>
    </div>
  );
}

export function WhatsAppTabForm({ formData, updateFormData }: TabFormProps) {
  return (
    <div className="space-y-4">
      <div className={INPUT_CONTAINER}>
        <label className={LABEL_CLASS}>WhatsApp Phone Number</label>
        <div className="relative">
          <MessageSquare className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="tel"
            value={formData.whatsapp?.number || ""}
            onChange={(e) => updateFormData("number", e.target.value)}
            placeholder="e.g. 919999999999 (include country code, no +)"
            className={ICON_INPUT_CLASS}
            required
          />
        </div>
        <span className={HINT_CLASS}>
          Use international digits without plus signs or spaces.
        </span>
      </div>
      <div className={INPUT_CONTAINER}>
        <label className={LABEL_CLASS}>Pre-filled Message (Optional)</label>
        <textarea
          value={formData.whatsapp?.message || ""}
          onChange={(e) => updateFormData("message", e.target.value)}
          rows={3}
          placeholder="Hello, I am interested in your services..."
          className={TEXTAREA_CLASS}
        />
      </div>
    </div>
  );
}

export function LinkedInTabForm({ formData, updateFormData }: TabFormProps) {
  return (
    <div className="space-y-4">
      <div className={INPUT_CONTAINER}>
        <label className={LABEL_CLASS}>LinkedIn Profile Type</label>
        <select
          value={formData.linkedin?.type || "profile"}
          onChange={(e) => updateFormData("type", e.target.value)}
          className={SELECT_CLASS}
        >
          <option value="profile">Personal Profile</option>
          <option value="company">Company Page</option>
        </select>
      </div>
      <div className={INPUT_CONTAINER}>
        <label className={LABEL_CLASS}>Username / Company Handle</label>
        <div className="relative">
          <Linkedin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={formData.linkedin?.username || ""}
            onChange={(e) => updateFormData("username", e.target.value)}
            placeholder="e.g. satyanadella"
            className={ICON_INPUT_CLASS}
            required
          />
        </div>
      </div>
    </div>
  );
}

export function TelegramTabForm({ formData, updateFormData }: TabFormProps) {
  return (
    <div className="space-y-4">
      <div className={INPUT_CONTAINER}>
        <label className={LABEL_CLASS}>Telegram Link Type</label>
        <select
          value={formData.telegram?.type || "user"}
          onChange={(e) => updateFormData("type", e.target.value)}
          className={SELECT_CLASS}
        >
          <option value="user">User Profile</option>
          <option value="group">Group Chat</option>
          <option value="channel">Channel Feed</option>
        </select>
      </div>
      <div className={INPUT_CONTAINER}>
        <label className={LABEL_CLASS}>Username or Invite Code</label>
        <div className="relative">
          <Send className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={formData.telegram?.username || ""}
            onChange={(e) => updateFormData("username", e.target.value)}
            placeholder="e.g. telegram_channel_name"
            className={ICON_INPUT_CLASS}
            required
          />
        </div>
        <span className={HINT_CLASS}>Do not prefix with '@' or 't.me/'.</span>
      </div>
    </div>
  );
}

export function SnapchatTabForm({ formData, updateFormData }: TabFormProps) {
  return (
    <div className={INPUT_CONTAINER}>
      <label className={LABEL_CLASS}>Snapchat Username</label>
      <div className="relative">
        <Ghost className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={formData.snapchat || ""}
          onChange={(e) => updateFormData("snapchat", e.target.value)}
          placeholder="username"
          className={ICON_INPUT_CLASS}
          required
        />
      </div>
    </div>
  );
}

export function TwitterTabForm({ formData, updateFormData }: TabFormProps) {
  return (
    <div className={INPUT_CONTAINER}>
      <label className={LABEL_CLASS}>Twitter / X Username</label>
      <div className="relative">
        <X className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={formData.twitter || ""}
          onChange={(e) => updateFormData("twitter", e.target.value)}
          placeholder="username"
          className={ICON_INPUT_CLASS}
          required
        />
      </div>
    </div>
  );
}

export function ContactTabForm({ formData, updateFormData }: TabFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={INPUT_CONTAINER}>
          <label className={LABEL_CLASS}>Full Name</label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={formData.contact?.name || ""}
              onChange={(e) => updateFormData("name", e.target.value)}
              placeholder="John Doe"
              className={ICON_INPUT_CLASS}
              required
            />
          </div>
        </div>
        <div className={INPUT_CONTAINER}>
          <label className={LABEL_CLASS}>Phone Number</label>
          <div className="relative">
            <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="tel"
              value={formData.contact?.phone || ""}
              onChange={(e) => updateFormData("phone", e.target.value)}
              placeholder="+1234567890"
              className={ICON_INPUT_CLASS}
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={INPUT_CONTAINER}>
          <label className={LABEL_CLASS}>Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="email"
              value={formData.contact?.email || ""}
              onChange={(e) => updateFormData("email", e.target.value)}
              placeholder="john@example.com"
              className={ICON_INPUT_CLASS}
            />
          </div>
        </div>
        <div className={INPUT_CONTAINER}>
          <label className={LABEL_CLASS}>Website URL</label>
          <div className="relative">
            <Link2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="url"
              value={formData.contact?.website || ""}
              onChange={(e) => updateFormData("website", e.target.value)}
              placeholder="https://example.com"
              className={ICON_INPUT_CLASS}
            />
          </div>
        </div>
      </div>
      <div className={INPUT_CONTAINER}>
        <label className={LABEL_CLASS}>Physical Address</label>
        <textarea
          value={formData.contact?.address || ""}
          onChange={(e) => updateFormData("address", e.target.value)}
          rows={2}
          placeholder="e.g. 123 Main St, New York, NY"
          className={TEXTAREA_CLASS}
        />
      </div>
    </div>
  );
}

export function PhoneTabForm({ formData, updateFormData }: TabFormProps) {
  return (
    <div className={INPUT_CONTAINER}>
      <label className={LABEL_CLASS}>Phone Number</label>
      <div className="relative">
        <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="tel"
          value={formData.phone || ""}
          onChange={(e) => updateFormData("phone", e.target.value)}
          placeholder="+1234567890"
          className={ICON_INPUT_CLASS}
          required
        />
      </div>
      <span className={HINT_CLASS}>
        Opens the user's phone keypad with this number preloaded.
      </span>
    </div>
  );
}

export function SMSTabForm({ formData, updateFormData }: TabFormProps) {
  return (
    <div className="space-y-4">
      <div className={INPUT_CONTAINER}>
        <label className={LABEL_CLASS}>Phone Number</label>
        <div className="relative">
          <Smartphone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="tel"
            value={formData.sms?.number || ""}
            onChange={(e) => updateFormData("number", e.target.value)}
            placeholder="+1234567890"
            className={ICON_INPUT_CLASS}
            required
          />
        </div>
      </div>
      <div className={INPUT_CONTAINER}>
        <label className={LABEL_CLASS}>SMS Message body</label>
        <textarea
          value={formData.sms?.message || ""}
          onChange={(e) => updateFormData("message", e.target.value)}
          rows={3}
          placeholder="Pre-composed SMS text..."
          className={TEXTAREA_CLASS}
        />
      </div>
    </div>
  );
}

export function EmailTabForm({ formData, updateFormData }: TabFormProps) {
  return (
    <div className="space-y-4">
      <div className={INPUT_CONTAINER}>
        <label className={LABEL_CLASS}>Recipient Email</label>
        <div className="relative">
          <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="email"
            value={formData.email?.address || ""}
            onChange={(e) => updateFormData("address", e.target.value)}
            placeholder="hello@company.com"
            className={ICON_INPUT_CLASS}
            required
          />
        </div>
      </div>
      <div className={INPUT_CONTAINER}>
        <label className={LABEL_CLASS}>Email Subject</label>
        <input
          type="text"
          value={formData.email?.subject || ""}
          onChange={(e) => updateFormData("subject", e.target.value)}
          placeholder="e.g. Sales Inquiry"
          className={INPUT_CLASS}
        />
      </div>
      <div className={INPUT_CONTAINER}>
        <label className={LABEL_CLASS}>Email Message Body</label>
        <textarea
          value={formData.email?.body || ""}
          onChange={(e) => updateFormData("body", e.target.value)}
          rows={3}
          placeholder="Type email body content here..."
          className={TEXTAREA_CLASS}
        />
      </div>
    </div>
  );
}

export function WiFiTabForm({ formData, updateFormData }: TabFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={INPUT_CONTAINER}>
          <label className={LABEL_CLASS}>SSID (Network Name)</label>
          <div className="relative">
            <Wifi className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={formData.wifi?.ssid || ""}
              onChange={(e) => updateFormData("ssid", e.target.value)}
              placeholder="e.g. Starbucks_Guest"
              className={ICON_INPUT_CLASS}
              required
            />
          </div>
        </div>
        <div className={INPUT_CONTAINER}>
          <label className={LABEL_CLASS}>Password</label>
          <div className="relative">
            <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={formData.wifi?.password || ""}
              onChange={(e) => updateFormData("password", e.target.value)}
              placeholder="Network Password"
              className={ICON_INPUT_CLASS}
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={INPUT_CONTAINER}>
          <label className={LABEL_CLASS}>Security Encryption</label>
          <select
            value={formData.wifi?.encryption || "WPA"}
            onChange={(e) => updateFormData("encryption", e.target.value)}
            className={SELECT_CLASS}
          >
            <option value="WPA">WPA / WPA2</option>
            <option value="WEP">WEP</option>
            <option value="nopass">None (Open)</option>
          </select>
        </div>
        <div className="flex items-center pt-6">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.wifi?.hidden || false}
              onChange={(e) => updateFormData("hidden", e.target.checked)}
              className="w-4 h-4 text-primary bg-slate-50 border-slate-200 rounded focus:ring-primary focus:ring-2 cursor-pointer focus:ring-offset-white focus:ring-offset-1"
            />
            <span className="text-xs text-slate-600 group-hover:text-[#001B50] transition-colors select-none font-semibold">
              Hidden SSID Network
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

export function AppDownloadTabForm({ formData, updateFormData }: TabFormProps) {
  return (
    <div className="space-y-4">
      <div className={INPUT_CONTAINER}>
        <label className={LABEL_CLASS}>iOS App Store URL</label>
        <div className="relative">
          <Smartphone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="url"
            value={formData.app_download?.iosUrl || ""}
            onChange={(e) => updateFormData("iosUrl", e.target.value)}
            placeholder="https://apps.apple.com/app/your-app-id"
            className={ICON_INPUT_CLASS}
          />
        </div>
      </div>
      <div className={INPUT_CONTAINER}>
        <label className={LABEL_CLASS}>Android Google Play Store URL</label>
        <div className="relative">
          <Smartphone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="url"
            value={formData.app_download?.androidUrl || ""}
            onChange={(e) => updateFormData("androidUrl", e.target.value)}
            placeholder="https://play.google.com/store/apps/details?id=your.package"
            className={ICON_INPUT_CLASS}
          />
        </div>
      </div>
      <div className={INPUT_CONTAINER}>
        <label className={LABEL_CLASS}>
          Fallback Redirect URL (Desktop/Web)
        </label>
        <div className="relative">
          <Link2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="url"
            value={formData.app_download?.fallbackUrl || ""}
            onChange={(e) => updateFormData("fallbackUrl", e.target.value)}
            placeholder="https://yourwebsite.com/app"
            className={ICON_INPUT_CLASS}
            required
          />
        </div>
        <span className={HINT_CLASS}>
          Scanners will be routed dynamically based on their mobile OS.
        </span>
      </div>
    </div>
  );
}

export function LandingPageTabForm({ formData, updateFormData }: TabFormProps) {
  const [landingPages, setLandingPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLandingPages() {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          // If auth isn't initialized yet, try again or return
          setLoading(false);
          return;
        }

        const token = await currentUser.getIdToken();
        const res = await fetch("/api/landing-pages", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch landing pages");
        const data = await res.json();
        if (data.success) {
          setLandingPages(data.landingPages || []);
        } else {
          throw new Error(data.error || "Failed to fetch landing pages");
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    // Wait a bit or fetch on state change, but firebase auth can load asynchronously.
    // Let's run when auth state is resolved or directly on mount.
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchLandingPages();
      } else {
        // If not logged in after check
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-slate-400 space-y-2">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="text-xs">Loading your landing pages...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6 text-red-400 text-xs">
        <p>Error: {error}</p>
        <button
          onClick={() => {
            setLoading(true);
            setError(null);
          }}
          className="mt-2 text-primary hover:underline font-semibold"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (landingPages.length === 0) {
    return (
      <div className="text-center py-6 px-4 space-y-4">
        <p className="text-xs text-slate-500">
          You haven't created any custom landing pages or digital cards yet.
        </p>
        <a
          href="/dashboard/pages/new"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all border-none"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Landing Page</span>
        </a>
      </div>
    );
  }

  const selectedValue = formData.landing_page?.landingPageId || "";

  return (
    <div className={INPUT_CONTAINER}>
      <label className={LABEL_CLASS}>Select Custom Landing Page</label>
      <select
        value={selectedValue}
        onChange={(e) => updateFormData("landingPageId", e.target.value)}
        className={SELECT_CLASS}
        required
      >
        <option value="" disabled>
          -- Select a landing page --
        </option>
        {landingPages.map((page) => (
          <option key={page.id} value={page.id}>
            {page.title} ({page.slug})
          </option>
        ))}
      </select>
      <span className={HINT_CLASS}>
        Scanners will be redirected to your interactive, mobile-optimized page.
      </span>
      {selectedValue && (
        <div className="mt-4 pt-4 border-t border-slate-200/85 flex items-center justify-between">
          <span className="text-[10px] text-slate-500">
            Selected Page:{" "}
            <strong className="text-[#001B50]">
              {
                landingPages.find((p) => String(p.id) === String(selectedValue))
                  ?.title
              }
            </strong>
          </span>
          <a
            href={`/p/${landingPages.find((p) => String(p.id) === String(selectedValue))?.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-primary hover:underline flex items-center gap-1"
          >
            <span>View page</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
}

export function ReviewTabForm({ formData, updateFormData }: TabFormProps) {
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 1MB)
    if (file.size > 1024 * 1024) {
      alert("Please upload a file smaller than 1MB.");
      return;
    }

    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a valid PNG, JPG, or SVG image.");
      return;
    }

    setUploadingLogo(true);
    try {
      const uploadData = new globalThis.FormData();
      uploadData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Upload failed");

      updateFormData("logoUrl", json.url);
    } catch (err) {
      console.error("Logo upload error:", err);
      alert("Failed to upload logo. Please try again.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const removeLogo = () => {
    updateFormData("logoUrl", "");
  };

  return (
    <div className="space-y-4">
      {/* Business Logo Upload */}
      <div className={INPUT_CONTAINER}>
        <label className={LABEL_CLASS}>Business Logo</label>
        {formData.review?.logoUrl ? (
          <div className="flex items-center gap-4 p-3 bg-white border border-slate-200 rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={formData.review.logoUrl}
              alt="Business Logo"
              className="w-12 h-12 rounded-full object-cover border border-slate-200 bg-slate-50"
            />
            <div className="flex-1">
              <span className="text-xs font-semibold text-slate-800 block">Logo Uploaded</span>
              <span className="text-[10px] text-slate-500">Stored in cloud bucket</span>
            </div>
            <button
              type="button"
              onClick={removeLogo}
              className="text-xs text-red-650 hover:text-red-700 bg-red-50 hover:bg-red-100/60 px-3 py-1.5 rounded-lg border border-red-200 transition-all font-semibold cursor-pointer"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 hover:border-primary/50 text-slate-650 rounded-xl text-xs font-semibold cursor-pointer transition-all shadow-xs w-full justify-center">
              {uploadingLogo ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span>Uploading to Cloud...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 text-slate-550" />
                  <span>Upload Business Logo (Max 1MB)</span>
                </>
              )}
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.svg"
                onChange={handleLogoUpload}
                disabled={uploadingLogo}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>

      {/* Brand Name */}
      <div className={INPUT_CONTAINER}>
        <label className={LABEL_CLASS}>Business or Brand Name</label>
        <div className="relative">
          <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={formData.review?.businessName || ""}
            onChange={(e) => updateFormData("businessName", e.target.value)}
            placeholder="e.g. Acme Cafe"
            className={ICON_INPUT_CLASS}
            required
          />
        </div>
        <span className={HINT_CLASS}>
          This name will appear on your Review Landing Page.
        </span>
      </div>
      
      {/* Public Review URL */}
      <div className={INPUT_CONTAINER}>
        <label className={LABEL_CLASS}>Public Review URL</label>
        <div className="relative">
          <Star className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="url"
            value={formData.review?.publicReviewUrl || ""}
            onChange={(e) => updateFormData("publicReviewUrl", e.target.value)}
            placeholder="https://g.page/r/.../review"
            className={ICON_INPUT_CLASS}
            required
          />
        </div>
        <span className={HINT_CLASS}>
          Users who rate you high will be sent to this link (e.g. Google Maps, Trustpilot).
        </span>
      </div>

      {/* Redirect Threshold */}
      <div className={INPUT_CONTAINER}>
        <label className={LABEL_CLASS}>Redirect Positive Ratings of</label>
        <select
          value={formData.review?.positiveThreshold || 4}
          onChange={(e) => updateFormData("positiveThreshold", e.target.value)}
          className={SELECT_CLASS}
        >
          <option value={4}>4 Stars and Above (Recommended)</option>
          <option value={5}>5 Stars Only (Strict Filter)</option>
        </select>
        <span className={HINT_CLASS}>
          Lower ratings will collect private feedback in your dashboard instead.
        </span>
      </div>

      {/* Accordion for custom messages */}
      <div className="pt-2 border-t border-slate-200">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center justify-between w-full py-2 text-xs font-bold text-slate-655 hover:text-[#001B50] transition-colors cursor-pointer select-none"
        >
          <span>Advanced Message Customization</span>
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAdvanced && (
          <div className="space-y-4 mt-3 pt-3 border-t border-slate-200/80 animate-fade-in">
            {/* Welcome message */}
            <div className={INPUT_CONTAINER}>
              <label className={LABEL_CLASS}>Custom Welcome Header</label>
              <input
                type="text"
                value={formData.review?.welcomeMessage || ""}
                onChange={(e) => updateFormData("welcomeMessage", e.target.value)}
                placeholder="e.g. How was your experience?"
                className={INPUT_CLASS}
              />
              <span className={HINT_CLASS}>Default: "How was your experience?"</span>
            </div>

            {/* Private feedback prompt */}
            <div className={INPUT_CONTAINER}>
              <label className={LABEL_CLASS}>Low Rating feedback prompt</label>
              <textarea
                value={formData.review?.privateFeedbackMessage || ""}
                onChange={(e) => updateFormData("privateFeedbackMessage", e.target.value)}
                placeholder="e.g. We are sorry to hear that your experience wasn't perfect. Please let us know how we can improve."
                rows={2}
                className={TEXTAREA_CLASS}
              />
              <span className={HINT_CLASS}>Shown for low ratings. Default: "We are sorry to hear that your experience wasn't perfect..."</span>
            </div>

            {/* Thank you message */}
            <div className={INPUT_CONTAINER}>
              <label className={LABEL_CLASS}>Submission Thank You Message</label>
              <textarea
                value={formData.review?.thankYouMessage || ""}
                onChange={(e) => updateFormData("thankYouMessage", e.target.value)}
                placeholder="e.g. Your feedback has been submitted successfully. We appreciate your time and will use this to improve our service."
                rows={2}
                className={TEXTAREA_CLASS}
              />
              <span className={HINT_CLASS}>Shown after submission. Default: "Your feedback has been submitted successfully..."</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface TabFormRendererProps extends TabFormProps {
  activeTab: string;
}

export function TabFormRenderer({
  activeTab,
  formData,
  updateFormData,
}: TabFormRendererProps) {
  switch (activeTab) {
    case "url":
      return <URLTabForm formData={formData} updateFormData={updateFormData} />;
    case "text":
      return (
        <TextTabForm formData={formData} updateFormData={updateFormData} />
      );
    case "instagram":
      return (
        <InstagramTabForm formData={formData} updateFormData={updateFormData} />
      );
    case "facebook":
      return (
        <FacebookTabForm formData={formData} updateFormData={updateFormData} />
      );
    case "whatsapp":
      return (
        <WhatsAppTabForm formData={formData} updateFormData={updateFormData} />
      );
    case "linkedin":
      return (
        <LinkedInTabForm formData={formData} updateFormData={updateFormData} />
      );
    case "telegram":
      return (
        <TelegramTabForm formData={formData} updateFormData={updateFormData} />
      );
    case "snapchat":
      return (
        <SnapchatTabForm formData={formData} updateFormData={updateFormData} />
      );
    case "twitter":
      return (
        <TwitterTabForm formData={formData} updateFormData={updateFormData} />
      );
    case "contact":
      return (
        <ContactTabForm formData={formData} updateFormData={updateFormData} />
      );
    case "phone":
      return (
        <PhoneTabForm formData={formData} updateFormData={updateFormData} />
      );
    case "sms":
      return <SMSTabForm formData={formData} updateFormData={updateFormData} />;
    case "email":
      return (
        <EmailTabForm formData={formData} updateFormData={updateFormData} />
      );
    case "wifi":
      return (
        <WiFiTabForm formData={formData} updateFormData={updateFormData} />
      );
    case "app_download":
      return (
        <AppDownloadTabForm
          formData={formData}
          updateFormData={updateFormData}
        />
      );
    case "landing_page":
      return (
        <LandingPageTabForm
          formData={formData}
          updateFormData={updateFormData}
        />
      );
    case "review":
      return (
        <ReviewTabForm
          formData={formData}
          updateFormData={updateFormData}
        />
      );
    default:
      return null;
  }
}
