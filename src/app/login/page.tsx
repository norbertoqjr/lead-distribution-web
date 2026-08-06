import type { Metadata } from "next";
import { noIndex } from "@/lib/seo";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in", robots: noIndex };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  // Read on the server and pass down. Using useSearchParams in the client
  // component instead makes Next bail out of server rendering the whole page,
  // so the form only appears after hydration.
  return <LoginForm next={next} />;
}
