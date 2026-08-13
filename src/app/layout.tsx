import type { Metadata } from "next";
import { Cinzel, Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const title = "Wedding Celebration of Sanjay & Fathima Rani";
const description =
  "You are cordially invited to celebrate the holy matrimony of J. Joseph Sanjay & B. Fathima Rani on September 13, 2026 at St. Fathima Shrine, Krishnagiri.";

/**
 * Absolute base for OG/Twitter image URLs. Set NEXT_PUBLIC_SITE_URL once a
 * custom domain is live; otherwise Vercel's production URL is used, falling
 * back to localhost for local development.
 */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  // og:image is supplied automatically by src/app/opengraph-image.tsx
  openGraph: {
    title,
    description,
    type: "website",
    locale: "en_IN",
    siteName: "Sanjay & Fathima Rani",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-navy-dark text-ivory">
        {children}
      </body>
    </html>
  );
}
