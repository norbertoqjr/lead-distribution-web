import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Lead Distribution Platform',
    template: '%s · Lead Distribution Platform',
  },
  description:
    'Capture leads from a public form and route them to the right broker by percentage share, timezone, open hours, and daily cap.',
};

// initialScale without maximumScale: pinch-zoom stays available.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
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
          className="bg-card focus:ring-ring sr-only rounded-md border px-4 py-2 focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
