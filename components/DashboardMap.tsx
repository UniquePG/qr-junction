'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ScanPoint {
  lat: number;
  lng: number;
  city: string;
  country: string;
  count: number;
}

interface DashboardMapProps {
  scanPoints: ScanPoint[];
}

export default function DashboardMap({ scanPoints }: DashboardMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const LRef = useRef<any>(null);

  // 1. Load Leaflet client-side and inject CSS
  useEffect(() => {
    // Inject Leaflet CSS
    const linkId = 'leaflet-css-cdn';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    import('leaflet').then((L) => {
      LRef.current = L;
      setLeafletLoaded(true);
    }).catch(err => {
      console.error("Failed to load leaflet:", err);
    });
  }, []);

  // 2. Initialize map instance
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current || mapInstanceRef.current) return;

    const L = LRef.current;

    // Use a center with a slightly zoomed out world view
    const initialCenter: [number, number] = [20, 0];
    const initialZoom = 2;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: true,
      scrollWheelZoom: false, // Don't hijack scroll
    });

    // Use CartoDB Voyager style (modern, clean, gorgeous dashboard style)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    mapInstanceRef.current = map;
    markersLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
      }
    };
  }, [leafletLoaded]);

  // 3. Render markers whenever scanPoints change
  useEffect(() => {
    if (!leafletLoaded || !mapInstanceRef.current || !markersLayerRef.current) return;

    const L = LRef.current;
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;

    // Clear existing markers
    layer.clearLayers();

    if (!scanPoints || scanPoints.length === 0) return;

    // Find the max scan count to scale radius and opacity
    const maxCount = Math.max(...scanPoints.map(p => p.count));

    scanPoints.forEach((point) => {
      // Scale radius between 8 and 24 depending on density
      const scale = maxCount > 0 ? (point.count / maxCount) : 1;
      const radius = 8 + (scale * 16); 
      
      // Determine colors based on density (heat map style)
      // High count = red-orange, Medium = orange-yellow, Low = primary/blue
      let color = '#0046a1'; // primary/blue for single scans
      let fillColor = '#60a5fa';
      
      if (point.count > 10) {
        color = '#ef4444'; // Red for heavy scans
        fillColor = '#f87171';
      } else if (point.count > 2) {
        color = '#f97316'; // Orange for medium
        fillColor = '#fb923c';
      }

      // Create a circular point representing coordinates
      const circle = L.circleMarker([point.lat, point.lng], {
        radius: radius,
        fillColor: fillColor,
        fillOpacity: 0.6,
        color: color,
        weight: 1.5,
        opacity: 0.8
      });

      // Bind a modern popup
      const popupContent = `
        <div style="font-family: sans-serif; padding: 2px;">
          <h4 style="margin: 0 0 4px 0; font-size: 13px; color: #001B50; font-weight: bold;">
            ${point.city}, ${point.country}
          </h4>
          <p style="margin: 0; font-size: 11px; color: #475569;">
            Scans: <span style="font-weight: bold; color: ${color};">${point.count}</span>
          </p>
        </div>
      `;

      circle.bindPopup(popupContent);
      circle.addTo(layer);
    });

    // Fit bounds to markers
    if (scanPoints.length > 0) {
      const bounds = L.latLngBounds(scanPoints.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 6 });
    }

  }, [leafletLoaded, scanPoints]);

  return (
    <div className="relative w-full h-full min-h-[350px] rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs bg-slate-50">
      <div ref={mapContainerRef} className="w-full h-full min-h-[350px] z-10" />
      {!leafletLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50/90 z-20">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-slate-400 text-xs font-medium">Initializing Scan Heatmap...</span>
          </div>
        </div>
      )}
    </div>
  );
}
