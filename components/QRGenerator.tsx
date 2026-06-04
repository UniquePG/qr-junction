"use client";

import {
  AlertCircle,
  Dot,
  Download,
  Frame,
  Grid2X2,
  Image as ImageIcon,
  PaintBucket,
  Palette,
  QrCode,
  Ruler,
  Square,
  Target,
  Wand2,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";

import type { QRConfig } from "@/types/qrTypes";
import { DEFAULT_QR_CONFIG } from "@/types/qrTypes";
import { downloadPreview } from "@/utils/downloadPreview";

import {
  trackQRCodeGeneration,
  trackTabSwitch,
  type QRCodeType,
} from "@/lib/analytics";

import {
  FormData,
  TABS,
  TabType,
  formatQRData,
  validateForm,
} from "@/lib/qrEngine";

// Lazy-load the QR preview (canvas needs client environment)
import type { QRPreviewHandle } from "@/components/qr/QRPreview";

const QRPreview = dynamic(() => import("@/components/qr/QRPreview"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-[300px] h-[300px] bg-slate-50 border border-slate-200 rounded-xl animate-pulse">
      <span className="text-slate-500 text-sm">Loading Preview...</span>
    </div>
  ),
});

// Customizer Controls
import FrameRenderer from "@/components/qr/FrameRenderer";
import { TabFormRenderer } from "@/components/qr/TabsForms";
import BackgroundCustomizer from "@/components/qr/controls/BackgroundCustomizer";
import CornerDotsCustomizer from "@/components/qr/controls/CornerDotsCustomizer";
import CornerSquaresCustomizer from "@/components/qr/controls/CornerSquaresCustomizer";
import DotsCustomizer from "@/components/qr/controls/DotsCustomizer";
import DownloadControls from "@/components/qr/controls/DownloadControls";
import ErrorCorrectionControl from "@/components/qr/controls/ErrorCorrectionControl";
import FrameSelector from "@/components/qr/controls/FrameSelector";
import LogoCustomizer from "@/components/qr/controls/LogoCustomizer";
import PresetStyles from "@/components/qr/controls/PresetStyles";
import SizeControls from "@/components/qr/controls/SizeControls";

interface QRGeneratorProps {
  initialUrl?: string;
}

export default function QRGenerator({ initialUrl }: QRGeneratorProps) {
  const [activeTab, setActiveTab] = useState<TabType>("url");
  const [formData, setFormData] = useState<FormData>(() => {
    return initialUrl ? { url: initialUrl } : {};
  });
  const [qrValue, setQrValue] = useState<string>(initialUrl || "");
  const [error, setError] = useState<string>("");
  const [qrConfig, setQrConfig] = useState<QRConfig>(DEFAULT_QR_CONFIG);
  const [eclLockedToH, setEclLockedToH] = useState(false);
  const [customCategory, setCustomCategory] = useState<
    "presets" | "shapes" | "branding" | "technical"
  >("presets");

  const qrPreviewRef = useRef<QRPreviewHandle | null>(null);
  const previewCaptureRef = useRef<HTMLDivElement | null>(null);

  // Config updaters
  const updateConfig = useCallback((partial: Partial<QRConfig>) => {
    setQrConfig((prev) => ({ ...prev, ...partial }));
  }, []);

  const applyPreset = useCallback((partial: Partial<QRConfig>) => {
    setQrConfig((prev) => ({
      ...prev,
      ...partial,
      dots: { ...prev.dots, ...partial.dots },
      cornerSquares: { ...prev.cornerSquares, ...partial.cornerSquares },
      cornerDots: { ...prev.cornerDots, ...partial.cornerDots },
      background: { ...prev.background, ...partial.background },
    }));
  }, []);

  // Form data updater
  const updateFormData = (field: string, value: string | boolean) => {
    if (activeTab === "whatsapp") {
      setFormData((prev) => ({
        ...prev,
        whatsapp: { ...prev.whatsapp, [field]: value } as FormData["whatsapp"],
      }));
    } else if (activeTab === "linkedin") {
      setFormData((prev) => ({
        ...prev,
        linkedin: { ...prev.linkedin, [field]: value } as FormData["linkedin"],
      }));
    } else if (activeTab === "telegram") {
      setFormData((prev) => ({
        ...prev,
        telegram: { ...prev.telegram, [field]: value } as FormData["telegram"],
      }));
    } else if (activeTab === "contact") {
      setFormData((prev) => ({
        ...prev,
        contact: { ...prev.contact, [field]: value } as FormData["contact"],
      }));
    } else if (activeTab === "sms") {
      setFormData((prev) => ({
        ...prev,
        sms: { ...prev.sms, [field]: value } as FormData["sms"],
      }));
    } else if (activeTab === "email") {
      setFormData((prev) => ({
        ...prev,
        email: { ...prev.email, [field]: value } as FormData["email"],
      }));
    } else if (activeTab === "wifi") {
      setFormData((prev) => ({
        ...prev,
        wifi: { ...prev.wifi, [field]: value } as FormData["wifi"],
      }));
    } else if (activeTab === "app_download") {
      setFormData((prev) => ({
        ...prev,
        app_download: {
          ...prev.app_download,
          [field]: value,
        } as FormData["app_download"],
      }));
    } else if (activeTab === "landing_page") {
      setFormData((prev) => ({
        ...prev,
        landing_page: {
          ...prev.landing_page,
          [field]: value,
        } as FormData["landing_page"],
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  // Frame-aware download
  const handleDownload = async () => {
    const canvas = qrPreviewRef.current?.getCanvas();
    if (!canvas) return;
    await downloadPreview({
      qrCanvas: canvas,
      frameConfig: qrConfig.frame,
      downloadConfig: qrConfig.download,
    });
  };

  // Generate QR value
  const handleGenerate = () => {
    setError("");
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
    <div className="w-full space-y-8 animate-fade-in-up relative z-10">
      {/* Header bar */}
      <div className="bg-white border border-slate-200/80 px-6 sm:px-8 py-6 rounded-3xl shadow-md">
        <h2 className="text-[#001B50] font-extrabold text-2xl flex items-center gap-2.5">
          <QrCode className="w-7 h-7 text-primary" /> Advanced QR Designer
          Canvas
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm mt-1.5 font-medium">
          Design, style, and export highly customizable vector or raster QR
          codes with analytics
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Workspace (Step 1 & Step 2) - lg:col-span-8 */}
        <div className="lg:col-span-8 space-y-8">
          {/* STEP 1: Enter Content Details Card */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
            <div>
              <h3 className="font-extrabold text-sm text-[#001B50] tracking-tight flex items-center gap-2.5 uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-primary text-white text-[11px] flex items-center justify-center font-bold">
                  1
                </span>
                Step 1: Choose Type & Enter Details
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                Select your QR type and fill in the required fields
              </p>
            </div>

            {/* Tab Strip selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                Select QR Type
              </label>
              <div className="relative -mx-2 px-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white/90 to-transparent z-10 rounded-l-lg" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white/90 to-transparent z-10 rounded-r-lg" />
                <div className="overflow-x-auto scrollbar-none pb-2">
                  <div className="flex gap-2 min-w-max pr-1">
                    {TABS.map((tab) => {
                      const Icon = tab.Icon;
                      const isSelected = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => {
                            const prev = activeTab;
                            setActiveTab(tab.id as TabType);
                            setQrValue("");
                            setError("");
                            if (prev !== tab.id) trackTabSwitch(prev, tab.id);
                          }}
                          className={`px-3.5 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap text-xs cursor-pointer ${
                            isSelected
                              ? "bg-primary text-white shadow-primary shadow-sm border border-transparent"
                              : "bg-slate-50 border border-slate-200 text-slate-650 hover:text-[#001B50] hover:bg-slate-100"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Form input fields */}
            <div className="bg-slate-50/50 rounded-2xl border border-slate-200/80 p-6 min-h-[220px] flex flex-col justify-center">
              <TabFormRenderer
                activeTab={activeTab}
                formData={formData}
                updateFormData={updateFormData}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-950/20 border border-red-900/40 text-red-400 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />{" "}
                {error}
              </div>
            )}

            {/* Generate Button */}
            <button
              type="button"
              onClick={handleGenerate}
              className="w-full py-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm shadow-primary hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2 border-none"
            >
              <Wand2 className="w-4 h-4" />
              <span>Generate QR Code</span>
            </button>
          </div>

          {/* STEP 2: Customize QR Design Card */}
          <div className="bg-white border border-slate-200/80 rounded-3xl shadow-md overflow-hidden">
            {/* Card Header */}
            <div className="px-6 sm:px-8 py-5 border-b border-slate-200/85">
              <h3 className="font-extrabold text-sm text-[#001B50] tracking-tight flex items-center gap-2.5 uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-primary text-white text-[11px] flex items-center justify-center font-bold">
                  2
                </span>
                Step 2: Customize QR Design
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                Add color themes, frame designs, logos, and modify shapes
              </p>
            </div>

            {/* Customization Category Tabs */}
            <div className="relative border-b border-slate-200/85">
              <div className="overflow-x-auto scrollbar-none">
                <div className="flex w-full min-w-[360px]">
                  <button
                    type="button"
                    onClick={() => setCustomCategory("presets")}
                    className={`flex-1 py-3.5 text-center border-b-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap px-2 ${
                      customCategory === "presets"
                        ? "border-primary text-primary bg-primary/5"
                        : "border-transparent text-slate-500 hover:text-[#001B50] hover:bg-slate-50"
                    }`}
                  >
                    <Palette className="w-3.5 h-3.5" />
                    <span>Colors & Presets</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomCategory("shapes")}
                    className={`flex-1 py-3.5 text-center border-b-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap px-2 ${
                      customCategory === "shapes"
                        ? "border-primary text-primary bg-primary/5"
                        : "border-transparent text-slate-500 hover:text-[#001B50] hover:bg-slate-50"
                    }`}
                  >
                    <Grid2X2 className="w-3.5 h-3.5" />
                    <span>Shapes</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomCategory("branding")}
                    className={`flex-1 py-3.5 text-center border-b-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap px-2 ${
                      customCategory === "branding"
                        ? "border-primary text-primary bg-primary/5"
                        : "border-transparent text-slate-500 hover:text-[#001B50] hover:bg-slate-50"
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Logo & Frame</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomCategory("technical")}
                    className={`flex-1 py-3.5 text-center border-b-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap px-2 ${
                      customCategory === "technical"
                        ? "border-primary text-primary bg-primary/5"
                        : "border-transparent text-slate-500 hover:text-[#001B50] hover:bg-slate-50"
                    }`}
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>Settings</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Customizer Tab Content */}
            <div className="bg-transparent">
              {/* Presets & Colors */}
              {customCategory === "presets" && (
                <div className="p-6 sm:p-8 space-y-6 animate-fade-in">
                  <div>
                    <h4 className="text-xs font-bold text-[#001B50] uppercase tracking-wide mb-3 flex items-center gap-1.5">
                      <Palette className="w-4 h-4 text-primary" /> Preset Themes
                    </h4>
                    <PresetStyles onApply={applyPreset} />
                  </div>
                  <div className="border-t border-slate-200/80 pt-6">
                    <h4 className="text-xs font-bold text-[#001B50] uppercase tracking-wide mb-3 flex items-center gap-1.5">
                      <PaintBucket className="w-4 h-4 text-primary" />{" "}
                      Background Color
                    </h4>
                    <BackgroundCustomizer
                      background={qrConfig.background}
                      onChange={(bg) => updateConfig({ background: bg })}
                    />
                  </div>
                </div>
              )}

              {/* Shapes */}
              {customCategory === "shapes" && (
                <div className="p-6 sm:p-8 space-y-6 animate-fade-in">
                  <div>
                    <h4 className="text-xs font-bold text-[#001B50] uppercase tracking-wide mb-3 flex items-center gap-1.5">
                      <Dot className="w-4 h-4 text-primary" /> Body Pattern &
                      Color
                    </h4>
                    <DotsCustomizer
                      dots={qrConfig.dots}
                      onChange={(dots) => updateConfig({ dots })}
                    />
                  </div>
                  <div className="border-t border-slate-200/80 pt-6">
                    <h4 className="text-xs font-bold text-[#001B50] uppercase tracking-wide mb-3 flex items-center gap-1.5">
                      <Grid2X2 className="w-4 h-4 text-primary" /> Corner Square
                      Shape
                    </h4>
                    <CornerSquaresCustomizer
                      cornerSquares={qrConfig.cornerSquares}
                      onChange={(cs) => updateConfig({ cornerSquares: cs })}
                    />
                  </div>
                  <div className="border-t border-slate-200/80 pt-6">
                    <h4 className="text-xs font-bold text-[#001B50] uppercase tracking-wide mb-3 flex items-center gap-1.5">
                      <Dot className="w-4 h-4 text-primary" /> Corner Dot Shape
                    </h4>
                    <CornerDotsCustomizer
                      cornerDots={qrConfig.cornerDots}
                      onChange={(cd) => updateConfig({ cornerDots: cd })}
                    />
                  </div>
                </div>
              )}

              {/* Branding / Frames */}
              {customCategory === "branding" && (
                <div className="p-6 sm:p-8 space-y-6 animate-fade-in">
                  <div>
                    <h4 className="text-xs font-bold text-[#001B50] uppercase tracking-wide mb-3 flex items-center gap-1.5 justify-between">
                      <span className="flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-primary" /> Brand
                        Logo Icon
                      </span>
                      {qrConfig.logo && (
                        <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold uppercase">
                          Active
                        </span>
                      )}
                    </h4>
                    <LogoCustomizer
                      logo={qrConfig.logo}
                      onChange={(logo) => updateConfig({ logo })}
                      onEclLocked={setEclLockedToH}
                    />
                  </div>
                  <div className="border-t border-slate-200/80 pt-6">
                    <h4 className="text-xs font-bold text-[#001B50] uppercase tracking-wide mb-3 flex items-center gap-1.5 justify-between">
                      <span className="flex items-center gap-1.5">
                        <Frame className="w-4 h-4 text-primary" /> QR Frame &
                        Templates
                      </span>
                      {qrConfig.frame.templateId && (
                        <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold uppercase">
                          Active
                        </span>
                      )}
                    </h4>
                    <FrameSelector
                      frame={qrConfig.frame}
                      onChange={(frame) => updateConfig({ frame })}
                    />
                  </div>
                </div>
              )}

              {/* Technical Settings */}
              {customCategory === "technical" && (
                <div className="p-6 sm:p-8 space-y-6 animate-fade-in">
                  <div>
                    <h4 className="text-xs font-bold text-[#001B50] uppercase tracking-wide mb-3 flex items-center gap-1.5">
                      <Ruler className="w-4 h-4 text-primary" /> Size & Margins
                    </h4>
                    <SizeControls
                      size={qrConfig.size}
                      onChange={(size) => updateConfig({ size })}
                    />
                  </div>
                  <div className="border-t border-slate-200/80 pt-6">
                    <h4 className="text-xs font-bold text-[#001B50] uppercase tracking-wide mb-3 flex items-center gap-1.5 justify-between">
                      <span className="flex items-center gap-1.5">
                        <Target className="w-4 h-4 text-primary" /> Error
                        Correction Level
                      </span>
                      {eclLockedToH && (
                        <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full font-bold uppercase">
                          Locked H
                        </span>
                      )}
                    </h4>
                    <ErrorCorrectionControl
                      level={qrConfig.errorCorrectionLevel}
                      onChange={(ecl) =>
                        updateConfig({ errorCorrectionLevel: ecl })
                      }
                      lockedToH={eclLockedToH}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sticky Preview Card - lg:col-span-4 */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-md flex flex-col items-center gap-6">
            {/* Header */}
            <div className="flex items-center justify-between w-full border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-500 text-xs uppercase tracking-wider">
                Live Preview
              </h3>
              {qrValue ? (
                <span className="text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                  Live
                </span>
              ) : (
                <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Draft
                </span>
              )}
            </div>

            {/* Live preview — full content visible, QR scaled via display size only */}
            <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5 overflow-auto max-h-[min(70vh,520px)]">
              {qrValue ? (
                <div className="flex justify-center w-full min-h-[120px]">
                  <FrameRenderer frameConfig={qrConfig.frame}>
                    <QRPreview
                      ref={qrPreviewRef}
                      value={qrValue}
                      config={qrConfig}
                      previewMaxPx={260}
                    />
                  </FrameRenderer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-12 px-6 space-y-3 min-h-[200px]">
                  <Square className="w-10 h-10 text-slate-300 stroke-dasharray animate-pulse" />
                  <p className="text-xs text-slate-500 max-w-[180px]">
                    Enter details on the left and click{" "}
                    <strong className="text-primary font-bold">
                      Generate QR Code
                    </strong>
                  </p>
                </div>
              )}
            </div>

            {/* Download Buttons and controls */}
            {qrValue && (
              <button
                type="button"
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all shadow-md active:scale-98 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download QR Code</span>
              </button>
            )}

            <div className="w-full border-t border-slate-200 pt-4">
              <DownloadControls
                config={qrConfig.download}
                onChange={(dl) => updateConfig({ download: dl })}
                qrRef={qrPreviewRef}
                hasQRValue={!!qrValue}
                onDownload={handleDownload}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
