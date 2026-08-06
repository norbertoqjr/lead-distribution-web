'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { http, toMessage } from '@/lib/http';
import {
  setBrokersSchema,
  type Broker,
  type Distribution,
  type SetBrokersFormValues,
  type SetBrokersInput,
} from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldError, FormError } from './field-error';

/** Shown before a distribution exists. */
export function CreateDistribution({ brokers }: { brokers: Broker[] }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string>();
  const [selected, setSelected] = useState<number[]>(brokers.map((b) => b.id));
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(undefined);
    setSubmitting(true);

    try {
      await http.post('/distributions', { brokerIds: selected });
      router.refresh();
    } catch (error) {
      // Carries the API's exact message when no form exists yet.
      setFormError(toMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="text-base">Create the distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <FormError message={formError} />

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
                    <Checkbox
                      checked={selected.includes(broker.id)}
                      onCheckedChange={(checked) =>
                        setSelected((current) =>
                          checked === true
                            ? [...current, broker.id]
                            : current.filter((id) => id !== broker.id),
                        )
                      }
                    />
                    {broker.name}
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create distribution'}
          </Button>
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
  const router = useRouter();
  const [formError, setFormError] = useState<string>();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SetBrokersFormValues, unknown, SetBrokersInput>({
    resolver: zodResolver(setBrokersSchema),
    mode: 'onBlur',
    defaultValues: {
      brokers: brokers.map((broker) => {
        const member = distribution.brokers.find(
          (entry) => entry.brokerId === broker.id,
        );

        return {
          brokerId: broker.id,
          percentage: member?.percentage ?? 0,
          isActive: Boolean(member),
        };
      }),
    },
  });

  // useWatch rather than watch(): the latter cannot be memoized safely and
  // re-renders the whole form on every keystroke.
  const values = useWatch({ control, name: 'brokers' });
  const total = values
    .filter((entry) => entry.isActive)
    .reduce((sum, entry) => sum + (Number(entry.percentage) || 0), 0);

  const onSubmit = handleSubmit(async (data) => {
    setFormError(undefined);

    try {
      // Only selected brokers are sent; the API removes the rest.
      await http.patch(`/distributions/${distribution.id}/brokers`, {
        brokers: data.brokers.filter((entry) => entry.isActive),
      });
      router.refresh();
    } catch (error) {
      setFormError(toMessage(error));
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Broker shares</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <FormError message={formError} />

          <div className="space-y-3">
            {brokers.map((broker, index) => (
              <div
                key={broker.id}
                className="flex flex-wrap items-center gap-3 rounded-md border p-3"
              >
                <Controller
                  control={control}
                  name={`brokers.${index}.isActive`}
                  render={({ field }) => (
                    <label className="flex min-w-40 flex-1 items-center gap-2 text-sm font-medium">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) =>
                          field.onChange(checked === true)
                        }
                      />
                      {broker.name}
                    </label>
                  )}
                />

                <div className="flex items-center gap-2">
                  <label
                    htmlFor={`percentage-${broker.id}`}
                    className="text-muted-foreground text-sm"
                  >
                    Share
                  </label>
                  <Controller
                    control={control}
                    name={`brokers.${index}.percentage`}
                    render={({ field }) => (
                      <Input
                        id={`percentage-${broker.id}`}
                        type="number"
                        min={0}
                        max={100}
                        step="0.01"
                        className="w-24 tabular-nums"
                        value={field.value}
                        onChange={(event) =>
                          field.onChange(event.target.valueAsNumber || 0)
                        }
                        onBlur={field.onBlur}
                      />
                    )}
                  />
                  <span className="text-muted-foreground text-sm">%</span>
                </div>

                <FieldError
                  message={errors.brokers?.[index]?.percentage?.message}
                />
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-muted-foreground text-sm tabular-nums">
              Active total: {total}%
              {total !== 100 && (
                // A warning, not a block: the algorithm still works, shares are
                // simply relative rather than absolute.
                <span className="text-warning">
                  {' '}
                  · shares are treated as relative weights unless this is 100
                </span>
              )}
            </p>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save shares'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
