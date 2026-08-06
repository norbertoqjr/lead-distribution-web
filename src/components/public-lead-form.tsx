'use client';

import { useActionState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { submitLead, type ActionState } from '@/lib/actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SubmitButton } from '@/components/admin/submit-button';
import { FieldError, FormError } from '@/components/admin/field-error';

const initialState: ActionState = {};

export function PublicLeadForm({ slug }: { slug: string }) {
  const action = submitLead.bind(null, slug);
  const [state, formAction] = useActionState(action, initialState);

  if (state.success) {
    return (
      <div
        role="status"
        className="border-[color:var(--success)]/40 bg-[color:var(--success)]/10 rounded-lg border p-6 text-center"
      >
        <CheckCircle2
          className="mx-auto mb-2 size-6 text-[color:var(--success)]"
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
    <form action={formAction} className="space-y-4" noValidate>
      <FormError message={state.error} />

      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          required
          aria-invalid={Boolean(state.fieldErrors?.name)}
          className="mt-1.5"
        />
        <FieldError message={state.fieldErrors?.name} />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          // type="email" brings up the right mobile keyboard.
          type="email"
          autoComplete="email"
          required
          aria-invalid={Boolean(state.fieldErrors?.email)}
          className="mt-1.5"
        />
        <FieldError message={state.fieldErrors?.email} />
      </div>

      <div>
        <Label htmlFor="phone">
          Phone <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          className="mt-1.5"
        />
        <FieldError message={state.fieldErrors?.phone} />
      </div>

      <SubmitButton pendingLabel="Sending…">Submit</SubmitButton>
    </form>
  );
}
