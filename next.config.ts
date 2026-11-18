import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Halaman dan metadata tetap dirender statis saat build; hanya app/api/visits (penghitung pengunjung) berjalan di server Vercel.
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
