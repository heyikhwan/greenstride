import type { Metadata, Viewport } from "next";
import { Archivo, Poppins } from "next/font/google";
import { SITE, SITE_URL, THEME_KEY } from "@/lib/site";
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
  authors: [{ name: SITE.organizer }],
  creator: SITE.organizer,
  publisher: SITE.organizer,
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

const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // Tema pilihan pengunjung (ThemeToggle di Navbar) dipasang sebelum cat pertama agar tidak berkedip.
    // Tanpa pilihan, tokens.css mengikuti prefers-color-scheme. suppressHydrationWarning karena skrip mengubah <html>.
    <html lang="id" className={`${archivo.variable} ${poppins.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="gs">{children}</body>
    </html>
  );
}
