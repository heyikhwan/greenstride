import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Halaman dan metadata dirender statis saat build. Halaman utama dan /peserta/ dibuat ulang paling cepat tiap 5 menit (ISR) dari Google Sheet panitia (lib/peserta.ts).
  // app/api/visits (penghitung pengunjung) dan app/api/chat (asisten Rani) berjalan di server Vercel.
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
