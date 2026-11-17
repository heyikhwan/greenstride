/**
 * Data SEO situs. Set SITE_URL ke domain produksi (misalnya https://greenstride.example.id) sebelum `next build`,
 * agar tautan kanonik, sitemap dan gambar bagikan memakai alamat yang benar. Nilai ini hanya dibaca di server
 * saat build, jadi tidak perlu awalan NEXT_PUBLIC_. Di Vercel, domain produksi dipakai otomatis bila SITE_URL kosong.
 */
function resolveSiteUrl() {
  if (process.env.SITE_URL) return process.env.SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl().replace(/\/+$/, "");

export const SITE = {
  name: "PTPN GreenStride 2026",
  shortName: "GreenStride 2026",
  title: "PTPN GreenStride 2026 · Run for a Healthier You, A Stronger Nusantara Entreplanters",
  description:
    "Kompetisi lari virtual beregu bagi karyawan PTPN Group. Temukan ketentuan lomba, panduan aplikasi, penghargaan, dan jawaban lengkap untuk peserta GreenStride 2026.",
  shareDescription:
    "Kompetisi lari virtual beregu bagi karyawan PTPN Group. Bergerak bersama tim, capai target bersama, dan jadilah finisher GreenStride 2026.",
  keywords: [
    "PTPN GreenStride 2026",
    "GreenStride",
    "lomba lari virtual",
    "virtual run PTPN",
    "PTPN Group",
    "Perkebunan Nusantara",
    "Planters Club",
    "Danantara",
    "99 Virtual Race",
    "Strava",
    "lari beregu",
  ],
  themeColor: "#0b3d24",
};
