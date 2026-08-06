import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { noIndex } from "@/lib/seo";
import { z } from "zod";
import { ApiError, apiFetch } from "@/lib/api";
import {
  brokerResponseSchema,
  leadResponseSchema,
  type Broker,
  type Lead,
} from "@/lib/schemas";
import { DashboardCard } from "@/components/admin/dashboard-card";
import { AdminShell, EmptyState, PageHeader } from "@/components/admin/shell";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime, formatWorkingDays, minutesToTime } from "@/lib/format";

export const metadata: Metadata = { title: "Broker", robots: noIndex };
export const dynamic = "force-dynamic";

export default async function BrokerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Only the fetch sits inside try/catch. JSX built there would not have its
  // render errors caught anyway, and the lint rule is right to flag it.
  let broker: Broker;
  let leads: Lead[];

  try {
    [broker, leads] = await Promise.all([
      apiFetch(`/brokers/${id}`, brokerResponseSchema),
      apiFetch(`/brokers/${id}/leads`, z.array(leadResponseSchema)),
    ]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <AdminShell>
      <PageHeader
        title={broker.name}
        description={`${broker.timezone} · ${minutesToTime(broker.openMinute)}–${minutesToTime(
          broker.closeMinute,
        )} · ${formatWorkingDays(broker.workingDays)} · cap ${
          broker.dailyCap === 0 ? "unlimited" : broker.dailyCap
        }`}
      />

      {leads.length === 0 ? (
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
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDateTime(lead.assignedAt)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={lead.status} />
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
