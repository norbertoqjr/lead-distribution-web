export function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  // role="alert" so screen readers announce the error when it appears.
  return (
    <p role="alert" className="text-destructive mt-1 text-sm">
      {message}
    </p>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm"
    >
      {message}
    </p>
  );
}
