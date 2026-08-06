import Link from "next/link";

const links = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/health", label: "System health" },
];

/**
 * Public footer. Health lives here rather than in the header nav: it is a
 * diagnostic, not a destination, and the header should carry the one action
 * that matters (signing in).
 */
export function SiteFooter() {
  return (
    <footer className="text-muted-foreground border-t">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm">
        <p>
          © {new Date().getFullYear()} Lead Distribution Platform. All rights
          reserved.
        </p>

        <nav aria-label="Footer" className="flex flex-wrap items-center gap-5">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
