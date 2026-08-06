import Link from "next/link";
import type { Metadata } from "next";
import { noIndex } from "@/lib/seo";
import { ArrowRight, Check, ExternalLink } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { ALL } from "@/lib/paging";
import {
  brokerResponseSchema,
  distributionResponseSchema,
  formResponseSchema,
  leadResponseSchema,
  paginatedSchema,
  summarySchema,
} from "@/lib/schemas";
import { AdminShell, EmptyState, PageHeader } from "@/components/admin/shell";
import { StatCard } from "@/components/admin/stat-card";
import { DashboardCard } from "@/components/admin/dashboard-card";
import { StatusBadge } from "@/components/admin/status-badge";
import { TimeAgo } from "@/components/admin/time-ago";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard", robots: noIndex };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Fetched in parallel: five sequential round trips would be five times the
  // latency for no benefit.
  const [summary, brokers, form, distribution, leads] = await Promise.all([
    apiFetch("/leads/summary", summarySchema),
    apiFetch(`/brokers?${ALL}`, paginatedSchema(brokerResponseSchema)),
    apiFetch("/forms", formResponseSchema.nullable()),
    apiFetch("/distributions", distributionResponseSchema.nullable()),
    apiFetch("/leads?page=1&perPage=5", paginatedSchema(leadResponseSchema)),
  ]);

  const routed =
    summary.total > 0 ? Math.round((summary.sent / summary.total) * 100) : 0;

  const steps = [
    {
      label: "Create brokers",
      done: brokers.total > 0,
      detail:
        brokers.total > 0
          ? `${brokers.total} broker${brokers.total === 1 ? "" : "s"}`
          : "Nobody can receive leads yet",
      href: "/brokers",
    },
    {
      label: "Create the lead form",
      done: Boolean(form),
      detail: form ? `Live at /${form.slug}` : "No public form yet",
      href: "/form",
    },
    {
      label: "Create the distribution",
      done: Boolean(distribution),
      detail: distribution
        ? `${distribution.brokers.length} broker${
            distribution.brokers.length === 1 ? "" : "s"
          } included`
        : "Leads will be saved as unsent",
      href: "/distribution",
    },
  ];

  // The first incomplete step is the one thing to do next.
  const nextStep = steps.find((step) => !step.done);
  // The API already returns just the five most recent.
  const recent = leads.data;

  return (
    <AdminShell>
      <PageHeader
        title="Dashboard"
        description="Lead volume, setup status, and the latest submissions."
      />

      {/* Tiles link into the leads page pre-filtered: seeing 3 unsent leads and
          having to go find them is a wasted click. */}
      <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          featured
          label="Total leads"
          value={summary.total}
          meta={
            summary.total > 0
              ? `${routed}% routed to a broker`
              : "No submissions yet"
          }
          href="/leads"
        />
        <StatCard
          label="Sent"
          value={summary.sent}
          meta="Assigned to a broker"
          href="/leads?status=sent"
        />
        <StatCard
          label="Unsent"
          value={summary.unsent}
          meta={
            summary.unsent > 0 ? "Waiting to be assigned" : "Nothing waiting"
          }
          href="/leads?status=unsent"
          alert={summary.unsent > 0}
        />
        <StatCard
          label="Duplicate"
          value={summary.duplicate}
          meta="Blocked from reassignment"
          href="/leads?status=duplicate"
        />
      </div>

      <div className="mt-3.5 grid gap-3.5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <DashboardCard
          title="Latest leads"
          action={
            summary.total > recent.length ? (
              <Link
                href="/leads"
                className="text-primary text-sm font-medium hover:underline"
              >
                View all {summary.total}
              </Link>
            ) : undefined
          }
          bodyClassName="px-0"
        >
          {recent.length === 0 ? (
            <div className="px-5">
              <EmptyState
                title="No leads yet"
                description={
                  form
                    ? "Share the public form URL to start collecting."
                    : "Create the lead form to start collecting."
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-5">Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Broker</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-5">Received</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recent.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="pl-5 font-medium">
                        {lead.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {lead.email}
                      </TableCell>
                      <TableCell>{lead.broker?.name ?? "—"}</TableCell>
                      <TableCell>
                        <StatusBadge status={lead.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground pr-5 text-sm">
                        <TimeAgo value={lead.createdAt} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DashboardCard>

        <div className="flex flex-col gap-3.5">
          <DashboardCard title="Setup" bodyClassName="px-0">
            <ol>
              {steps.map((step) => (
                <li key={step.label}>
                  <Link
                    href={step.href}
                    className="hover:bg-secondary/60 flex items-start gap-3 px-5 py-3 transition-colors"
                  >
                    <span
                      className={cn(
                        "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border",
                        step.done
                          ? "bg-success-muted text-success border-transparent"
                          : "text-muted-foreground",
                      )}
                    >
                      {step.done && (
                        <Check className="size-3" aria-hidden="true" />
                      )}
                    </span>

                    <span className="min-w-0">
                      <span className="block text-sm font-medium">
                        {step.label}
                      </span>
                      <span className="text-muted-foreground block text-[0.6875rem]">
                        {step.detail}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>

            {nextStep && (
              <div className="px-5 pt-2">
                <Link
                  href={nextStep.href}
                  className="text-primary inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
                >
                  Next: {nextStep.label}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            )}
          </DashboardCard>

          {/* Once the form exists, its public URL is the thing the admin hands
              out, so surface it rather than hiding it a page away. */}
          {form && (
            <DashboardCard title="Public form">
              <p className="text-sm font-medium">{form.name}</p>
              <a
                href={`/${form.slug}`}
                target="_blank"
                rel="noreferrer noopener"
                className="text-primary mt-1 inline-flex items-center gap-1.5 font-mono text-xs hover:underline"
              >
                /{form.slug}
                <ExternalLink className="size-3" aria-hidden="true" />
              </a>
            </DashboardCard>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
