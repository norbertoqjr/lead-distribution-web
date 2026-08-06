'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { http, toMessage } from '@/lib/http';
import type { Broker } from '@/lib/schemas';
import { Button } from '@/components/ui/button';

/** Inline manual assignment for one unsent lead. */
export function AssignLeadForm({
  leadId,
  brokers,
}: {
  leadId: number;
  brokers: Broker[];
}) {
  const router = useRouter();
  const [brokerId, setBrokerId] = useState('');
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  if (brokers.length === 0) {
    return <span className="text-muted-foreground text-xs">No brokers</span>;
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(undefined);

    if (!brokerId) {
      setError('Choose a broker');
      return;
    }

    setSubmitting(true);

    try {
      await http.post(`/leads/${leadId}/assign`, { brokerId: Number(brokerId) });
      router.refresh();
    } catch (requestError) {
      setError(toMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex items-center justify-end gap-2">
      <label htmlFor={`broker-${leadId}`} className="sr-only">
        Assign lead {leadId} to broker
      </label>
      <select
        id={`broker-${leadId}`}
        value={brokerId}
        onChange={(event) => setBrokerId(event.target.value)}
        className="border-input bg-background h-9 rounded-md border px-2 text-sm"
      >
        <option value="">Choose…</option>
        {brokers.map((broker) => (
          <option key={broker.id} value={broker.id}>
            {broker.name}
          </option>
        ))}
      </select>

      <Button type="submit" variant="secondary" size="sm" disabled={submitting}>
        {submitting ? '…' : 'Assign'}
      </Button>

      {error && (
        <span role="alert" className="text-destructive text-xs">
          {error}
        </span>
      )}
    </form>
  );
}
