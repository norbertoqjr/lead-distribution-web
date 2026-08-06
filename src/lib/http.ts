import axios, { AxiosError, type AxiosInstance } from "axios";
import { z } from "zod";

/**
 * Browser-side axios client. Requests go to `/api/...` on this origin and are
 * forwarded by the route handler in src/app/api/[...path]/route.ts — the
 * backend's real address is never exposed to the browser.
 */
export const http: AxiosInstance = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  // The session cookie is httpOnly and same-origin; this keeps it attached.
  withCredentials: true,
  timeout: 15000,
});

const errorBodySchema = z.object({
  message: z.union([z.string(), z.array(z.string())]),
});

/**
 * A message worth showing a user, pulled from the API's error body.
 *
 * The API sends a string for business errors ("Oops, please create a form
 * first.") and an array for DTO validation failures, so both are handled.
 */
export function toMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    if (error.code === "ECONNABORTED") {
      return "The request timed out. Please try again.";
    }

    if (!error.response) {
      return "Cannot reach the server. Please try again.";
    }

    const parsed = errorBodySchema.safeParse(error.response.data);

    if (parsed.success) {
      return Array.isArray(parsed.data.message)
        ? parsed.data.message.join(". ")
        : parsed.data.message;
    }

    if (error.response.status === 401) {
      return "Your session has expired. Sign in again.";
    }
  }

  return "Something went wrong. Please try again.";
}

/** Status code, when the failure came from a response at all. */
export function statusOf(error: unknown): number | undefined {
  return error instanceof AxiosError ? error.response?.status : undefined;
}
