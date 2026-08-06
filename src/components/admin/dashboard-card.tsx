import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Standard content panel: title, optional action, body. Wraps shadcn Card so
 * every dashboard section shares one radius, padding and border treatment.
 */
export function DashboardCard({
  title,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      {title && (
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {action}
        </CardHeader>
      )}
      <CardContent className={cn(title ? 'pt-0' : 'pt-0', bodyClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
