import Link from 'next/link';
import type { Metadata } from 'next';
import { z } from 'zod';
import { apiFetch } from '@/lib/api';
import {
  brokerResponseSchema,
  distributionResponseSchema,
  formResponseSchema,
  summarySchema,
} from '@/lib/schemas';
import { AdminShell, PageHeader } from '@/components/admin/shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = { title: 'Dashboard' };
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Fetched in parallel: four sequential round trips would be four times the
  // latency for no benefit.
  const [summary, brokers, form, distribution] = await Promise.all([
    apiFetch('/leads/summary', summarySchema),
    apiFetch('/brokers', z.array(brokerResponseSchema)),
    apiFetch('/forms', formResponseSchema.nullable()),
    apiFetch('/distributions', distributionResponseSchema.nullable()),
  ]);

  const stats = [
    { label: 'Total leads', value: summary.total },
    { label: 'Sent', value: summary.sent },
    { label: 'Unsent', value: summary.unsent },
    { label: 'Duplicate', value: summary.duplicate },
    { label: 'Failed', value: summary.failed },
  ];

  const setup = [
    {
      label: 'Brokers',
      done: brokers.length > 0,
      detail: `${brokers.length} created`,
      href: '/brokers',
    },
    {
      label: 'Lead form',
      done: Boolean(form),
      detail: form ? `/${form.slug}` : 'Not created',
      href: '/form',
    },
    {
      label: 'Distribution',
      done: Boolean(distribution),
      detail: distribution
        ? `${distribution.brokers.length} brokers`
        : 'Not created',
      href: '/distribution',
    },
  ];

  return (
    <AdminShell>
      <PageHeader
        title="Dashboard"
        description="Lead volume and setup status at a glance."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Tabular figures stop the numbers jittering as they change. */}
              <p className="text-3xl font-semibold tabular-nums">
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="text-muted-foreground mt-10 mb-4 text-xs font-semibold tracking-wider uppercase">
        Setup
      </h2>

      <div className="grid gap-4 sm:grid-cols-3">
        {setup.map((step) => (
          <Link key={step.label} href={step.href} className="rounded-lg">
            <Card className="hover:border-ring h-full transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{step.label}</p>
                  <span
                    className={
                      step.done
                        ? 'text-[color:var(--success)] text-xs font-semibold'
                        : 'text-[color:var(--warning)] text-xs font-semibold'
                    }
                  >
                    {step.done ? 'Ready' : 'Pending'}
                  </span>
                </div>
                <p className="text-muted-foreground mt-1 text-sm">
                  {step.detail}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
