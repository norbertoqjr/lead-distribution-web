import { getApiHealth } from '@/lib/api';

export default async function HomePage() {
  const health = await getApiHealth();

  return (
    <main>
      <h1>Lead Distribution Platform</h1>
      <p>Development scaffold. Admin area and public form come next.</p>

      <div className="status">
        {health ? (
          <>
            api: <strong>{health.status}</strong>
            <br />
            database: <strong>{health.database}</strong>
          </>
        ) : (
          <>
            api: <strong>unreachable</strong>
            <br />
            check that the backend is running
          </>
        )}
      </div>
    </main>
  );
}
