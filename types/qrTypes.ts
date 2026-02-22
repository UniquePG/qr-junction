// ─── Gradient ────────────────────────────────────────────────────────────────
export type GradientType = 'linear' | 'radial';

export interface GradientColorStop {
  offset: number; // 0–1
  color: string;
}

export interface GradientConfig {
  type: GradientType;
  rotation?: number; // degrees (linear only)
  colorStops: GradientColorStop[];
}

// ─── Dot / Corner styles (must match qr-code-styling identifiers) ─────────────
export type DotType =
  | 'square'
  | 'rounded'
  | 'dots'
  | 'classy'
  | 'classy-rounded'
  | 'extra-rounded';

export type CornerSquareType = 'square' | 'dot' | 'extra-rounded';
export type CornerDotType = 'square' | 'dot';

// ─── Dots (body) ─────────────────────────────────────────────────────────────
export interface QRDotsConfig {
  type: DotType;
  color: string;
  gradient?: GradientConfig;
}

// ─── Corner Squares ───────────────────────────────────────────────────────────
export interface QRCornerSquareConfig {
  type: CornerSquareType;
  color: string;
  gradient?: GradientConfig;
}

// ─── Corner Dots ─────────────────────────────────────────────────────────────
export interface QRCornerDotConfig {
  type: CornerDotType;
  color: string;
  gradient?: GradientConfig;
}

// ─── Background ───────────────────────────────────────────────────────────────
export interface QRBackgroundConfig {
  color: string;
  gradient?: GradientConfig;
  transparent: boolean;
  borderRadius: number; // px, for the outer container
}

// ─── Logo / Image ─────────────────────────────────────────────────────────────
export interface QRLogoConfig {
  src: string; // base64 data URL
  size: number; // 0.1 – 0.4 (fraction of QR size)
  margin: number; // px
  hideBackgroundDots: boolean;
  crossOrigin?: string;
}

// ─── Size & Margin ────────────────────────────────────────────────────────────
export interface QRSizeConfig {
  width: number;
  height: number;
  margin: number;
}

// ─── Download ─────────────────────────────────────────────────────────────────
export type DownloadFormat = 'png' | 'svg' | 'jpeg' | 'webp';
export type DownloadScale = 1 | 2 | 3;

export interface QRDownloadConfig {
  format: DownloadFormat;
  fileName: string;
  scale: DownloadScale;
}

// ─── Error Correction ─────────────────────────────────────────────────────────
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

// ─── Frame ────────────────────────────────────────────────────────────────────
export interface QRFrameConfig {
  templateId: string | null; // null = no frame
  title: string;
  subtitle: string;
  cta: string;
  primaryColor: string;
  textColor: string;
}

// ─── Master QR Config ─────────────────────────────────────────────────────────
export interface QRConfig {
  dots: QRDotsConfig;
  cornerSquares: QRCornerSquareConfig;
  cornerDots: QRCornerDotConfig;
  background: QRBackgroundConfig;
  logo: QRLogoConfig | null;
  size: QRSizeConfig;
  download: QRDownloadConfig;
  errorCorrectionLevel: ErrorCorrectionLevel;
  frame: QRFrameConfig;
}

// ─── Default Config ───────────────────────────────────────────────────────────
export const DEFAULT_QR_CONFIG: QRConfig = {
  dots: {
    type: 'square',
    color: '#000000',
  },
  cornerSquares: {
    type: 'square',
    color: '#000000',
  },
  cornerDots: {
    type: 'square',
    color: '#000000',
  },
  background: {
    color: '#ffffff',
    transparent: false,
    borderRadius: 0,
  },
  logo: null,
  size: {
    width: 300,
    height: 300,
    margin: 10,
  },
  download: {
    format: 'png',
    fileName: 'qrcode',
    scale: 1,
  },
  errorCorrectionLevel: 'M',
  frame: {
    templateId: null,
    title: '',
    subtitle: '',
    cta: '',
    primaryColor: '#4361ee',
    textColor: '#ffffff',
  },
};
