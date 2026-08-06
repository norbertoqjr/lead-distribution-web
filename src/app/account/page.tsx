import type { Metadata } from "next";
import { apiFetch } from "@/lib/api";
import { meSchema } from "@/lib/schemas";
import { AdminShell, PageHeader } from "@/components/admin/shell";
import { ProfileForm } from "@/components/admin/profile-form";
import { noIndex } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Account profile",
  robots: noIndex,
};
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await apiFetch("/auth/me", meSchema);

  return (
    <AdminShell>
      <PageHeader
        title="Account profile"
        description="Update your display name or change your password."
      />
      <ProfileForm user={user} />
    </AdminShell>
  );
}
