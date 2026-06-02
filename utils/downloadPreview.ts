/**
 * Download QR using canvas compositing (no DOM capture — avoids CORS/cssRules errors).
 */
import type { QRDownloadConfig, QRFrameConfig } from '@/types/qrTypes';
import { downloadWithFrame } from '@/utils/downloadWithFrame';

export interface DownloadPreviewOptions {
  qrCanvas: HTMLCanvasElement | null;
  frameConfig: QRFrameConfig;
  downloadConfig: QRDownloadConfig;
}

export async function downloadPreview({
  qrCanvas,
  frameConfig,
  downloadConfig,
}: DownloadPreviewOptions): Promise<void> {
  if (!qrCanvas) return;
  await downloadWithFrame({ qrCanvas, frameConfig, downloadConfig });
}
