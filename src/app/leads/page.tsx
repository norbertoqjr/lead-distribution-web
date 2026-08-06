import Link from "next/link";
import type { Metadata } from "next";
import { noIndex } from "@/lib/seo";
import { z } from "zod";
import { apiFetch } from "@/lib/api";
import {
  brokerResponseSchema,
  leadResponseSchema,
  leadStatusSchema,
} from "@/lib/schemas";
import { DashboardCard } from "@/components/admin/dashboard-card";
import { AdminShell, EmptyState, PageHeader } from "@/components/admin/shell";
import { StatusBadge } from "@/components/admin/status-badge";
import { AssignLeadForm } from "@/components/admin/assign-lead-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Leads", robots: noIndex };
export const dynamic = "force-dynamic";

const FILTERS = ["all", "sent", "unsent", "duplicate", "failed"] as const;

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  // Unknown values fall back to "all" rather than reaching the API.
  const parsed = leadStatusSchema.safeParse(status);
  const active = parsed.success ? parsed.data : "all";

  const [leads, brokers] = await Promise.all([
    apiFetch(
      active === "all" ? "/leads" : `/leads?status=${active}`,
      z.array(leadResponseSchema),
    ),
    apiFetch("/brokers", z.array(brokerResponseSchema)),
  ]);

  const assignable = brokers.filter((broker) => broker.isActive);

  return (
    <AdminShell>
      <PageHeader
        title="Leads"
        description="Every submission, with the IP address captured at the time."
      />

      <nav aria-label="Filter by status" className="mb-4 flex flex-wrap gap-1">
        {FILTERS.map((filter) => (
          <Link
            key={filter}
            href={filter === "all" ? "/leads" : `/leads?status=${filter}`}
            aria-current={active === filter ? "true" : undefined}
            className={cn(
              "inline-flex min-h-9 items-center rounded-md px-3 text-sm font-medium capitalize",
              active === filter
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            {filter}
          </Link>
        ))}
      </nav>

      {leads.length === 0 ? (
        <EmptyState
          title="No leads to show"
          description={
            active === "all"
              ? "Leads appear here as soon as the public form is submitted."
              : `No leads with status “${active}”.`
          }
        />
      ) : (
        <DashboardCard bodyClassName="px-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>IP address</TableHead>
                  <TableHead>Form</TableHead>
                  <TableHead>Broker</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {lead.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {lead.phone ?? "—"}
                    </TableCell>
                    <TableCell className="font-mono text-xs tabular-nums">
                      {lead.ipAddress}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {lead.formName}
                    </TableCell>
                    <TableCell>
                      {lead.broker ? (
                        <Link
                          href={`/brokers/${lead.broker.id}`}
                          className="hover:underline"
                        >
                          {lead.broker.name}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={lead.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDateTime(lead.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      {/* Only unsent leads can be assigned — a duplicate must
                        never reach a second broker. */}
                      {lead.status === "unsent" ? (
                        <AssignLeadForm leadId={lead.id} brokers={assignable} />
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DashboardCard>
      )}
    </AdminShell>
  );
}
