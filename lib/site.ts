/**
 * Data SEO situs. Set NEXT_PUBLIC_SITE_URL ke domain produksi (misalnya https://greenstride.example.id)
 * sebelum `next build`, agar tautan kanonik, sitemap dan gambar bagikan memakai alamat yang benar.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

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
