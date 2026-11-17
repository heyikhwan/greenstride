import { DOCUMENTS, EVENT } from "@/lib/event";
import { FAQ } from "@/lib/faq";
import { SITE, SITE_URL } from "@/lib/site";

/** Data terstruktur schema.org agar Google memahami halaman sebagai acara dan pusat jawaban. */
export default function StructuredData() {
  // Penyelenggara: Planters Club, di dalam PTPN Group, yang berada di bawah Danantara Indonesia.
  const org = {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organizer`,
    name: "Planters Club",
    logo: `${SITE_URL}/img/logo-planters-club-horizontal.png`,
    parentOrganization: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#ptpn`,
      name: "PTPN Group",
      alternateName: "PT Perkebunan Nusantara",
      url: "https://www.ptpn.com",
      logo: `${SITE_URL}/img/logo-ptpn-holding.png`,
      parentOrganization: { "@type": "Organization", name: "Danantara Indonesia" },
    },
  };
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: SITE.name,
        description: SITE.description,
        inLanguage: "id-ID",
        publisher: { "@id": `${SITE_URL}/#organizer` },
      },
      org,
      {
        "@type": "SportsEvent",
        "@id": `${SITE_URL}/#event`,
        name: SITE.name,
        description: `Lomba lari virtual beregu untuk karyawan PTPN Group. Satu tim maksimal ${EVENT.teamMax} orang mengumpulkan ${EVENT.teamTargetKm} km dari lari atau jalan di luar ruangan yang terekam di Strava.`,
        sport: "Running",
        startDate: EVENT.raceStart,
        endDate: EVENT.raceEnd,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
        location: { "@type": "VirtualLocation", url: `${SITE_URL}/` },
        image: [`${SITE_URL}/opengraph-image.jpg`, `${SITE_URL}/img/hero-runners.webp`],
        isAccessibleForFree: true,
        inLanguage: "id-ID",
        organizer: { "@id": `${SITE_URL}/#organizer` },
        offers: { "@type": "Offer", price: 0, priceCurrency: "IDR", availability: "https://schema.org/InStock", url: `${SITE_URL}/`, validThrough: "2026-11-18T23:59:59+07:00" },
        subjectOf: DOCUMENTS.map((d) => ({ "@type": "DigitalDocument", name: d.title, url: `${SITE_URL}${d.href}`, encodingFormat: "application/pdf" })),
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq`,
        mainEntity: FAQ.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: [...f.a, ...(f.list ?? []), f.note ?? ""].filter(Boolean).join(" ") },
        })),
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      // JSON dari data sendiri; "<" di-escape agar tidak bisa menutup tag script.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
