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
        className="border-success/40 bg-success/10 rounded-lg border p-6 text-center"
      >
        <CheckCircle2
          className="text-success mx-auto mb-2 size-6"
          aria-hidden="true"
        />
        <p className="font-medium">Thank you — we have your details.</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Someone will be in touch shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <FormError message={formError} />

      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          autoComplete="name"
          aria-invalid={Boolean(errors.name)}
          className="mt-1.5"
          {...register("name")}
        />
        <FieldError message={errors.name?.message} />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
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
          autoComplete="tel"
          className="mt-1.5"
          {...register("phone")}
        />
        <FieldError message={errors.phone?.message} />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Submit"}
      </Button>
    </form>
  );
}
