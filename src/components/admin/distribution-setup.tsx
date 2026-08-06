'use client';

import { useActionState } from 'react';
import {
  createDistribution,
  setDistributionBrokers,
  type ActionState,
} from '@/lib/actions';
import type { Broker, Distribution } from '@/lib/schemas';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SubmitButton } from './submit-button';
import { FormError } from './field-error';

const initialState: ActionState = {};

/** Shown before a distribution exists. */
export function CreateDistribution({ brokers }: { brokers: Broker[] }) {
  const [state, formAction] = useActionState(createDistribution, initialState);

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="text-base">Create the distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {/* Carries the API's exact message when no form exists yet. */}
          <FormError message={state.error} />

          {brokers.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Create at least one broker first.
            </p>
          ) : (
            <fieldset>
              <legend className="text-sm font-medium">Include brokers</legend>
              <div className="mt-2 space-y-2">
                {brokers.map((broker) => (
                  <label
                    key={broker.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Checkbox name="brokerIds" value={broker.id} defaultChecked />
                    {broker.name}
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <SubmitButton pendingLabel="Creating…">
            Create distribution
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}

/** Percentage editor, shown once the distribution exists. */
export function DistributionBrokers({
  distribution,
  brokers,
}: {
  distribution: Distribution;
  brokers: Broker[];
}) {
  const action = setDistributionBrokers.bind(null, distribution.id);
  const [state, formAction] = useActionState(action, initialState);

  const total = distribution.brokers
    .filter((member) => member.isActive)
    .reduce((sum, member) => sum + member.percentage, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Broker shares</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <FormError message={state.error} />

          <div className="space-y-3">
            {brokers.map((broker) => {
              const member = distribution.brokers.find(
                (entry) => entry.brokerId === broker.id,
              );

              return (
                <div
                  key={broker.id}
                  className="flex flex-wrap items-center gap-3 rounded-md border p-3"
                >
                  <label className="flex min-w-40 flex-1 items-center gap-2 text-sm font-medium">
                    <Checkbox
                      name="brokerIds"
                      value={broker.id}
                      defaultChecked={Boolean(member)}
                    />
                    {broker.name}
                  </label>

                  <div className="flex items-center gap-2">
                    <label
                      htmlFor={`percentage-${broker.id}`}
                      className="text-muted-foreground text-sm"
                    >
                      Share
                    </label>
                    <Input
                      id={`percentage-${broker.id}`}
                      name={`percentage-${broker.id}`}
                      type="number"
                      min={0}
                      max={100}
                      step="0.01"
                      defaultValue={member?.percentage ?? 0}
                      className="w-24 tabular-nums"
                    />
                    <span className="text-muted-foreground text-sm">%</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-muted-foreground text-sm tabular-nums">
              Active total: {total}%
              {total !== 100 && (
                // A warning, not a block: the algorithm still works, shares are
                // simply relative rather than absolute.
                <span className="text-[color:var(--warning)]">
                  {' '}
                  · shares are treated as relative weights unless this is 100
                </span>
              )}
            </p>
            <SubmitButton>Save shares</SubmitButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
