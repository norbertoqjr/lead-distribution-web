'use client';

import { useActionState } from 'react';
import { assignLead, type ActionState } from '@/lib/actions';
import type { Broker } from '@/lib/schemas';
import { SubmitButton } from './submit-button';

const initialState: ActionState = {};

/** Inline manual assignment for one unsent lead. */
export function AssignLeadForm({
  leadId,
  brokers,
}: {
  leadId: number;
  brokers: Broker[];
}) {
  const action = assignLead.bind(null, leadId);
  const [state, formAction] = useActionState(action, initialState);

  if (brokers.length === 0) {
    return <span className="text-muted-foreground text-xs">No brokers</span>;
  }

  return (
    <form action={formAction} className="flex items-center gap-2">
      <label htmlFor={`broker-${leadId}`} className="sr-only">
        Assign lead {leadId} to broker
      </label>
      <select
        id={`broker-${leadId}`}
        name="brokerId"
        defaultValue=""
        className="border-input bg-background h-9 rounded-md border px-2 text-sm"
      >
        <option value="" disabled>
          Choose…
        </option>
        {brokers.map((broker) => (
          <option key={broker.id} value={broker.id}>
            {broker.name}
          </option>
        ))}
      </select>

      <SubmitButton pendingLabel="…" variant="secondary" size="sm">
        Assign
      </SubmitButton>

      {state.error && (
        <span role="alert" className="text-destructive text-xs">
          {state.error}
        </span>
      )}
    </form>
  );
}
