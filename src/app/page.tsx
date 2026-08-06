import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  Clock,
  Route,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

/** The lead one gets the wide cell; the rest sit beneath it. */
const lead = {
  icon: Users,
  title: 'Fair broker share',
  body: 'Each broker gets a target percentage. The next lead goes to whoever is furthest behind their share, so the split holds over time rather than only on average.',
};

const capabilities = [
  {
    icon: Clock,
    title: 'Timezone aware',
    body: 'Opening hours, working days, and daily caps are evaluated in the broker’s own timezone, not the server’s.',
  },
  {
    icon: ShieldCheck,
    title: 'No duplicate leads',
    body: 'Emails are normalized on submission. An address already sent to a broker is never routed to a second one.',
  },
  {
    icon: Activity,
    title: 'Full audit trail',
    body: 'Every lead is recorded with its captured IP address and status.',
  },
];

export default function HomePage() {
  return (
    <>
      <header className="bg-card border-b">
        <div className="mx-auto flex min-h-15 max-w-5xl items-center justify-between gap-4 px-6">
          <span className="flex items-center gap-2 font-semibold">
            <span className="bg-accent text-accent-foreground grid size-7 place-items-center rounded-md">
              <Route className="size-4" aria-hidden="true" />
            </span>
            Lead Distribution
          </span>

          <nav aria-label="Main" className="flex items-center gap-1">
            <Button asChild variant="ghost" size="sm">
              <Link href="/health">Health</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/login">Sign in</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main id="main">
        <section className="border-b">
          <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
            <p className="text-muted-foreground bg-muted mb-6 inline-flex rounded-full border px-3 py-1 text-xs font-medium">
              Admin platform
            </p>

            <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
              Route every lead to the right broker.
            </h1>

            {/* max-w keeps the measure near 65 characters on wide screens */}
            <p className="text-muted-foreground mt-4 max-w-2xl text-lg text-pretty">
              One public form, one distribution, many brokers. Leads are
              captured with their IP address, checked for duplicates, and
              assigned by percentage share within each broker’s working hours
              and daily cap.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/login">
                  Sign in to the admin
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/health">System health</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-12">
          <h2 className="text-muted-foreground mb-6 text-xs font-semibold tracking-wider uppercase">
            How distribution works
          </h2>

          {/* Asymmetric on purpose: a row of identical cards flattens the
              hierarchy and tells the reader nothing about what matters. */}
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-3">
              <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-start sm:gap-6">
                <span className="bg-accent text-accent-foreground grid size-10 shrink-0 place-items-center rounded-md">
                  <lead.icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-lg font-medium">{lead.title}</h3>
                  <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
                    {lead.body}
                  </p>
                </div>
              </CardContent>
            </Card>

            {capabilities.map((item) => (
              <Card key={item.title}>
                <CardContent className="pt-6">
                  <span className="bg-accent text-accent-foreground mb-4 grid size-9 place-items-center rounded-md">
                    <item.icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {item.body}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="text-muted-foreground border-t">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-6 text-sm">
          <span>Lead Distribution Platform</span>
          <Link href="/health" className="hover:underline">
            System health
          </Link>
        </div>
      </footer>
    </>
  );
}
