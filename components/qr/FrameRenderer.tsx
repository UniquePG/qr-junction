'use client';

import { FRAME_TEMPLATES } from '@/config/frameTemplates';
import type { QRFrameConfig } from '@/types/qrTypes';
import type { CSSProperties, ReactNode } from 'react';

interface FrameRendererProps {
  frameConfig: QRFrameConfig;
  children: ReactNode;
}

/**
 * Merges a template style with the user's chosen primaryColor / textColor.
 *
 * Rules applied:
 *  - `color` property in titleStyle / subtitleStyle → replaced by frameConfig.textColor
 *  - `color` property in ctaStyle → replaced by ctaTextColor (auto-contrasted)
 *  - `background` / `backgroundColor` in ctaStyle → replaced by frameConfig.primaryColor
 *  - Container background is NOT overridden (it uses the template's aesthetic gradient).
 */
function mergeTextColor(
  style: Record<string, string>,
  textColor: string,
): CSSProperties {
  return { ...(style as CSSProperties), color: textColor };
}

function mergeCtaStyle(
  style: Record<string, string>,
  primaryColor: string,
  textColor: string,
): CSSProperties {
  const base = { ...(style as CSSProperties) };
  // If cta has an explicit background, swap it to primaryColor
  if (base.background || base.backgroundColor) {
    base.background = primaryColor;
    delete base.backgroundColor; // completely remove to avoid React shorthand warning
  }
  // Text on the CTA button uses the template's own color (for contrast),
  // but if there's no dedicated cta bg, use textColor.
  if (!base.background && !base.backgroundColor) {
    base.color = textColor;
  }
  return base;
}

export default function FrameRenderer({ frameConfig, children }: FrameRendererProps) {
  if (!frameConfig.templateId) {
    return <>{children}</>;
  }

  const template = FRAME_TEMPLATES.find(t => t.id === frameConfig.templateId);
  if (!template) return <>{children}</>;

  const title = frameConfig.title || template.defaultTitle;
  const subtitle = frameConfig.subtitle || template.defaultSubtitle;
  const cta = frameConfig.cta || template.defaultCta;

  const primaryColor = frameConfig.primaryColor || template.defaultPrimaryColor;
  const textColor = frameConfig.textColor || template.defaultTextColor;

  const titleStyle = mergeTextColor(template.titleStyle as Record<string, string>, textColor);
  const subtitleStyle = mergeTextColor(
    template.subtitleStyle as Record<string, string>,
    // Keep subtitle slightly transparent relative to textColor — use it directly
    textColor,
  );
  const ctaStyle = mergeCtaStyle(
    template.ctaStyle as Record<string, string>,
    primaryColor,
    textColor,
  );

  return (
    <div style={template.containerStyle as CSSProperties}>
      {title && <div style={titleStyle}>{title}</div>}
      {subtitle && <div style={subtitleStyle}>{subtitle}</div>}

      {/* QR Code */}
      <div style={{ ...(template.qrWrapperStyle as CSSProperties), padding: '8px' }}>
        {children}
      </div>

      {cta && <div style={ctaStyle}>{cta}</div>}
    </div>
  );
}
