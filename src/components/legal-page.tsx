import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

/** Shared shell and prose scale for the policy pages. */
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />

      <main id="main" className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Last updated {updated}
        </p>

        {/*
          Measure capped near 70 characters. Headings get more space above than
          below so each one binds to the text it introduces rather than
          floating between two blocks.
        */}
        <div className="[&_a]:text-primary [&_li]:marker:text-muted-foreground [&_p]:text-foreground/90 mt-10 space-y-4 text-[0.9375rem] leading-relaxed [&_a]:underline [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
          {children}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
