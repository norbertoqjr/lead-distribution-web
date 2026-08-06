import type { Metadata } from "next";
import { z } from "zod";
import { apiFetch } from "@/lib/api";
import {
  brokerResponseSchema,
  distributionResponseSchema,
  leadResponseSchema,
} from "@/lib/schemas";
import { DashboardCard } from "@/components/admin/dashboard-card";
import { AdminShell, EmptyState, PageHeader } from "@/components/admin/shell";
import {
  CreateDistribution,
  DistributionBrokers,
} from "@/components/admin/distribution-setup";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Distribution" };
export const dynamic = "force-dynamic";

export default async function DistributionPage() {
  const [distribution, brokers] = await Promise.all([
    apiFetch("/distributions", distributionResponseSchema.nullable()),
    apiFetch("/brokers", z.array(brokerResponseSchema)),
  ]);

  if (!distribution) {
    return (
      <AdminShell>
        <PageHeader
          title="Distribution"
          description="Only one distribution can exist, and it attaches to the form automatically."
        />
        <CreateDistribution brokers={brokers} />
      </AdminShell>
    );
  }

  // Full history through the distribution: sent, unsent, duplicate, failed.
  const leads = await apiFetch(
    `/distributions/${distribution.id}/leads`,
    z.array(leadResponseSchema),
  );

  return (
    <AdminShell>
      <PageHeader
        title="Distribution"
        description={
          distribution.form
            ? `Attached to “${distribution.form.name}” at /${distribution.form.slug}`
            : undefined
        }
      />

      <div className="space-y-6">
        <DistributionBrokers distribution={distribution} brokers={brokers} />

        <section>
          <h2 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
            Lead history
          </h2>

          {leads.length === 0 ? (
            <EmptyState
              title="Nothing has come through yet"
              description="Every lead that passes through this distribution appears here, including duplicates and failures."
            />
          ) : (
            <DashboardCard bodyClassName="px-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lead</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>IP address</TableHead>
                      <TableHead>Broker</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Note</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">
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
                        <TableCell className="text-muted-foreground text-sm">
                          {lead.note ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </DashboardCard>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
