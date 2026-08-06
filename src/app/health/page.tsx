import type { Metadata } from "next";
import { getApiHealth } from "@/lib/api";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Health",
  description: "Live status of the API and its database connection.",
};

// Always hit the API — a cached health page reports stale state, which is
// worse than no health page at all.
export const dynamic = "force-dynamic";

type Tone = "ok" | "warn" | "danger";

const tones: Record<Tone, string> = {
  ok: "bg-success/15 text-success",
  warn: "bg-warning/15 text-warning",
  danger: "bg-destructive/15 text-destructive",
};

function StatusBadge({ tone, children }: { tone: Tone; children: string }) {
  return (
    <Badge variant="outline" className={`border-transparent ${tones[tone]}`}>
      {/* The dot is decorative; the text beside it carries the meaning. */}
      <span
        className="mr-1.5 size-1.5 rounded-full bg-current"
        aria-hidden="true"
      />
      {children}
    </Badge>
  );
}

function Row({
  term,
  hint,
  children,
}: {
  term: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-4 not-first:border-t">
      <div>
        <dt className="font-medium">{term}</dt>
        <dd className="text-muted-foreground text-sm">{hint}</dd>
      </div>
      <dd>{children}</dd>
    </div>
  );
}

export default async function HealthPage() {
  const health = await getApiHealth();

  const reachable = health !== null;
  const databaseUp = health?.database === "up";

  return (
    <>
      <SiteHeader />

      <main id="main" className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-2xl font-semibold tracking-tight">System health</h1>
        <p className="text-muted-foreground mt-1 mb-6 text-sm">
          Live check of the frontend’s connection to the API, and the API’s
          connection to MySQL.
        </p>

        <dl className="bg-card overflow-hidden rounded-lg border">
          <Row term="Web" hint="This Next.js application">
            <StatusBadge tone="ok">Running</StatusBadge>
          </Row>

          <Row term="API" hint="NestJS service on the private port">
            {reachable ? (
              <StatusBadge tone={health.status === "ok" ? "ok" : "warn"}>
                {health.status === "ok" ? "Reachable" : "Degraded"}
              </StatusBadge>
            ) : (
              <StatusBadge tone="danger">Unreachable</StatusBadge>
            )}
          </Row>

          <Row term="Database" hint="MySQL via TypeORM">
            {!reachable ? (
              <StatusBadge tone="warn">Unknown</StatusBadge>
            ) : databaseUp ? (
              <StatusBadge tone="ok">Connected</StatusBadge>
            ) : (
              <StatusBadge tone="danger">Disconnected</StatusBadge>
            )}
          </Row>
        </dl>

        {/* Say what to actually do, not just that something is wrong. */}
        {!reachable && (
          <Card className="border-l-warning mt-6 border-l-2">
            <CardContent className="text-muted-foreground pt-6 text-sm">
              The API did not respond. Start it with{" "}
              <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">
                npm run dev
              </code>{" "}
              from the project root, and confirm{" "}
              <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">
                BACKEND_URL
              </code>{" "}
              in{" "}
              <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">
                web/.env.local
              </code>{" "}
              points at the API port.
            </CardContent>
          </Card>
        )}

        {reachable && !databaseUp && (
          <Card className="border-l-warning mt-6 border-l-2">
            <CardContent className="text-muted-foreground pt-6 text-sm">
              The API is running but cannot reach MySQL. Start the database with{" "}
              <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">
                npm run db:up
              </code>{" "}
              and check{" "}
              <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">
                DATABASE_URL
              </code>{" "}
              in{" "}
              <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">
                api/.env
              </code>
              .
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}
