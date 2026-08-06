import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, FileQuestion } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Button } from '@/components/ui/button';
import { noIndex } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: noIndex,
};

/**
 * Catches both genuinely unknown URLs and a mistyped form slug, which is the
 * likely case here: /{slug} is a dynamic route, so any single-segment path
 * that is not a real form lands on this page.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      <main
        id="main"
        className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-6 py-16 text-center"
      >
        <span className="bg-accent text-accent-foreground mx-auto grid size-14 place-items-center rounded-2xl">
          <FileQuestion className="size-7" aria-hidden="true" />
        </span>

        <p className="text-muted-foreground mt-6 font-mono text-sm">404</p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          We could not find that page.
        </h1>

        <p className="text-muted-foreground mt-3 text-[0.9375rem]">
          The link may be out of date, or the address may have a typo. If you
          were opening a lead form, check the URL with whoever shared it: form
          addresses are case sensitive and use hyphens, like{' '}
          <span className="text-foreground font-mono text-sm">
            /lead-registration
          </span>
          .
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/">
              Back to home
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/health">Check system status</Link>
          </Button>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
