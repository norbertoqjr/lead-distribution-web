'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';

/**
 * Disables itself while the action is in flight, so a double click cannot
 * create two brokers or submit a lead twice.
 */
export function SubmitButton({
  children,
  pendingLabel = 'Saving…',
  variant,
  size,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: React.ComponentProps<typeof Button>['variant'];
  size?: React.ComponentProps<typeof Button>['size'];
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} variant={variant} size={size}>
      {pending ? pendingLabel : children}
    </Button>
  );
}
