import { Badge } from '@/components/ui/badge';
import type { LeadStatus } from '@/lib/schemas';

const styles: Record<LeadStatus, string> = {
  sent: 'border-transparent bg-success/15 text-success',
  unsent: 'border-transparent bg-warning/15 text-warning',
  duplicate: 'border-transparent bg-muted text-muted-foreground',
  failed: 'border-transparent bg-destructive/15 text-destructive',
};

/** Text carries the meaning; colour only reinforces it. */
export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <Badge variant="outline" className={styles[status]}>
      {status}
    </Badge>
  );
}
