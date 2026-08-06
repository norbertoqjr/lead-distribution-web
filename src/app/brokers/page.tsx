import Link from 'next/link';
import type { Metadata } from 'next';
import { z } from 'zod';
import { apiFetch } from '@/lib/api';
import { brokerResponseSchema } from '@/lib/schemas';
import { AdminShell, EmptyState, PageHeader } from '@/components/admin/shell';
import { BrokerForm } from '@/components/admin/broker-form';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatWorkingDays, minutesToTime } from '@/lib/format';

export const metadata: Metadata = { title: 'Brokers' };
export const dynamic = 'force-dynamic';

export default async function BrokersPage() {
  const brokers = await apiFetch('/brokers', z.array(brokerResponseSchema));

  return (
    <AdminShell>
      <PageHeader
        title="Brokers"
        description="Availability is evaluated in each broker's own timezone."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="min-w-0">
          {brokers.length === 0 ? (
            <EmptyState
              title="No brokers yet"
              description="Add your first broker to start distributing leads."
            />
          ) : (
            <div className="overflow-x-auto rounded-lg border">
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
                  {brokers.map((broker) => (
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
                        <Badge variant={broker.isActive ? 'default' : 'outline'}>
                          {broker.isActive ? 'Active' : 'Inactive'}
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
                        {broker.dailyCap === 0 ? '∞' : broker.dailyCap}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <BrokerForm />
      </div>
    </AdminShell>
  );
}
