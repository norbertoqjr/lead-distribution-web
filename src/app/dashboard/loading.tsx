import { AdminShell, PageHeader } from "@/components/admin/shell";
import { DashboardCard } from "@/components/admin/dashboard-card";
import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/admin/table-skeleton";

/** Mirrors the real layout, so nothing shifts when the data lands. */
export default function Loading() {
  return (
    <AdminShell>
      <PageHeader title="Dashboard" />

      <div aria-hidden="true">
        <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="bg-card border-border/60 flex min-h-42 flex-col justify-between rounded-3xl border p-5"
            >
              <Skeleton className="h-5 w-24" />
              <div className="flex items-end justify-between gap-3">
                <Skeleton className="h-12 w-20" />
                <Skeleton className="size-10 rounded-full" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3.5 grid gap-3.5 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <DashboardCard title="Latest leads" bodyClassName="px-0">
            <div className="px-5">
              <TableSkeleton columns={5} rows={5} />
            </div>
          </DashboardCard>

          <DashboardCard title="Setup">
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Skeleton className="size-5 shrink-0 rounded-full" />
                  <div className="w-full space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>
      </div>
    </AdminShell>
  );
}
