import { AdminShell, PageHeader } from '@/components/admin/shell';
import { TableSkeleton } from '@/components/admin/table-skeleton';

export default function Loading() {
  return (
    <AdminShell>
      <PageHeader title="Brokers" />
      <TableSkeleton />
    </AdminShell>
  );
}
