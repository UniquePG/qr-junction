import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],
  transpilePackages: ["maplibre-gl", "@maplibre/maplibre-gl-leaflet"],
};

export default nextConfig;
