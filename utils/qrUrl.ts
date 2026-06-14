export function getQrUrl(shortCode: string) {
  if (process.env.NODE_ENV === 'production') {
    return `https://qrjunction.in/q/${shortCode}`;
  }

  if (typeof window === 'undefined') return `/q/${shortCode}`;
  let origin = window.location.origin;
  const devIp = (window as any).__DEV_IP__;
  if (devIp && devIp !== 'localhost') {
    origin = origin.replace('localhost', devIp).replace('127.0.0.1', devIp);
  }
  return `${origin}/q/${shortCode}`;
}
