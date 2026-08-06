import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { z } from "zod";
import { PublicLeadForm } from "@/components/public-lead-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { noIndex } from "@/lib/seo";

export const dynamic = "force-dynamic";

const publicFormSchema = z.object({ name: z.string(), slug: z.string() });

/**
 * Unauthenticated fetch — no cookie is forwarded, because this page must work
 * for a visitor with no session.
 */
async function getForm(slug: string) {
  const url = process.env.BACKEND_URL;
  if (!url) return null;

  try {
    const response = await fetch(
      `${url}/api/public/forms/${encodeURIComponent(slug)}`,
      { cache: "no-store" },
    );

    if (!response.ok) return null;

    const parsed = publicFormSchema.safeParse(await response.json());
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const form = await getForm(slug);

  // An unknown slug renders notFound(), so it must not advertise itself as a
  // real page to a crawler that reached it from a stale link.
  if (!form) {
    return { title: "Form not found", robots: noIndex };
  }

  const description = `Submit your details to ${form.name}.`;

  return {
    title: form.name,
    description,
    alternates: { canonical: `/${form.slug}` },
    openGraph: {
      type: "website",
      title: form.name,
      description,
      url: `/${form.slug}`,
    },
  };
}

export default async function PublicFormPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const form = await getForm(slug);

  if (!form) notFound();

  return (
    <main
      id="main"
      className="mx-auto flex min-h-dvh max-w-md items-center px-6 py-12"
    >
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{form.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <PublicLeadForm slug={form.slug} />
        </CardContent>
      </Card>
    </main>
  );
}
