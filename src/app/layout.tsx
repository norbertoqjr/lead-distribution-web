import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { RouteIcon } from '@/components/icons';
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
        <a className="skip-link" href="#main">
          Skip to main content
        </a>

        <header className="site-header">
          <div className="container site-header__inner">
            <Link className="brand" href="/">
              <span className="brand__mark">
                <RouteIcon size={17} />
              </span>
              Lead Distribution
            </Link>

            <nav className="nav" aria-label="Main">
              <Link className="nav__link" href="/health">
                Health
              </Link>
            </nav>
          </div>
        </header>

        <main id="main">{children}</main>

        <footer className="site-footer">
          <div className="container site-footer__inner">
            <span>Lead Distribution Platform</span>
            <Link href="/health">System health</Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
