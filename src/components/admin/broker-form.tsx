"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { http, toMessage } from "@/lib/http";
import {
  brokerSchema,
  type Broker,
  type BrokerFormValues,
  type BrokerInput,
} from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError, FormError } from "./field-error";
import { minutesToTime, parseWorkingDays } from "@/lib/format";

const DAYS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 7, label: "Sun" },
];

// A short list covers the exam; Intl.supportedValuesOf would offer hundreds.
const TIMEZONES = [
  "UTC",
  "Asia/Manila",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Kolkata",
  "Australia/Sydney",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
];

/** "09:00" to minutes from midnight. */
function toMinutes(value: string): number {
  if (!value.includes(":")) return 0;
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Creates a broker, or edits one when given `broker`.
 *
 * The two are the same set of fields with the same validation, so they share a
 * component rather than drifting apart — an edit form that accepts something
 * the create form rejects is a bug waiting to happen.
 */
export function BrokerForm({ broker }: { broker?: Broker }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string>();
  const [saved, setSaved] = useState(false);
  const editing = broker !== undefined;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    // <input, context, output>: `isActive` has a default, so it is optional
    // going in and guaranteed coming out.
  } = useForm<BrokerFormValues, unknown, BrokerInput>({
    resolver: zodResolver(brokerSchema),
    mode: "onBlur",
    defaultValues: {
      name: broker?.name ?? "",
      isActive: broker?.isActive ?? true,
      dailyCap: broker?.dailyCap ?? 0,
      timezone: broker?.timezone ?? "Asia/Manila",
      openMinute: broker?.openMinute ?? 9 * 60,
      closeMinute: broker?.closeMinute ?? 18 * 60,
      workingDays: broker
        ? parseWorkingDays(broker.workingDays)
        : [1, 2, 3, 4, 5],
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(undefined);
    setSaved(false);

    try {
      if (editing) {
        await http.patch(`/brokers/${broker.id}`, values);
        setSaved(true);
      } else {
        await http.post("/brokers", values);
        reset();
      }

      // Re-render the server component so the table and the page header show
      // the change without a reload.
      router.refresh();
    } catch (error) {
      setFormError(toMessage(error));
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {editing ? "Edit broker" : "Add a broker"}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <FormError message={formError} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Broker name</Label>
              <Input
                id="name"
                className="mt-1.5"
                aria-invalid={Boolean(errors.name)}
                {...register("name")}
              />
              <FieldError message={errors.name?.message} />
            </div>

            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <select
                id="timezone"
                className="border-input bg-background mt-1.5 h-9 w-full rounded-md border px-3 text-sm"
                {...register("timezone")}
              >
                {TIMEZONES.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </select>
              <FieldError message={errors.timezone?.message} />
            </div>

            {/* Times are edited as HH:MM and stored as minutes from midnight,
                so a Controller converts in both directions. */}
            <Controller
              control={control}
              name="openMinute"
              render={({ field }) => (
                <div>
                  <Label htmlFor="openTime">Opening time</Label>
                  <Input
                    id="openTime"
                    type="time"
                    className="mt-1.5"
                    value={minutesToTime(field.value)}
                    onChange={(event) =>
                      field.onChange(toMinutes(event.target.value))
                    }
                    onBlur={field.onBlur}
                  />
                  <FieldError message={errors.openMinute?.message} />
                </div>
              )}
            />

            <Controller
              control={control}
              name="closeMinute"
              render={({ field }) => (
                <div>
                  <Label htmlFor="closeTime">Closing time</Label>
                  <Input
                    id="closeTime"
                    type="time"
                    className="mt-1.5"
                    value={minutesToTime(field.value)}
                    onChange={(event) =>
                      field.onChange(toMinutes(event.target.value))
                    }
                    onBlur={field.onBlur}
                  />
                  <FieldError message={errors.closeMinute?.message} />
                </div>
              )}
            />

            <div>
              <Label htmlFor="dailyCap">Daily cap</Label>
              <Input
                id="dailyCap"
                type="number"
                min={0}
                className="mt-1.5"
                aria-describedby="dailyCap-hint"
                aria-invalid={Boolean(errors.dailyCap)}
                {...register("dailyCap", { valueAsNumber: true })}
              />
              {/* Persistent helper text, not a placeholder that vanishes. */}
              <p
                id="dailyCap-hint"
                className="text-muted-foreground mt-1 text-xs"
              >
                0 means unlimited.
              </p>
              <FieldError message={errors.dailyCap?.message} />
            </div>

            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                    />
                    Active
                  </label>
                </div>
              )}
            />
          </div>

          <Controller
            control={control}
            name="workingDays"
            render={({ field }) => (
              <fieldset>
                <legend className="text-sm font-medium">Working days</legend>
                <div className="mt-2 flex flex-wrap gap-3">
                  {DAYS.map((day) => (
                    <label
                      key={day.value}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Checkbox
                        checked={field.value.includes(day.value)}
                        onCheckedChange={(checked) =>
                          field.onChange(
                            checked === true
                              ? [...field.value, day.value].sort(
                                  (a, b) => a - b,
                                )
                              : field.value.filter(
                                  (value) => value !== day.value,
                                ),
                          )
                        }
                      />
                      {day.label}
                    </label>
                  ))}
                </div>
                <FieldError message={errors.workingDays?.message} />
              </fieldset>
            )}
          />

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? editing
                  ? "Saving…"
                  : "Adding…"
                : editing
                  ? "Save changes"
                  : "Add broker"}
            </Button>

            {saved ? (
              <p role="status" className="text-muted-foreground text-sm">
                Saved.
              </p>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
