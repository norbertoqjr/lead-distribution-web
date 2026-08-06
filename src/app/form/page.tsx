import type { Metadata } from "next";
import { noIndex } from "@/lib/seo";
import { apiFetch } from "@/lib/api";
import { formResponseSchema } from "@/lib/schemas";
import { AdminShell, PageHeader } from "@/components/admin/shell";
import { CreateFormCard } from "@/components/admin/create-form-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Lead form", robots: noIndex };
export const dynamic = "force-dynamic";

export default async function FormPage() {
  const form = await apiFetch("/forms", formResponseSchema.nullable());

  return (
    <AdminShell>
      <PageHeader
        title="Lead form"
        description="Only one form can exist. Once created, it cannot be replaced."
      />

      {/* The create form is not rendered at all once one exists — an action
          the system will reject should not be offered. */}
      {form ? (
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle className="text-base">{form.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Public URL</span>
              <a href={`/${form.slug}`} className="font-mono hover:underline">
                /{form.slug}
              </a>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Created</span>
              <span>{formatDateTime(form.createdAt)}</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <CreateFormCard />
      )}
    </AdminShell>
  );
}
