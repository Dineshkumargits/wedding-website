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

import { headers } from "next/headers";
import { getWeddingConfig } from "@/data/wedding";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export async function generateMetadata(): Promise<Metadata> {
  let host = "";
  try {
    const headersList = await headers();
    host = headersList.get("host") || "";
  } catch {
    // fallback during static build
  }

  const config = getWeddingConfig(host);
  const title = config.meta.siteTitle;
  const description = config.meta.siteDescription;

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: config.meta.ogLocale,
      siteName: config.couple.displayNames,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
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
