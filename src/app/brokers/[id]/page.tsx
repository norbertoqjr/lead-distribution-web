import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { noIndex } from "@/lib/seo";
import { ApiError, apiFetch } from "@/lib/api";
import { readPaging } from "@/lib/paging";
import {
  brokerResponseSchema,
  leadResponseSchema,
  paginatedSchema,
  type Broker,
  type Paginated,
  type Lead,
} from "@/lib/schemas";
import { BrokerForm } from "@/components/admin/broker-form";
import { DashboardCard } from "@/components/admin/dashboard-card";
import { AdminShell, EmptyState, PageHeader } from "@/components/admin/shell";
import { StatusBadge } from "@/components/admin/status-badge";
import { TimeAgo } from "@/components/admin/time-ago";
import { TablePagination } from "@/components/admin/table-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatWorkingDays, minutesToTime } from "@/lib/format";

export const metadata: Metadata = { title: "Broker", robots: noIndex };
export const dynamic = "force-dynamic";

export default async function BrokerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; perPage?: string }>;
}) {
  const { id } = await params;
  const { query } = readPaging(await searchParams);

  // Only the fetch sits inside try/catch. JSX built there would not have its
  // render errors caught anyway, and the lint rule is right to flag it.
  let broker: Broker;
  let leads: Paginated<Lead>;

  try {
    [broker, leads] = await Promise.all([
      apiFetch(`/brokers/${id}`, brokerResponseSchema),
      apiFetch(
        `/brokers/${id}/leads?${query}`,
        paginatedSchema(leadResponseSchema),
      ),
    ]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <AdminShell>
      <PageHeader
        back={{ href: "/brokers", label: "All brokers" }}
        title={broker.name}
        description={`${broker.timezone} · ${minutesToTime(broker.openMinute)}–${minutesToTime(
          broker.closeMinute,
        )} · ${formatWorkingDays(broker.workingDays)} · cap ${
          broker.dailyCap === 0 ? "unlimited" : broker.dailyCap
        }`}
      />

      <BrokerForm broker={broker} />

      {leads.total === 0 ? (
        <EmptyState
          title="No leads yet"
          description="Leads assigned to this broker will appear here."
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
                  <TableHead>Received</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.data.map((lead) => (
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
                    <TableCell className="text-muted-foreground text-sm">
                      <TimeAgo value={lead.assignedAt} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={lead.status} />
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
        </DashboardCard>
      )}
    </AdminShell>
  );
}
