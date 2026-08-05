import { getApiHealth } from './api';

describe('getApiHealth', () => {
  const originalBackendUrl = process.env.BACKEND_URL;

  beforeEach(() => {
    process.env.BACKEND_URL = 'http://127.0.0.1:8193';
  });

  afterAll(() => {
    process.env.BACKEND_URL = originalBackendUrl;
  });

  const jsonResponse = (body: unknown, ok = true): Response =>
    ({ ok, json: async () => body }) as Response;

  it('returns the parsed health payload', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue(jsonResponse({ status: 'ok', database: 'up' }));

    await expect(getApiHealth(fetchMock)).resolves.toEqual({
      status: 'ok',
      database: 'up',
    });
  });

  it('requests the health endpoint without caching', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue(jsonResponse({ status: 'ok', database: 'up' }));

    await getApiHealth(fetchMock);

    // Caching would pin the first result for the life of the process, so the
    // page would keep reporting a dead backend as healthy.
    expect(fetchMock).toHaveBeenCalledWith('http://127.0.0.1:8193/api/health', {
      cache: 'no-store',
    });
  });

  it('returns null on a non-ok response', async () => {
    const fetchMock = jest.fn().mockResolvedValue(jsonResponse({}, false));

    await expect(getApiHealth(fetchMock)).resolves.toBeNull();
  });

  it('returns null when the backend is unreachable', async () => {
    const fetchMock = jest.fn().mockRejectedValue(new Error('ECONNREFUSED'));

    await expect(getApiHealth(fetchMock)).resolves.toBeNull();
  });

  it('returns null when BACKEND_URL is unset rather than calling undefined', async () => {
    delete process.env.BACKEND_URL;
    const fetchMock = jest.fn();

    await expect(getApiHealth(fetchMock)).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
