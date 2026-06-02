export interface GeoLocation {
  country: string | null;
  city: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
}

export async function resolveGeoLocation(ip: string, headers: Headers): Promise<GeoLocation> {
  // 1. Try Vercel geo headers first (production deployment)
  const vercelCountry = headers.get('x-vercel-ip-country');
  const vercelCity = headers.get('x-vercel-ip-city');
  const vercelState = headers.get('x-vercel-ip-country-region');
  const vercelLat = headers.get('x-vercel-ip-latitude');
  const vercelLong = headers.get('x-vercel-ip-longitude');

  if (vercelCountry) {
    return {
      country: vercelCountry,
      city: vercelCity ? decodeURIComponent(vercelCity) : null,
      state: vercelState ? decodeURIComponent(vercelState) : null,
      latitude: vercelLat ? parseFloat(vercelLat) : null,
      longitude: vercelLong ? parseFloat(vercelLong) : null,
    };
  }

  // 2. Localhost testing fallback
  let cleanIp = ip.trim();
  if (cleanIp === '::1' || cleanIp === '127.0.0.1' || cleanIp === 'localhost' || cleanIp.startsWith('192.168.') || cleanIp.startsWith('10.')) {
    return {
      country: 'India',
      city: 'Delhi',
      state: 'Delhi',
      latitude: 28.6139,
      longitude: 77.2090,
    };
  }

  // Clean proxy headers if multiple IPs are present (e.g. cloudflare/load balancer chains)
  if (cleanIp.includes(',')) {
    cleanIp = cleanIp.split(',')[0].trim();
  }

  // 3. Fallback to free ip-api.com endpoint
  try {
    const response = await fetch(`http://ip-api.com/json/${cleanIp}?fields=status,country,regionName,city,lat,lon`);
    if (response.ok) {
      const data = await response.json();
      if (data.status === 'success') {
        return {
          country: data.country || null,
          city: data.city || null,
          state: data.regionName || null,
          latitude: data.lat || null,
          longitude: data.lon || null,
        };
      }
    }
  } catch (error) {
    console.error('Error resolving geolocation from ip-api:', error);
  }

  // Fallback
  return {
    country: null,
    city: null,
    state: null,
    latitude: null,
    longitude: null,
  };
}
