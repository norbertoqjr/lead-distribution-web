import type { Metadata } from 'next';
import { getApiHealth } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Health',
  description: 'Live status of the API and its database connection.',
};

// Always hit the API — a cached health page reports stale state, which is
// worse than no health page at all.
export const dynamic = 'force-dynamic';

type Tone = 'ok' | 'warn' | 'danger';

function Badge({ tone, children }: { tone: Tone; children: string }) {
  return (
    <span className={`badge badge--${tone}`}>
      {/* Dot is decorative; the text beside it carries the meaning. */}
      <span className="badge__dot" aria-hidden="true" />
      {children}
    </span>
  );
}

export default async function HealthPage() {
  const health = await getApiHealth();

  const reachable = health !== null;
  const databaseUp = health?.database === 'up';

  return (
    <section className="section">
      <div className="container">
        <h1>System health</h1>
        <p className="hero__lede" style={{ marginTop: 'var(--space-2)' }}>
          Live check of the frontend’s connection to the API and the API’s
          connection to MySQL.
        </p>

        <dl className="status-list">
          <div className="status-row">
            <div className="status-row__label">
              <dt className="status-row__term">Web</dt>
              <dd className="status-row__hint">This Next.js application</dd>
            </div>
            <dd className="status-row__value">
              <Badge tone="ok">Running</Badge>
            </dd>
          </div>

          <div className="status-row">
            <div className="status-row__label">
              <dt className="status-row__term">API</dt>
              <dd className="status-row__hint">
                NestJS service on the private port
              </dd>
            </div>
            <dd className="status-row__value">
              {reachable ? (
                <Badge tone={health.status === 'ok' ? 'ok' : 'warn'}>
                  {health.status === 'ok' ? 'Reachable' : 'Degraded'}
                </Badge>
              ) : (
                <Badge tone="danger">Unreachable</Badge>
              )}
            </dd>
          </div>

          <div className="status-row">
            <div className="status-row__label">
              <dt className="status-row__term">Database</dt>
              <dd className="status-row__hint">MySQL via TypeORM</dd>
            </div>
            <dd className="status-row__value">
              {!reachable ? (
                <Badge tone="warn">Unknown</Badge>
              ) : databaseUp ? (
                <Badge tone="ok">Connected</Badge>
              ) : (
                <Badge tone="danger">Disconnected</Badge>
              )}
            </dd>
          </div>
        </dl>

        {!reachable && (
          <p className="note" style={{ marginTop: 'var(--space-6)' }}>
            The API did not respond. Start it with <span className="mono">npm
            run dev</span> from the project root, and confirm{' '}
            <span className="mono">BACKEND_URL</span> in{' '}
            <span className="mono">web/.env.local</span> points at the API port.
          </p>
        )}

        {reachable && !databaseUp && (
          <p className="note" style={{ marginTop: 'var(--space-6)' }}>
            The API is running but cannot reach MySQL. Start the database with{' '}
            <span className="mono">npm run db:up</span> and check{' '}
            <span className="mono">DATABASE_URL</span> in{' '}
            <span className="mono">api/.env</span>.
          </p>
        )}
      </div>
    </section>
  );
}
