'use client';

import type { QRConfig } from '@/types/qrTypes';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';

// We dynamically import so this never runs server-side
let QRCodeStyling: typeof import('qr-code-styling').default | null = null;

interface QRPreviewProps {
  value: string;
  config: QRConfig;
}

export interface QRPreviewHandle {
  download: (format: 'png' | 'svg' | 'jpeg' | 'webp', fileName: string) => void;
  getCanvas: () => HTMLCanvasElement | null;
}

function buildOptions(value: string, config: QRConfig) {
  const ecl = config.logo ? 'H' : config.errorCorrectionLevel;

  const makeGradient = (g: typeof config.dots.gradient) => {
    if (!g) return undefined;
    return {
      type: g.type,
      rotation: g.type === 'linear' ? ((g.rotation ?? 0) * Math.PI) / 180 : undefined,
      colorStops: g.colorStops.map(cs => ({
        offset: cs.offset,
        color: cs.color,
      })),
    };
  };

  return {
    width: config.size.width,
    height: config.size.height,
    margin: config.size.margin,
    data: value || 'https://qrjunction.in',
    qrOptions: { errorCorrectionLevel: ecl },
    dotsOptions: {
      type: config.dots.type,
      color: config.dots.color,
      gradient: makeGradient(config.dots.gradient),
    },
    cornersSquareOptions: {
      type: config.cornerSquares.type,
      color: config.cornerSquares.color,
      gradient: makeGradient(config.cornerSquares.gradient),
    },
    cornersDotOptions: {
      type: config.cornerDots.type,
      color: config.cornerDots.color,
      gradient: makeGradient(config.cornerDots.gradient),
    },
    backgroundOptions: config.background.transparent
      ? { color: 'transparent' }
      : {
          color: config.background.color,
          gradient: makeGradient(config.background.gradient),
        },
    ...(config.logo
      ? {
          image: config.logo.src,
          imageOptions: {
            imageSize: Math.min(config.logo.size, 0.4),
            margin: config.logo.margin,
            hideBackgroundDots: config.logo.hideBackgroundDots,
            crossOrigin: config.logo.crossOrigin ?? 'anonymous',
          },
        }
      : {}),
  };
}

const QRPreview = forwardRef<QRPreviewHandle, QRPreviewProps>(
  ({ value, config }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const qrInstanceRef = useRef<InstanceType<typeof import('qr-code-styling').default> | null>(null);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isInitializedRef = useRef(false);
    const initInProgressRef = useRef(false);

    // Initialize QR instance
    const initQR = useCallback(async (qrValue: string, qrConfig: QRConfig) => {
      const container = containerRef.current;
      if (!container) return;
      
      // If already initialized or in progress, skip
      if (isInitializedRef.current || initInProgressRef.current) return;
      
      initInProgressRef.current = true;

      // Clear container completely to prevent duplicates
      container.innerHTML = '';

      // Lazy-load qr-code-styling
      if (!QRCodeStyling) {
        const mod = await import('qr-code-styling');
        QRCodeStyling = mod.default;
      }

      // Final check after async import
      if (isInitializedRef.current || !containerRef.current || containerRef.current !== container) {
        initInProgressRef.current = false;
        return;
      }

      // Create new instance
      const options = buildOptions(qrValue, qrConfig);
      qrInstanceRef.current = new QRCodeStyling(options);
      
      // Verify container is still empty before appending
      if (container.children.length === 0) {
        qrInstanceRef.current.append(container);
        
        // After appending, check for and remove any duplicate canvases
        // Keep only the first canvas element
        const canvases = container.querySelectorAll('canvas');
        if (canvases.length > 1) {
          for (let i = 1; i < canvases.length; i++) {
            canvases[i].remove();
          }
        }
        
        isInitializedRef.current = true;
      }
      
      initInProgressRef.current = false;
    }, []);

    // Single effect to handle both initialization and updates
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      // Initialize if not already initialized
      if (!isInitializedRef.current && !initInProgressRef.current) {
        initQR(value, config);
        return;
      }

      // If already initialized, update with debounce
      if (isInitializedRef.current && qrInstanceRef.current && !initInProgressRef.current) {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
          if (qrInstanceRef.current && isInitializedRef.current && containerRef.current && !initInProgressRef.current) {
            qrInstanceRef.current.update(buildOptions(value, config));
          }
        }, 300);
      }

      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = null;
        }
      };
    }, [value, config, initQR]);

    // Cleanup on unmount
    useEffect(() => {
      const container = containerRef.current;
      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        if (container) {
          container.innerHTML = '';
        }
        isInitializedRef.current = false;
        initInProgressRef.current = false;
        qrInstanceRef.current = null;
      };
    }, []);

    // Expose download + getCanvas to parent
    useImperativeHandle(ref, () => ({
      download(format, fileName) {
        if (!qrInstanceRef.current) return;
        qrInstanceRef.current.download({ name: fileName, extension: format as 'png' | 'svg' | 'jpeg' | 'webp' });
      },
      getCanvas() {
        return containerRef.current?.querySelector('canvas') ?? null;
      },
    }));

    return (
      <div
        ref={containerRef}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: `${config.background.borderRadius}px`,
          overflow: 'hidden',
          lineHeight: 0, 
        }}
      />
    );
  }
);

QRPreview.displayName = 'QRPreview';
export default QRPreview;
