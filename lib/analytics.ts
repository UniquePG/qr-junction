/**
 * Google Analytics 4 Event Tracking Utility
 * Industry-standard event tracking following GA4 best practices
 */

// GA4 Measurement ID
export const GA_MEASUREMENT_ID = 'G-HK32BH5KGT';

// Declare gtag function for TypeScript
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
    dataLayer: unknown[];
  }
}

/**
 * Check if GA is available
 */
export const isGAAvailable = (): boolean => {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
};

/**
 * Track page views
 */
export const trackPageView = (pagePath: string, pageTitle?: string): void => {
  if (!isGAAvailable()) return;

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: pagePath,
    page_title: pageTitle,
  });
};

/**
 * QR Code Type definitions
 */
export type QRCodeType =
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

/**
 * QR Code Size definitions
 */
export type QRCodeSize = 'small' | 'medium' | 'large' | 'extra_large';

/**
 * Convert numeric size to size category
 */
export const getSizeCategory = (size: number): QRCodeSize => {
  if (size <= 128) return 'small';
  if (size <= 200) return 'medium';
  if (size <= 300) return 'large';
  return 'extra_large';
};

/**
 * Track QR Code Generation Event
 */
export const trackQRCodeGeneration = (
  qrType: QRCodeType,
  size: number
): void => {
  if (!isGAAvailable()) return;

  const sizeCategory = getSizeCategory(size);

  window.gtag('event', 'qr_code_generated', {
    event_category: 'QR Code',
    event_label: qrType,
    qr_type: qrType,
    qr_size: sizeCategory,
    qr_size_pixels: size,
    value: 1,
  });
};

/**
 * Track QR Code Download Event
 */
export const trackQRCodeDownload = (
  qrType: QRCodeType,
  size: number
): void => {
  if (!isGAAvailable()) return;

  const sizeCategory = getSizeCategory(size);

  window.gtag('event', 'qr_code_downloaded', {
    event_category: 'QR Code',
    event_label: qrType,
    qr_type: qrType,
    qr_size: sizeCategory,
    qr_size_pixels: size,
    value: 1,
  });
};

/**
 * Track Tab Switch Event (when user changes QR code type)
 */
export const trackTabSwitch = (fromTab: QRCodeType, toTab: QRCodeType): void => {
  if (!isGAAvailable()) return;

  window.gtag('event', 'qr_tab_switched', {
    event_category: 'User Interaction',
    event_label: `${fromTab}_to_${toTab}`,
    from_tab: fromTab,
    to_tab: toTab,
  });
};

/**
 * Track Contact Form Submission
 */
export const trackContactFormSubmit = (subject: string): void => {
  if (!isGAAvailable()) return;

  window.gtag('event', 'contact_form_submitted', {
    event_category: 'Contact',
    event_label: subject,
    form_subject: subject,
    value: 1,
  });
};

/**
 * Track FAQ Item Expanded
 */
export const trackFAQExpand = (question: string, index: number): void => {
  if (!isGAAvailable()) return;

  window.gtag('event', 'faq_expanded', {
    event_category: 'FAQ',
    event_label: question.substring(0, 50), // Limit length
    faq_index: index,
    value: 1,
  });
};

/**
 * Track External Link Click
 */
export const trackExternalLink = (url: string, linkText?: string): void => {
  if (!isGAAvailable()) return;

  window.gtag('event', 'external_link_clicked', {
    event_category: 'Outbound',
    event_label: linkText || url,
    link_url: url,
    value: 1,
  });
};

/**
 * Track Button Click (generic)
 */
export const trackButtonClick = (
  buttonName: string,
  location?: string
): void => {
  if (!isGAAvailable()) return;

  window.gtag('event', 'button_clicked', {
    event_category: 'User Interaction',
    event_label: buttonName,
    button_location: location,
    value: 1,
  });
};

/**
 * Track Error Event
 */
export const trackError = (errorMessage: string, errorLocation?: string): void => {
  if (!isGAAvailable()) return;

  window.gtag('event', 'exception', {
    description: errorMessage,
    fatal: false,
    error_location: errorLocation,
  });
};

