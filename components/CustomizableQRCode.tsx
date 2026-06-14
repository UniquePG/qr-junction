import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { getQrUrl } from '@/utils/qrUrl';

interface CustomizableQRCodeProps {
  value: string;
  fgColor?: string;
  bgColor?: string;
  logoUrl?: string | null;
  logoPreset?: 'none' | 'brand' | 'wifi' | 'google' | 'facebook' | 'instagram' | 'star' | 'coffee' | 'fork_knife' | 'chef_hat';
  frameId?: string;
  frameText?: string;
  frameColor?: string;
  frameTextColor?: string;
  size?: number;
  id?: string;
}

// Inline SVGs encoded as URL Data URIs for instant, reliable client-side rendering
const LOGO_PRESETS = {
  none: '',
  brand: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23001B50"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
  wifi: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%233b82f6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/></svg>',
  google: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="%23EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.31 0 3.28 2.71 1.34 6.645l3.926 3.12z"/><path fill="%23FBBC05" d="M1.34 6.645A11.967 11.967 0 0 0 0 12c0 1.927.455 3.745 1.255 5.373l4.027-3.136A7.058 7.058 0 0 1 4.909 12c0-1.455.445-2.81 1.209-3.955L2.19 4.909c-.336.545-.627 1.118-.85 1.736z"/><path fill="%234285F4" d="M12 24c3.245 0 5.973-1.082 7.964-2.927l-3.864-3A7.062 7.062 0 0 1 12 19.091c-4.127 0-7.618-2.8-8.864-6.582L1.255 17.37C3.255 21.31 7.3 24 12 24z"/><path fill="%2334A853" d="M23.755 12.273c0-.855-.073-1.682-.218-2.482H12v4.691h6.6c-.282 1.5-.127 2.764-1.99 4.018l3.864 3c2.255-2.082 3.282-5.145 3.282-8.736z"/></svg>',
  facebook: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%231877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
  instagram: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23E1306C"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>',
  star: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23f59e0b"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>',
  coffee: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23b45309" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>',
  fork_knife: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23ea580c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2v20M2 2v12a4 4 0 0 0 4 4h0a4 4 0 0 0 4-4V2M6 2v4M10 2v4M22 2c0 3-2.5 5.5-4 5.5S14 5 14 2"/></svg>',
  chef_hat: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%230f172a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18V6a4 4 0 0 1 8 0v12"/><path d="M18 18V9a3 3 0 0 0-6 0v9"/><path d="M3 18h18a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1z"/></svg>',
};

export default function CustomizableQRCode({
  value,
  fgColor = '#000000',
  bgColor = '#FFFFFF',
  logoUrl = null,
  logoPreset = 'none',
  frameId = 'no_frame',
  frameText = 'SCAN ME',
  frameColor = '#001b50',
  frameTextColor = '#FFFFFF',
  size = 180,
  id
}: CustomizableQRCodeProps) {

  // Resolve logo source
  const getLogoSrc = (): string | undefined => {
    if (logoUrl) return logoUrl;
    if (logoPreset && logoPreset !== 'none') {
      return LOGO_PRESETS[logoPreset];
    }
    return undefined;
  };

  const logoSrc = getLogoSrc();
  const imageSettings = logoSrc ? {
    src: logoSrc,
    x: undefined,
    y: undefined,
    height: 24,
    width: 24,
    excavate: true
  } : undefined;

  // Render plain QR Code
  if (frameId === 'no_frame' || !frameId) {
    return (
      <QRCodeSVG
        id={id}
        value={value}
        size={size}
        fgColor={fgColor}
        bgColor={bgColor}
        level="H"
        imageSettings={imageSettings}
      />
    );
  }

  // Common styles
  const defaultText = frameText || 'SCAN ME';

  return (
    <svg
      id={id}
      viewBox="0 0 350 420"
      className="w-full h-full select-none"
      style={{ background: 'transparent' }}
    >
      {/* Outer Card Wrapper */}
      <rect width="350" height="420" rx="28" fill={bgColor} />

      {/* Frame 1: Classic Border Card */}
      {frameId === 'classic_frame' && (
        <>
          <rect x="15" y="15" width="320" height="390" rx="20" fill="none" stroke={frameColor} strokeWidth="6" />
          <path
            d={`M 18 340 L 332 340 L 332 385 C 332 396, 323 402, 312 402 L 38 402 C 27 402, 18 396, 18 385 Z`}
            fill={frameColor}
          />
          <text
            x="175"
            y="374"
            fill={frameTextColor}
            textAnchor="middle"
            fontSize="18"
            fontWeight="900"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            letterSpacing="2"
          >
            {defaultText.toUpperCase()}
          </text>
          {/* Nested QR Code */}
          <g transform="translate(85, 65)">
            <QRCodeSVG
              value={value}
              size={180}
              fgColor={fgColor}
              bgColor={bgColor}
              level="H"
              imageSettings={imageSettings}
            />
          </g>
        </>
      )}

      {/* Frame 2: Wooden Tray/Plate Frame */}
      {frameId === 'wood_plate' && (
        <>
          {/* Outer dotted accent */}
          <circle cx="175" cy="180" r="140" fill="none" stroke={frameColor} strokeWidth="2.5" strokeDasharray="6,6" />
          {/* Main Round Wooden Plate Outline */}
          <circle cx="175" cy="180" r="126" fill="none" stroke={frameColor} strokeWidth="16" />
          
          {/* Fork on Left */}
          <g transform="translate(18, 140) scale(1.1)" stroke={frameColor} strokeWidth="2.5" fill="none" strokeLinecap="round">
            <path d="M 6 5 L 6 25 Q 6 32 10 32 L 10 65 M 14 5 L 14 25 Q 14 32 10 32 M 2 5 L 2 20 Q 2 30 10 30 M 18 5 L 18 20 Q 18 30 10 30" />
          </g>

          {/* Spoon on Right */}
          <g transform="translate(305, 140) scale(1.1)" stroke={frameColor} strokeWidth="2.5" fill="none" strokeLinecap="round">
            <path d="M 10 5 C 3 5 3 27 10 27 C 17 27 17 5 10 5 Z M 10 27 L 10 65" />
          </g>

          {/* Banner/Ribbon for Text */}
          <rect x="40" y="340" width="270" height="48" rx="14" fill={frameColor} />
          <text
            x="175"
            y="370"
            fill={frameTextColor}
            textAnchor="middle"
            fontSize="15"
            fontWeight="bold"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          >
            {defaultText}
          </text>

          {/* Nested QR Code */}
          <g transform="translate(95, 100)">
            <QRCodeSVG
              value={value}
              size={160}
              fgColor={fgColor}
              bgColor={bgColor}
              level="H"
              imageSettings={imageSettings}
            />
          </g>
        </>
      )}

      {/* Frame 3: Coffee Cup Frame */}
      {frameId === 'coffee_cup' && (
        <>
          {/* Steam Wavy Lines */}
          <g stroke={frameColor} strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.8">
            <path d="M 145 55 Q 135 40 145 25 T 145 5" />
            <path d="M 175 55 Q 165 40 175 25 T 175 5" />
            <path d="M 205 55 Q 195 40 205 25 T 205 5" />
          </g>

          {/* Coffee Saucer */}
          <path d="M 40 330 Q 175 365 310 330" fill="none" stroke={frameColor} strokeWidth="10" strokeLinecap="round" />

          {/* Cup Body */}
          <path d="M 65 110 L 95 300 Q 175 328 255 300 L 285 110 Z" fill="none" stroke={frameColor} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Cup Handle */}
          <path d="M 280 145 C 345 145 345 265 260 265" fill="none" stroke={frameColor} strokeWidth="9" strokeLinecap="round" />

          {/* Badge Label inside Cup */}
          <rect x="90" y="260" width="170" height="36" rx="10" fill={frameColor} />
          <text
            x="175"
            y="283"
            fill={frameTextColor}
            textAnchor="middle"
            fontSize="13"
            fontWeight="bold"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          >
            {defaultText}
          </text>

          {/* Nested QR Code */}
          <g transform="translate(105, 125)">
            <QRCodeSVG
              value={value}
              size={140}
              fgColor={fgColor}
              bgColor={bgColor}
              level="H"
              imageSettings={imageSettings}
            />
          </g>
        </>
      )}

      {/* Frame 4: Chef Hat Frame */}
      {frameId === 'chef_hat' && (
        <>
          {/* Chef Hat Outline on top */}
          <g transform="translate(142, 12) scale(1.4)" fill="none" stroke={frameColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 6 30 C 2 30 1 20 6 15 C 6 10 12 7 17 10 C 22 5 28 8 30 15 C 35 20 34 30 30 30" />
            <rect x="7" y="29" width="22" height="6" rx="1.5" fill="none" />
            <line x1="12" y1="35" x2="12" y2="29" />
            <line x1="17" y1="35" x2="17" y2="29" />
            <line x1="22" y1="35" x2="22" y2="29" />
          </g>

          {/* Inner card border */}
          <rect x="25" y="85" width="300" height="315" rx="16" fill="none" stroke={frameColor} strokeWidth="4" />

          {/* Spatula & Spoon Cross Detail at Bottom */}
          <g transform="translate(145, 305) scale(0.9)" stroke={frameColor} strokeWidth="3" fill="none" strokeLinecap="round">
            {/* Spatula */}
            <path d="M 0 35 L 60 -25 M 60 -25 M 50 -15 L 65 -30 L 55 -40 L 40 -25 Z M 48 -23 L 58 -33 M 44 -19 L 54 -29" />
            {/* Spoon */}
            <path d="M 60 35 L 0 -25 M 5 -20 C 12 -27 -3 -42 -10 -35 C -17 -28 -2 -13 5 -20 Z" />
          </g>

          {/* Banner */}
          <rect x="50" y="340" width="250" height="42" rx="10" fill={frameColor} />
          <text
            x="175"
            y="367"
            fill={frameTextColor}
            textAnchor="middle"
            fontSize="14"
            fontWeight="extrabold"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          >
            {defaultText}
          </text>

          {/* Nested QR Code */}
          <g transform="translate(90, 110)">
            <QRCodeSVG
              value={value}
              size={170}
              fgColor={fgColor}
              bgColor={bgColor}
              level="H"
              imageSettings={imageSettings}
            />
          </g>
        </>
      )}

      {/* Frame 5: Love Food Heart Frame */}
      {frameId === 'love_food' && (
        <>
          {/* Big Heart Border */}
          <path
            d="M 175 105 C 105 20, 20 100, 20 180 C 20 255, 95 305, 175 375 C 255 305, 330 255, 330 180 C 330 100, 245 20, 175 105 Z"
            fill="none"
            stroke={frameColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Inner dotted border */}
          <path
            d="M 175 120 C 115 40, 35 110, 35 180 C 35 242, 105 288, 175 350 C 245 288, 315 242, 315 180 C 315 110, 235 40, 175 120 Z"
            fill="none"
            stroke={frameColor}
            strokeWidth="2"
            strokeDasharray="5,5"
          />

          {/* Fork/Knife Mini Icon decoration on Ribbon */}
          <rect x="65" y="325" width="220" height="42" rx="12" fill={frameColor} />
          <text
            x="175"
            y="352"
            fill={frameTextColor}
            textAnchor="middle"
            fontSize="14"
            fontWeight="bold"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          >
            {defaultText}
          </text>

          {/* Nested QR Code */}
          <g transform="translate(95, 120)">
            <QRCodeSVG
              value={value}
              size={160}
              fgColor={fgColor}
              bgColor={bgColor}
              level="H"
              imageSettings={imageSettings}
            />
          </g>
        </>
      )}

      {/* Frame 6: Fresh Leaf Outline Frame */}
      {frameId === 'fresh_leaf' && (
        <>
          {/* Styled organic leaf border */}
          <rect x="25" y="25" width="300" height="370" rx="28" fill="none" stroke={frameColor} strokeWidth="6" />

          {/* Leaf 1 on Top Left */}
          <g transform="translate(18, 18) rotate(-25) scale(1.1)" fill={frameColor}>
            <path d="M 0 0 C 8 -12, 22 -12, 25 -3 C 25 10, 10 18, 0 0 Z" />
            <path d="M -8 10 C -12 2, -10 -10, 0 0 Z" opacity="0.7" />
          </g>

          {/* Leaf 2 on Bottom Right */}
          <g transform="translate(325, 385) rotate(155) scale(1.1)" fill={frameColor}>
            <path d="M 0 0 C 8 -12, 22 -12, 25 -3 C 25 10, 10 18, 0 0 Z" />
            <path d="M -8 10 C -12 2, -10 -10, 0 0 Z" opacity="0.7" />
          </g>

          {/* Lemon Slice Decoration */}
          <g transform="translate(305, 45) scale(0.95)" stroke={frameColor} strokeWidth="2.5" fill="none">
            <circle cx="15" cy="15" r="14" fill={bgColor} />
            <circle cx="15" cy="15" r="10" />
            <line x1="15" y1="1" x2="15" y2="29" />
            <line x1="1" y1="15" x2="29" y2="15" />
            <line x1="5" y1="5" x2="25" y2="25" />
            <line x1="25" y1="5" x2="5" y2="25" />
          </g>

          {/* Text banner */}
          <rect x="55" y="335" width="240" height="42" rx="10" fill={frameColor} />
          <text
            x="175"
            y="362"
            fill={frameTextColor}
            textAnchor="middle"
            fontSize="14"
            fontWeight="bold"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          >
            {defaultText}
          </text>

          {/* Nested QR Code */}
          <g transform="translate(90, 85)">
            <QRCodeSVG
              value={value}
              size={170}
              fgColor={fgColor}
              bgColor={bgColor}
              level="H"
              imageSettings={imageSettings}
            />
          </g>
        </>
      )}
    </svg>
  );
}
