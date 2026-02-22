import type { QRConfig } from '@/types/qrTypes';

export interface PresetStyle {
  id: string;
  name: string;
  description: string;
  swatchColors: string[]; // for visual preview
  config: Partial<QRConfig>;
}

export const PRESET_STYLES: PresetStyle[] = [
  {
    id: 'instagram-gradient',
    name: 'Instagram',
    description: 'Vibrant pink-purple gradient',
    swatchColors: ['#f09433', '#e6683c', '#dc2743', '#cc2366', '#bc1888'],
    config: {
      dots: {
        type: 'rounded',
        color: '#dc2743',
        gradient: {
          type: 'linear',
          rotation: 45,
          colorStops: [
            { offset: 0, color: '#f09433' },
            { offset: 0.5, color: '#dc2743' },
            { offset: 1, color: '#bc1888' },
          ],
        },
      },
      cornerSquares: {
        type: 'extra-rounded',
        color: '#bc1888',
      },
      cornerDots: {
        type: 'dot',
        color: '#f09433',
      },
      background: {
        color: '#ffffff',
        transparent: false,
        borderRadius: 16,
      },
    },
  },
  {
    id: 'whatsapp-green',
    name: 'WhatsApp',
    description: 'Classic WhatsApp green',
    swatchColors: ['#128C7E', '#25D366', '#128C7E'],
    config: {
      dots: {
        type: 'rounded',
        color: '#128C7E',
        gradient: {
          type: 'linear',
          rotation: 135,
          colorStops: [
            { offset: 0, color: '#128C7E' },
            { offset: 1, color: '#25D366' },
          ],
        },
      },
      cornerSquares: {
        type: 'extra-rounded',
        color: '#128C7E',
      },
      cornerDots: {
        type: 'dot',
        color: '#25D366',
      },
      background: {
        color: '#ffffff',
        transparent: false,
        borderRadius: 12,
      },
    },
  },
  {
    id: 'modern-dark',
    name: 'Modern Dark',
    description: 'Sleek dark with blue accents',
    swatchColors: ['#0f0f1a', '#1a1a2e', '#4361ee'],
    config: {
      dots: {
        type: 'classy-rounded',
        color: '#000000',
        gradient: {
          type: 'linear',
          rotation: 135,
          colorStops: [
            { offset: 0, color: '#1a1a2e' },
            { offset: 1, color: '#4361ee' },
          ],
        },
      },
      cornerSquares: {
        type: 'extra-rounded',
        color: '#1a1a2e',
      },
      cornerDots: {
        type: 'dot',
        color: '#4361ee',
      },
      background: {
        color: '#f8faff',
        transparent: false,
        borderRadius: 8,
      },
    },
  },
  {
    id: 'minimal-black',
    name: 'Minimal Black',
    description: 'Pure minimal monochrome',
    swatchColors: ['#000000', '#333333', '#000000'],
    config: {
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
    },
  },
  {
    id: 'neon-cyber',
    name: 'Neon Cyber',
    description: 'Futuristic neon glow',
    swatchColors: ['#00ffff', '#ff00ff', '#00ff88'],
    config: {
      dots: {
        type: 'dots',
        color: '#00ffff',
        gradient: {
          type: 'linear',
          rotation: 90,
          colorStops: [
            { offset: 0, color: '#00ffff' },
            { offset: 0.5, color: '#ff00ff' },
            { offset: 1, color: '#00ff88' },
          ],
        },
      },
      cornerSquares: {
        type: 'dot',
        color: '#00ffff',
      },
      cornerDots: {
        type: 'dot',
        color: '#ff00ff',
      },
      background: {
        color: '#0a0a0a',
        transparent: false,
        borderRadius: 12,
      },
    },
  },
  {
    id: 'gold-premium',
    name: 'Gold Premium',
    description: 'Luxury gold on dark',
    swatchColors: ['#D4AF37', '#F5D060', '#B8860B'],
    config: {
      dots: {
        type: 'classy',
        color: '#D4AF37',
        gradient: {
          type: 'linear',
          rotation: 135,
          colorStops: [
            { offset: 0, color: '#B8860B' },
            { offset: 0.5, color: '#D4AF37' },
            { offset: 1, color: '#F5D060' },
          ],
        },
      },
      cornerSquares: {
        type: 'square',
        color: '#D4AF37',
      },
      cornerDots: {
        type: 'dot',
        color: '#F5D060',
      },
      background: {
        color: '#1c1c1c',
        transparent: false,
        borderRadius: 8,
      },
    },
  },
  {
    id: 'soft-pastel',
    name: 'Soft Pastel',
    description: 'Gentle pastel palette',
    swatchColors: ['#a8edea', '#fed6e3', '#a8edea'],
    config: {
      dots: {
        type: 'extra-rounded',
        color: '#7c9cbf',
        gradient: {
          type: 'radial',
          colorStops: [
            { offset: 0, color: '#a8edea' },
            { offset: 1, color: '#fed6e3' },
          ],
        },
      },
      cornerSquares: {
        type: 'extra-rounded',
        color: '#a8c9f0',
      },
      cornerDots: {
        type: 'dot',
        color: '#f0c1d4',
      },
      background: {
        color: '#fafafa',
        transparent: false,
        borderRadius: 20,
      },
    },
  },
];
