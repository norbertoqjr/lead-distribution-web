import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { noIndex } from "@/lib/seo";
import { apiFetch } from "@/lib/api";
import { ALL, readPaging } from "@/lib/paging";
import {
  brokerResponseSchema,
  distributionResponseSchema,
  leadResponseSchema,
  paginatedSchema,
} from "@/lib/schemas";
import { DashboardCard } from "@/components/admin/dashboard-card";
import { AdminShell, EmptyState, PageHeader } from "@/components/admin/shell";
import {
  CreateDistribution,
  DistributionBrokers,
} from "@/components/admin/distribution-setup";
import { StatusBadge } from "@/components/admin/status-badge";
import { TablePagination } from "@/components/admin/table-pagination";
import { TabLinks } from "@/components/admin/tab-links";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Distribution", robots: noIndex };
export const dynamic = "force-dynamic";

type Search = { tab?: string; page?: string; perPage?: string };

export default async function DistributionPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const { query } = readPaging(params);

  // Anything unrecognised falls back to shares rather than rendering nothing.
  const tab = params.tab === "leads" ? "leads" : "shares";

  const [distribution, brokers] = await Promise.all([
    apiFetch("/distributions", distributionResponseSchema.nullable()),
    apiFetch(`/brokers?${ALL}`, paginatedSchema(brokerResponseSchema)),
  ]);

  if (!distribution) {
    return (
      <AdminShell>
        <PageHeader
          title="Distribution"
          description="Only one distribution can exist, and it attaches to the form automatically."
        />
        <CreateDistribution brokers={brokers.data} />
      </AdminShell>
    );
  }

  // On the shares tab only the count is rendered, so ask for a single row
  // rather than a full page of leads nobody will see.
  const leads = await apiFetch(
    `/distributions/${distribution.id}/leads?${
      tab === "leads" ? query : "page=1&perPage=1"
    }`,
    paginatedSchema(leadResponseSchema),
  );

  const included = distribution.brokers.filter((entry) => entry.isActive);
  const share = included.reduce((sum, entry) => sum + entry.percentage, 0);

  return (
    <AdminShell>
      <PageHeader
        title="Distribution"
        description="How incoming leads are split between brokers, and everything that has passed through."
      />

      {/* Facts that apply to both tabs sit above them, so switching tabs does
          not hide the context you were just reading. */}
      <dl className="mb-5 grid gap-3.5 sm:grid-cols-3">
        <div className="bg-card border-border/60 rounded-3xl border p-5">
          <dt className="text-muted-foreground text-sm">Attached form</dt>
          <dd className="mt-1 font-medium">
            {distribution.form ? (
              <Link
                href={`/${distribution.form.slug}`}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 hover:underline"
              >
                {distribution.form.name}
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </Link>
            ) : (
              "None"
            )}
          </dd>
        </div>

        <div className="bg-card border-border/60 rounded-3xl border p-5">
          <dt className="text-muted-foreground text-sm">Active brokers</dt>
          <dd className="mt-1 font-medium tabular-nums">
            {included.length} of {distribution.brokers.length}
          </dd>
        </div>

        <div className="bg-card border-border/60 rounded-3xl border p-5">
          <dt className="text-muted-foreground text-sm">Allocated share</dt>
          <dd className="mt-1 font-medium tabular-nums">
            {share}%
            {share !== 100 && (
              <span className="text-warning ml-2 text-xs font-normal">
                treated as relative weights
              </span>
            )}
          </dd>
        </div>
      </dl>

      <div className="mb-4">
        <TabLinks
          label="Distribution sections"
          active={tab}
          tabs={[
            {
              value: "shares",
              label: "Broker shares",
              count: included.length,
              href: "/distribution",
            },
            {
              value: "leads",
              label: "Lead history",
              count: leads.total,
              // Paging resets when arriving from the other tab.
              href: "/distribution?tab=leads",
            },
          ]}
        />
      </div>

      {tab === "shares" ? (
        <DistributionBrokers
          distribution={distribution}
          brokers={brokers.data}
        />
      ) : (
        <DashboardCard title="Lead history" bodyClassName="px-0">
          {leads.total === 0 ? (
            <div className="px-5">
              <EmptyState
                title="Nothing has come through yet"
                description="Every lead that passes through this distribution appears here, including duplicates and failures."
              />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="pl-5">Lead</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>IP address</TableHead>
                      <TableHead>Broker</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="pr-5">Note</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.data.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="pl-5 font-medium">
                          {lead.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {lead.email}
                        </TableCell>
                        <TableCell className="font-mono text-xs tabular-nums">
                          {lead.ipAddress}
                        </TableCell>
                        <TableCell>{lead.broker?.name ?? "—"}</TableCell>
                        <TableCell>
                          <StatusBadge status={lead.status} />
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDateTime(lead.createdAt)}
                        </TableCell>
                        <TableCell className="text-muted-foreground pr-5 text-sm">
                          {lead.note ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <TablePagination
                total={leads.total}
                page={leads.page}
                perPage={leads.perPage}
                totalPages={leads.totalPages}
                noun="lead"
              />
            </>
          )}
        </DashboardCard>
      )}
    </AdminShell>
  );
}
