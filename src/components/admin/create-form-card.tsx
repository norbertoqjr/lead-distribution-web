'use client';

import { useActionState } from 'react';
import { createForm, type ActionState } from '@/lib/actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SubmitButton } from './submit-button';
import { FieldError, FormError } from './field-error';

const initialState: ActionState = {};

export function CreateFormCard() {
  const [state, formAction] = useActionState(createForm, initialState);

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle className="text-base">Create the lead form</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4" noValidate>
          <FormError message={state.error} />

          <div>
            <Label htmlFor="name">Form name</Label>
            <Input id="name" name="name" required className="mt-1.5" />
            <FieldError message={state.fieldErrors?.name} />
          </div>

          <div>
            <Label htmlFor="slug">Public URL slug</Label>
            <Input
              id="slug"
              name="slug"
              required
              className="mt-1.5"
              aria-describedby="slug-hint"
            />
            <p id="slug-hint" className="text-muted-foreground mt-1 text-xs">
              Lowercase letters, numbers and hyphens. The form will live at
              /your-slug.
            </p>
            <FieldError message={state.fieldErrors?.slug} />
          </div>

          <SubmitButton pendingLabel="Creating…">Create form</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
