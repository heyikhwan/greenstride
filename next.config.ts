import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Situs informasi statis: `next build` menulis HTML ke folder out/.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
