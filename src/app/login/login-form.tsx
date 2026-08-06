"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Route } from "lucide-react";
import { http, toMessage } from "@/lib/http";
import { loginSchema, type LoginInput } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldError, FormError } from "@/components/admin/field-error";

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string>();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    // Validate on blur, not on every keystroke — an error appearing while the
    // user is still typing their email reads as the form fighting them.
    mode: "onBlur",
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(undefined);

    try {
      await http.post("/auth/login", values);

      // The destination the middleware preserved when it redirected here.
      // Same-origin paths only: a protocol-relative value like //evil.example
      // also starts with "/", and would redirect an admin off-site the moment
      // they signed in.
      const safeNext =
        next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
      router.push(safeNext);
      router.refresh();
    } catch (error) {
      setFormError(toMessage(error));
    }
  });

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 py-12">
      {/* The wordmark is where people look for the way back out. */}
      <Link
        href="/"
        className="text-foreground flex items-center gap-2 font-semibold hover:no-underline"
      >
        <span className="bg-accent text-accent-foreground grid size-8 place-items-center rounded-md">
          <Route className="size-4.5" aria-hidden="true" />
        </span>
        Lead Distribution
      </Link>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Admin access to the lead distribution platform.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <FormError message={formError} />

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                aria-invalid={Boolean(errors.email)}
                className="mt-1.5"
                {...register("email")}
              />
              <FieldError message={errors.email?.message} />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={Boolean(errors.password)}
                className="mt-1.5"
                {...register("password")}
              />
              <FieldError message={errors.password?.message} />
            </div>

            {/* Disabled while submitting so a double click cannot fire twice */}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Second way out, for anyone who reads bottom-up. Same destination as
          the wordmark, so the label stays identical rather than inventing a
          competing phrase for the same action. */}
      <Link
        href="/"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to home
      </Link>
    </div>
  );
}
