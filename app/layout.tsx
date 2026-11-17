import type { Metadata, Viewport } from "next";
import { Archivo, Poppins } from "next/font/google";
import { SITE, SITE_URL } from "@/lib/site";
import "./tokens.css";
import "./ds.css";
import "./landing.css";

// Archivo: judul miring dan lebar seperti logotype GREENSTRIDE. Poppins: huruf konten media sosial acara.
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], style: ["normal", "italic"], variable: "--font-display" });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-text" });

// Gambar bagikan (opengraph-image.jpg, twitter-image.jpg) dan ikon (icon.png, apple-icon.png) ada di app/.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE.title, template: `%s · ${SITE.shortName}` },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: SITE.keywords,
  authors: [{ name: "PTPN Group" }],
  creator: "PTPN Group",
  publisher: "PTPN Group",
  category: "sports",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.shareDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.shareDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: SITE.themeColor },
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
