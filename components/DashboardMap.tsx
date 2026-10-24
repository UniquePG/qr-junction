'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Map as LeafletMap, LayerGroup } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'maplibre-gl/dist/maplibre-gl.css';

const OPENFREEMAP_STYLE = 'https://tiles.openfreemap.org/styles/positron';
const OSM_RASTER_TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const INITIAL_CENTER: [number, number] = [20, 0];
const INITIAL_ZOOM = 2;
const FIT_MAX_ZOOM = 6;
const STYLE_LOAD_TIMEOUT_MS = 10000;

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

type LeafletNS = typeof import('leaflet');
type MaplibreGLFactory = (options: { style: string; attributionControl?: boolean; interactive?: boolean }) => {
  addTo: (map: LeafletMap) => unknown;
  getMaplibreMap: () => {
    resize: () => void;
    isStyleLoaded: () => boolean;
    on: (event: string, handler: (event?: { error?: { message?: string } | string }) => void) => void;
  };
};

function isValidScanPoint(point: ScanPoint | null | undefined): point is ScanPoint {
  return (
    !!point &&
    Number.isFinite(point.lat) &&
    Number.isFinite(point.lng) &&
    point.lat >= -90 &&
    point.lat <= 90 &&
    point.lng >= -180 &&
    point.lng <= 180
  );
}

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function addOsmRasterFallback(L: LeafletNS, map: LeafletMap) {
  L.tileLayer(OSM_RASTER_TILES, {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map);
}

export default function DashboardMap({ scanPoints }: DashboardMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markersLayerRef = useRef<LayerGroup | null>(null);
  const maplibreMapRef = useRef<{ resize: () => void } | null>(null);
  const LRef = useRef<LeafletNS | null>(null);
  const maplibreGLRef = useRef<MaplibreGLFactory | null>(null);

  const [librariesReady, setLibrariesReady] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const validPoints = useMemo(
    () => (Array.isArray(scanPoints) ? scanPoints.filter(isValidScanPoint) : []),
    [scanPoints]
  );

  useEffect(() => {
    let cancelled = false;

    const loadLibraries = async () => {
      try {
        const leafletMod = await import('leaflet');
        const L = (leafletMod.default ?? leafletMod) as LeafletNS;

        let createVectorLayer: MaplibreGLFactory | null = null;
        try {
          await import('maplibre-gl');
          const plugin = await import('@maplibre/maplibre-gl-leaflet');
          createVectorLayer = (plugin.maplibreGL ?? plugin.default) as MaplibreGLFactory;
        } catch (vectorError) {
          console.warn('OpenFreeMap vector layer unavailable, using raster fallback.', vectorError);
        }

        if (cancelled) return;
        LRef.current = L;
        maplibreGLRef.current = createVectorLayer;
        setLibrariesReady(true);
      } catch (error) {
        console.error('Failed to load map libraries:', error);
        if (!cancelled) {
          setLoadError('The scan map could not be initialized.');
        }
      }
    };

    loadLibraries();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!librariesReady || !mapContainerRef.current || mapInstanceRef.current) return;

    const L = LRef.current;
    if (!L) return;

    const map = L.map(mapContainerRef.current, {
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
      zoomControl: true,
      scrollWheelZoom: false,
      attributionControl: true,
    });

    map.attributionControl.addAttribution('<a href="https://openfreemap.org">OpenFreeMap</a>');

    let fallbackApplied = false;
    let styleTimeout: number | undefined;

    const applyRasterFallback = () => {
      if (fallbackApplied) return;
      fallbackApplied = true;
      maplibreMapRef.current = null;
      addOsmRasterFallback(L, map);
    };

    const createVectorLayer = maplibreGLRef.current;
    if (createVectorLayer) {
      try {
        const vectorLayer = createVectorLayer({
          style: OPENFREEMAP_STYLE,
          attributionControl: false,
          interactive: false,
        });
        vectorLayer.addTo(map);

        const glMap = vectorLayer.getMaplibreMap();
        maplibreMapRef.current = glMap;

        glMap.on('error', (event) => {
          if (fallbackApplied || glMap.isStyleLoaded()) return;
          const message = String(
            typeof event?.error === 'string' ? event.error : event?.error?.message || ''
          );
          if (message) {
            console.warn('OpenFreeMap style failed, using raster fallback.', message);
          }
          try {
            map.removeLayer(vectorLayer as unknown as import('leaflet').Layer);
          } catch {
            // Layer may already be gone.
          }
          applyRasterFallback();
        });

        styleTimeout = window.setTimeout(() => {
          if (!fallbackApplied && !glMap.isStyleLoaded()) {
            console.warn('OpenFreeMap style timed out, using raster fallback.');
            try {
              map.removeLayer(vectorLayer as unknown as import('leaflet').Layer);
            } catch {
              // Layer may already be gone.
            }
            applyRasterFallback();
          }
        }, STYLE_LOAD_TIMEOUT_MS);
      } catch (error) {
        console.warn('Failed to attach OpenFreeMap, using raster fallback.', error);
        applyRasterFallback();
      }
    } else {
      applyRasterFallback();
    }

    mapInstanceRef.current = map;
    markersLayerRef.current = L.layerGroup().addTo(map);
    setMapReady(true);

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize({ animate: false });
      try {
        maplibreMapRef.current?.resize();
      } catch {
        // MapLibre may already be disposed.
      }
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      if (styleTimeout) window.clearTimeout(styleTimeout);
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
      maplibreMapRef.current = null;
      setMapReady(false);
    };
  }, [librariesReady]);

  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !markersLayerRef.current || !LRef.current) return;

    const L = LRef.current;
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;

    layer.clearLayers();

    if (validPoints.length === 0) {
      map.setView(INITIAL_CENTER, INITIAL_ZOOM);
      return;
    }

    const maxCount = Math.max(...validPoints.map((point) => point.count || 0), 1);

    validPoints.forEach((point) => {
      const scale = (point.count || 0) / maxCount;
      const radius = 8 + scale * 16;

      let color = '#0046a1';
      let fillColor = '#60a5fa';

      if (point.count > 10) {
        color = '#ef4444';
        fillColor = '#f87171';
      } else if (point.count > 2) {
        color = '#f97316';
        fillColor = '#fb923c';
      }

      const circle = L.circleMarker([point.lat, point.lng], {
        radius,
        fillColor,
        fillOpacity: 0.6,
        color,
        weight: 1.5,
        opacity: 0.8,
      });

      circle.bindPopup(`
        <div style="font-family: sans-serif; padding: 2px;">
          <h4 style="margin: 0 0 4px 0; font-size: 13px; color: #001B50; font-weight: bold;">
            ${escapeHtml(point.city)}, ${escapeHtml(point.country)}
          </h4>
          <p style="margin: 0; font-size: 11px; color: #475569;">
            Scans: <span style="font-weight: bold; color: ${color};">${escapeHtml(point.count)}</span>
          </p>
        </div>
      `, { autoPan: false });
      circle.addTo(layer);
    });

    if (validPoints.length === 1) {
      map.setView([validPoints[0].lat, validPoints[0].lng], FIT_MAX_ZOOM);
      return;
    }

    const bounds = L.latLngBounds(validPoints.map((point) => [point.lat, point.lng]));
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: FIT_MAX_ZOOM });
    }
  }, [mapReady, validPoints]);

  return (
    <div className="dashboard-scan-map relative w-full h-full min-h-[350px] rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs bg-slate-50">
      <style>{`
        .dashboard-scan-map .leaflet-container {
          width: 100%;
          height: 100%;
          min-height: 350px;
          background: #f8fafc;
          font-family: inherit;
        }
        .dashboard-scan-map .leaflet-tile-pane,
        .dashboard-scan-map .maplibregl-map,
        .dashboard-scan-map .maplibregl-canvas,
        .dashboard-scan-map .maplibregl-canvas-container {
          z-index: 0 !important;
        }
        .dashboard-scan-map .maplibregl-map {
          pointer-events: none;
        }
        .dashboard-scan-map .leaflet-overlay-pane,
        .dashboard-scan-map .leaflet-marker-pane {
          z-index: 400 !important;
        }
        .dashboard-scan-map .leaflet-popup-pane,
        .dashboard-scan-map .leaflet-tooltip-pane,
        .dashboard-scan-map .leaflet-control-container {
          z-index: 800 !important;
        }
      `}</style>
      <div ref={mapContainerRef} className="w-full h-full min-h-[350px] z-10" />
      {!mapReady && !loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50/90 z-20">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-slate-400 text-xs font-medium">Initializing Scan Heatmap...</span>
          </div>
        </div>
      )}
      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-20 px-6 text-center">
          <span className="text-slate-500 text-xs font-medium">{loadError}</span>
        </div>
      )}
    </div>
  );
}
