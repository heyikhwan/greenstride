import type { Metadata, Viewport } from "next";
import { Archivo, Poppins } from "next/font/google";
import "./tokens.css";
import "./ds.css";
import "./landing.css";

// Archivo: judul miring dan lebar seperti logotype GREENSTRIDE. Poppins: huruf konten media sosial acara.
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], style: ["normal", "italic"], variable: "--font-display" });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-text" });

export const metadata: Metadata = {
  title: "PTPN GreenStride 2026 · Lomba lari virtual beregu karyawan PTPN Group",
  description:
    "Aturan, jadwal 23 November – 20 Desember 2026, panduan aplikasi 99 Virtual Race dan Strava, penghargaan, dan jawaban lengkap untuk peserta GreenStride 2026.",
  icons: { icon: "/img/logo-holding-only.png" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0b3d24" },
    { media: "(prefers-color-scheme: dark)", color: "#08170f" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${archivo.variable} ${poppins.variable}`}>
      <body className="gs">{children}</body>
    </html>
  );
}
