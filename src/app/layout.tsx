import type { Metadata, Viewport } from "next";
import "./globals.css";

/**
 * `metadataBase` resolves relative Open Graph and canonical URLs to absolute
 * ones. Without it Next warns at build time and social cards ship with broken
 * image paths, so it is set from the deployed origin.
 */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:8192";

const title = "Lead Distribution Platform";
const description =
  "Capture leads from a public form and route them to the right broker by percentage share, timezone, open hours, and daily cap.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: `%s · ${title}`,
  },
  description,
  applicationName: title,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: title,
    title,
    description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  // The admin area opts out individually; see noIndex in src/lib/seo.ts.
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  // No maximumScale: pinch-zoom stays available.
  width: "device-width",
  initialScale: 1,
  themeColor: "#176B45",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a
          href="#main"
          className="bg-card focus:ring-ring sr-only rounded-xl border px-4 py-2 focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
