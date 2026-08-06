import { AxiosError, AxiosHeaders } from 'axios';
import { statusOf, toMessage } from './http';

/** Minimal AxiosError carrying a response body, as the API would send. */
function errorWith(status: number, data: unknown): AxiosError {
  const error = new AxiosError('Request failed');
  error.response = {
    status,
    statusText: '',
    data,
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
  };
  return error;
}

describe('toMessage', () => {
  it('surfaces a business error verbatim', () => {
    // The exam requires this exact string to reach the admin.
    expect(
      toMessage(errorWith(400, { message: 'Oops, please create a form first.' })),
    ).toBe('Oops, please create a form first.');
  });

  it('joins the array of messages a validation failure returns', () => {
    expect(
      toMessage(
        errorWith(400, {
          message: ['Name is required', 'Enter a valid email address'],
        }),
      ),
    ).toBe('Name is required. Enter a valid email address');
  });

  it('explains an expired session', () => {
    expect(toMessage(errorWith(401, {}))).toBe(
      'Your session has expired. Sign in again.',
    );
  });

  it('distinguishes an unreachable server from a rejected request', () => {
    const offline = new AxiosError('Network Error');
    expect(toMessage(offline)).toBe(
      'Cannot reach the server. Please try again.',
    );
  });

  it('reports a timeout as a timeout', () => {
    const timeout = new AxiosError('timeout', 'ECONNABORTED');
    expect(toMessage(timeout)).toBe('The request timed out. Please try again.');
  });

  it('falls back for a non-axios error', () => {
    expect(toMessage(new Error('boom'))).toBe(
      'Something went wrong. Please try again.',
    );
  });
});

describe('statusOf', () => {
  it('returns the response status', () => {
    expect(statusOf(errorWith(409, {}))).toBe(409);
  });

  it('returns undefined when there was no response', () => {
    expect(statusOf(new Error('boom'))).toBeUndefined();
  });
});
