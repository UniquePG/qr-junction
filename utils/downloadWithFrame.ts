/**
 * downloadWithFrame.ts
 *
 * Canvas-based download that composites the QR image with the frame template.
 * Uses only the native Canvas 2D API — no extra dependencies.
 */

import { FRAME_TEMPLATES } from '@/config/frameTemplates';
import type { QRDownloadConfig, QRFrameConfig } from '@/types/qrTypes';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Parse a CSS color string to RGBA components (best-effort). */
function parseColor(color: string): string {
  return color ?? '#000000';
}

/** Draw a rounded rectangle path. */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Parse a CSS `linear-gradient` or `radial-gradient` string into a
 * CanvasGradient. Returns null if not parseable (falls back to solid color).
 */
function makeCanvasGradient(
  ctx: CanvasRenderingContext2D,
  cssBackground: string,
  x: number,
  y: number,
  w: number,
  h: number,
): CanvasGradient | null {
  // Linear gradient
  const linearMatch = cssBackground.match(/linear-gradient\((.+)\)/);
  if (linearMatch) {
    const gradient = ctx.createLinearGradient(x, y, x + w, y + h);
    // extract colour stops, works for "colour pct, colour pct" patterns
    const stops = linearMatch[1].match(/#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)/g) ?? [];
    if (stops.length >= 2) {
      stops.forEach((c, i) => gradient.addColorStop(i / (stops.length - 1), c));
      return gradient;
    }
  }
  // Radial gradient
  const radialMatch = cssBackground.match(/radial-gradient\((.+)\)/);
  if (radialMatch) {
    const cx = x + w / 2;
    const cy = y + h / 2;
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) / 2);
    const stops = radialMatch[1].match(/#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)/g) ?? [];
    if (stops.length >= 2) {
      stops.forEach((c, i) => gradient.addColorStop(i / (stops.length - 1), c));
      return gradient;
    }
  }
  return null;
}

// ─── Main export ──────────────────────────────────────────────────────────────

export interface DownloadWithFrameOptions {
  qrCanvas: HTMLCanvasElement;       // The raw QR canvas from qr-code-styling
  frameConfig: QRFrameConfig;
  downloadConfig: QRDownloadConfig;
}

export async function downloadWithFrame({
  qrCanvas,
  frameConfig,
  downloadConfig,
}: DownloadWithFrameOptions): Promise<void> {
  const { format, fileName, scale } = downloadConfig;
  const name = (fileName?.trim() || 'qrcode') + '.' + format;

  // ── No frame → forward to native download or blob the QR canvas directly ──
  if (!frameConfig.templateId) {
    downloadCanvas(qrCanvas, name, format, scale);
    return;
  }

  const template = FRAME_TEMPLATES.find(t => t.id === frameConfig.templateId);
  if (!template) {
    downloadCanvas(qrCanvas, name, format, scale);
    return;
  }

  // ── Dimensions ────────────────────────────────────────────────────────────
  const QR_W = qrCanvas.width;
  const QR_H = qrCanvas.height;
  const TITLE = (frameConfig.title || template.defaultTitle).trim();
  const SUBTITLE = (frameConfig.subtitle || template.defaultSubtitle).trim();
  const CTA = (frameConfig.cta || template.defaultCta).trim();

  // Use user's chosen colors, fall back to template defaults
  const primaryColor = frameConfig.primaryColor || template.defaultPrimaryColor;
  const textColor = frameConfig.textColor || template.defaultTextColor;

  // Padding and text heights (scaled)
  const PADDING = 28 * scale;
  const GAP = 12 * scale;
  const TITLE_SIZE = 20 * scale;
  const SUBTITLE_SIZE = 13 * scale;
  const CTA_SIZE = 13 * scale;
  const CTA_PADDING_H = 16 * scale;
  const CTA_PADDING_V = 6 * scale;
  const BORDER_RADIUS = 20 * scale;
  const QR_PAD = 8 * scale;

  // Total height
  let totalH = PADDING;                           // top padding
  if (TITLE) totalH += TITLE_SIZE + 4 + GAP;
  if (SUBTITLE) totalH += SUBTITLE_SIZE + GAP;
  totalH += QR_PAD * 2 + QR_H * scale;           // QR area
  if (CTA) totalH += GAP + CTA_SIZE + CTA_PADDING_V * 2;
  totalH += PADDING;                              // bottom padding

  const totalW = Math.max(QR_W * scale + PADDING * 2, 280 * scale);

  // ── Create canvas ─────────────────────────────────────────────────────────
  const canvas = document.createElement('canvas');
  canvas.width = totalW;
  canvas.height = totalH;
  const ctx = canvas.getContext('2d')!;

  // ── Background ────────────────────────────────────────────────────────────
  const containerBg = (template.containerStyle as Record<string, string>)?.background ?? '#ffffff';
  const gradient = makeCanvasGradient(ctx, containerBg, 0, 0, totalW, totalH);

  roundRect(ctx, 0, 0, totalW, totalH, BORDER_RADIUS);
  ctx.fillStyle = gradient ?? parseColor(containerBg);
  ctx.fill();

  // ── Text draw helpers ─────────────────────────────────────────────────────
  let cursorY = PADDING;

  const drawText = (
    text: string,
    size: number,
    color: string,
    weight: string = '600',
    font: string = 'system-ui, sans-serif',
    padding?: { h: number; v: number; bg?: string; radius?: number },
  ) => {
    ctx.save();
    ctx.font = `${weight} ${size}px ${font}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const textX = totalW / 2;

    if (padding && padding.bg) {
      const metrics = ctx.measureText(text);
      const tw = metrics.width + padding.h * 2;
      const th = size + 1.4 + padding.v * 2;
      const bx = textX - tw / 2;
      const by = cursorY;
      roundRect(ctx, bx, by, tw, th, padding.radius ?? size / 2);
      ctx.fillStyle = padding.bg;
      ctx.fill();
      ctx.fillStyle = color;
      ctx.fillText(text, textX, cursorY + padding.v);
      cursorY += th;
    } else {
      ctx.fillStyle = color;
      ctx.fillText(text, textX, cursorY);
      cursorY += size + 4;
    }
    ctx.restore();
  };

  // ── Title ─────────────────────────────────────────────────────────────────
  if (TITLE) {
    const titleStyle = template.titleStyle as Record<string, string>;
    drawText(
      TITLE,
      TITLE_SIZE,
      textColor, // user's chosen text color
      titleStyle.fontWeight ?? '700',
      titleStyle.fontFamily ?? 'system-ui, sans-serif',
    );
    cursorY += GAP;
  }

  // ── Subtitle ──────────────────────────────────────────────────────────────
  if (SUBTITLE) {
    const subStyle = template.subtitleStyle as Record<string, string>;
    drawText(
      SUBTITLE,
      SUBTITLE_SIZE,
      textColor, // user's chosen text color
      subStyle.fontWeight ?? '400',
      subStyle.fontFamily ?? 'system-ui, sans-serif',
    );
    cursorY += GAP;
  }

  // ── QR Code image ─────────────────────────────────────────────────────────
  const qrX = (totalW - QR_W * scale) / 2;
  ctx.drawImage(qrCanvas, qrX, cursorY + QR_PAD, QR_W * scale, QR_H * scale);
  cursorY += QR_PAD * 2 + QR_H * scale;

  // ── CTA ───────────────────────────────────────────────────────────────────
  if (CTA) {
    cursorY += GAP;
    const ctaStyle = template.ctaStyle as Record<string, string>;
    const ctaHasBg = !!(ctaStyle.background || ctaStyle.backgroundColor);
    const ctaFillColor = ctaHasBg ? primaryColor : undefined;
    const ctaTextColor = ctaHasBg ? '#ffffff' : textColor;
    drawText(
      CTA,
      CTA_SIZE,
      ctaTextColor,
      ctaStyle.fontWeight ?? '700',
      ctaStyle.fontFamily ?? 'system-ui, sans-serif',
      ctaFillColor
        ? { h: CTA_PADDING_H, v: CTA_PADDING_V, bg: ctaFillColor, radius: CTA_SIZE / 2 + CTA_PADDING_V }
        : undefined,
    );
  }

  // ── Export ────────────────────────────────────────────────────────────────
  downloadCanvas(canvas, name, format, 1); // scale already applied above
}

// ─── Utility: download a canvas as a file ────────────────────────────────────
function downloadCanvas(
  canvas: HTMLCanvasElement,
  fileName: string,
  format: string,
  scale: number,
) {
  // If scale > 1, redraw onto a larger canvas
  let finalCanvas = canvas;
  if (scale > 1) {
    finalCanvas = document.createElement('canvas');
    finalCanvas.width = canvas.width * scale;
    finalCanvas.height = canvas.height * scale;
    const ctx2 = finalCanvas.getContext('2d')!;
    ctx2.drawImage(canvas, 0, 0, finalCanvas.width, finalCanvas.height);
  }

  const mimeType = format === 'svg'
    ? 'image/svg+xml'
    : format === 'jpeg'
    ? 'image/jpeg'
    : format === 'webp'
    ? 'image/webp'
    : 'image/png';

  const dataUrl = finalCanvas.toDataURL(mimeType, 0.92);
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
