import { NextResponse } from 'next/server';
import os from 'os';

export async function GET() {
  let devIp = 'localhost';
  if (process.env.NODE_ENV === 'development') {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      const iface = interfaces[name];
      if (!iface) continue;
      for (const net of iface) {
        // Find first non-internal IPv4 address
        if (net.family === 'IPv4' && !net.internal) {
          devIp = net.address;
          break;
        }
      }
      if (devIp !== 'localhost') break;
    }
  }
  return NextResponse.json({ ip: devIp });
}
