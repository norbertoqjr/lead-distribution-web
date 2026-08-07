"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { http, toMessage } from "@/lib/http";
import { leadFormSchema, type LeadFormInput } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError, FormError } from "@/components/admin/field-error";

/**
 * Marks a field as required for sighted users and screen readers alike. An
 * asterisk alone is decoration; the visually hidden word is what actually
 * announces.
 */
function RequiredMark() {
  return (
    <span className="text-destructive">
      *<span className="sr-only"> required</span>
    </span>
  );
}

export function PublicLeadForm({ slug }: { slug: string }) {
  const [formError, setFormError] = useState<string>();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormInput>({
    resolver: zodResolver(leadFormSchema),
    mode: "onBlur",
    defaultValues: { name: "", email: "", phone: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(undefined);

    try {
      await http.post(
        `/public/forms/${encodeURIComponent(slug)}/submit`,
        values,
      );
      setSubmitted(true);
    } catch (error) {
      setFormError(toMessage(error));
    }
  });

  if (submitted) {
    return (
      <div
        role="status"
        className="border-success/40 bg-success/10 rounded-xl border px-6 py-8 text-center"
      >
        <span className="bg-success/15 text-success mx-auto grid size-11 place-items-center rounded-full">
          <CheckCircle2 className="size-6" aria-hidden="true" />
        </span>
        <p className="mt-4 text-lg font-semibold">We have your details</p>
        <p className="text-muted-foreground mx-auto mt-1.5 max-w-xs text-sm/6">
          Your enquiry is on its way to a specialist. Expect to hear from them
          within one business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        {/* h1 is the form name alongside this card, so the card steps down to
            h2 rather than competing with it. */}
        <h2 className="leading-none font-semibold">Send your details</h2>
        <p className="text-muted-foreground text-sm">
          Fields marked with an asterisk are required.
        </p>
      </div>

      <FormError message={formError} />

      <div>
        <Label htmlFor="name">
          Name <RequiredMark />
        </Label>
        <Input
          id="name"
          autoComplete="name"
          autoFocus
          aria-invalid={Boolean(errors.name)}
          className="mt-1.5"
          {...register("name")}
        />
        <FieldError message={errors.name?.message} />
      </div>

      <div>
        <Label htmlFor="email">
          Email <RequiredMark />
        </Label>
        <Input
          id="email"
          // type="email" brings up the right mobile keyboard.
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          className="mt-1.5"
          {...register("email")}
        />
        <FieldError message={errors.email?.message} />
      </div>

      <div>
        <Label htmlFor="phone">
          Phone <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          className="mt-1.5"
          {...register("phone")}
        />
        <FieldError message={errors.phone?.message} />
      </div>

      {/* Full width: it is the only action on the page, and a wide target is
          easier to hit on a phone one-handed. */}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Send my details"}
      </Button>

      <p className="text-muted-foreground text-center text-xs/5">
        By submitting you agree to be contacted about your enquiry.
      </p>
    </form>
  );
}
