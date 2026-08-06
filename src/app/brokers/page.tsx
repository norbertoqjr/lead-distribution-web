import Link from "next/link";
import type { Metadata } from "next";
import { noIndex } from "@/lib/seo";
import { apiFetch } from "@/lib/api";
import { readPaging } from "@/lib/paging";
import { brokerResponseSchema, paginatedSchema } from "@/lib/schemas";
import { DashboardCard } from "@/components/admin/dashboard-card";
import { AdminShell, EmptyState, PageHeader } from "@/components/admin/shell";
import { BrokerForm } from "@/components/admin/broker-form";
import { TablePagination } from "@/components/admin/table-pagination";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatWorkingDays, minutesToTime } from "@/lib/format";

export const metadata: Metadata = { title: "Brokers", robots: noIndex };
export const dynamic = "force-dynamic";

export default async function BrokersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; perPage?: string }>;
}) {
  const { query } = readPaging(await searchParams);
  const brokers = await apiFetch(
    `/brokers?${query}`,
    paginatedSchema(brokerResponseSchema),
  );

  return (
    <AdminShell>
      <PageHeader
        title="Brokers"
        description="Availability is evaluated in each broker's own timezone."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="min-w-0">
          {brokers.total === 0 ? (
            <EmptyState
              title="No brokers yet"
              description="Add your first broker to start distributing leads."
            />
          ) : (
            <DashboardCard bodyClassName="px-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Timezone</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead className="text-right">Daily cap</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {brokers.data.map((broker) => (
                      <TableRow key={broker.id}>
                        <TableCell className="font-medium">
                          <Link
                            href={`/brokers/${broker.id}`}
                            className="hover:underline"
                          >
                            {broker.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={broker.isActive ? "default" : "outline"}
                          >
                            {broker.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {broker.timezone}
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {minutesToTime(broker.openMinute)}–
                          {minutesToTime(broker.closeMinute)}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatWorkingDays(broker.workingDays)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {broker.dailyCap === 0 ? "∞" : broker.dailyCap}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <TablePagination
                total={brokers.total}
                page={brokers.page}
                perPage={brokers.perPage}
                totalPages={brokers.totalPages}
                noun="broker"
              />
            </DashboardCard>
          )}
        </div>

        <BrokerForm />
      </div>
    </AdminShell>
  );
}
