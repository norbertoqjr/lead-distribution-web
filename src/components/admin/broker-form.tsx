'use client';

import { useActionState } from 'react';
import { createBroker, type ActionState } from '@/lib/actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SubmitButton } from './submit-button';
import { FieldError, FormError } from './field-error';

const initialState: ActionState = {};

const DAYS = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 7, label: 'Sun' },
];

// A short list covers the exam; Intl.supportedValuesOf would offer hundreds.
const TIMEZONES = [
  'UTC',
  'Asia/Manila',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Asia/Kolkata',
  'Australia/Sydney',
  'Europe/London',
  'Europe/Berlin',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
];

export function BrokerForm() {
  const [state, formAction] = useActionState(createBroker, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Add a broker</CardTitle>
      </CardHeader>

      <CardContent>
        <form action={formAction} className="space-y-4" noValidate>
          <FormError message={state.error} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Broker name</Label>
              <Input id="name" name="name" required className="mt-1.5" />
              <FieldError message={state.fieldErrors?.name} />
            </div>

            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <select
                id="timezone"
                name="timezone"
                defaultValue="Asia/Manila"
                className="border-input bg-background mt-1.5 h-9 w-full rounded-md border px-3 text-sm"
              >
                {TIMEZONES.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </select>
              <FieldError message={state.fieldErrors?.timezone} />
            </div>

            <div>
              <Label htmlFor="openTime">Opening time</Label>
              <Input
                id="openTime"
                name="openTime"
                type="time"
                defaultValue="09:00"
                className="mt-1.5"
              />
              <FieldError message={state.fieldErrors?.openMinute} />
            </div>

            <div>
              <Label htmlFor="closeTime">Closing time</Label>
              <Input
                id="closeTime"
                name="closeTime"
                type="time"
                defaultValue="18:00"
                className="mt-1.5"
              />
              <FieldError message={state.fieldErrors?.closeMinute} />
            </div>

            <div>
              <Label htmlFor="dailyCap">Daily cap</Label>
              <Input
                id="dailyCap"
                name="dailyCap"
                type="number"
                min={0}
                defaultValue={0}
                className="mt-1.5"
                aria-describedby="dailyCap-hint"
              />
              {/* Persistent helper text, not a placeholder that vanishes. */}
              <p id="dailyCap-hint" className="text-muted-foreground mt-1 text-xs">
                0 means unlimited.
              </p>
              <FieldError message={state.fieldErrors?.dailyCap} />
            </div>

            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox name="isActive" defaultChecked />
                Active
              </label>
            </div>
          </div>

          <fieldset>
            <legend className="text-sm font-medium">Working days</legend>
            <div className="mt-2 flex flex-wrap gap-3">
              {DAYS.map((day) => (
                <label key={day.value} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    name="workingDays"
                    value={day.value}
                    defaultChecked={day.value <= 5}
                  />
                  {day.label}
                </label>
              ))}
            </div>
            <FieldError message={state.fieldErrors?.workingDays} />
          </fieldset>

          <SubmitButton pendingLabel="Adding…">Add broker</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
