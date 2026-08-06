"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { http, toMessage } from "@/lib/http";
import { formSchema, type FormInput } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError, FormError } from "./field-error";

export function CreateFormCard() {
  const router = useRouter();
  const [formError, setFormError] = useState<string>();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: { name: "", slug: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(undefined);

    try {
      await http.post("/forms", values);
      router.refresh();
    } catch (error) {
      setFormError(toMessage(error));
    }
  });

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle className="text-base">Create the lead form</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <FormError message={formError} />

          <div>
            <Label htmlFor="name">Form name</Label>
            <Input
              id="name"
              className="mt-1.5"
              aria-invalid={Boolean(errors.name)}
              {...register("name")}
            />
            <FieldError message={errors.name?.message} />
          </div>

          <div>
            <Label htmlFor="slug">Public URL slug</Label>
            <Input
              id="slug"
              className="mt-1.5"
              aria-describedby="slug-hint"
              aria-invalid={Boolean(errors.slug)}
              {...register("slug")}
            />
            <p id="slug-hint" className="text-muted-foreground mt-1 text-xs">
              Lowercase letters, numbers and hyphens. The form will live at
              /your-slug.
            </p>
            <FieldError message={errors.slug?.message} />
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating…" : "Create form"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
