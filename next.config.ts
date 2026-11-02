import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "ws"],
  transpilePackages: ["maplibre-gl", "@maplibre/maplibre-gl-leaflet"],
};

export default nextConfig;
