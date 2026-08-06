import { readSessionCookie } from './session-cookie';

const NAME = 'lds_session';

describe('readSessionCookie', () => {
  it('mirrors the token the login response sets', () => {
    const header = `${NAME}=abc.def.ghi; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`;

    expect(readSessionCookie(header, NAME)).toEqual({
      type: 'set',
      value: 'abc.def.ghi',
    });
  });

  it('clears on the empty value that logout sends', () => {
    // This is the exact shape Express clearCookie() produces. Requiring a
    // non-empty value here is what broke sign out: the clear was dropped and
    // the browser kept a cookie for a session the API had discarded.
    const header = `${NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;

    expect(readSessionCookie(header, NAME)).toEqual({ type: 'clear' });
  });

  it('clears on Max-Age=0 even when a value is present', () => {
    const header = `${NAME}=stale; Path=/; Max-Age=0`;

    expect(readSessionCookie(header, NAME)).toEqual({ type: 'clear' });
  });

  it('clears on an epoch expiry even when a value is present', () => {
    const header = `${NAME}=stale; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;

    expect(readSessionCookie(header, NAME)).toEqual({ type: 'clear' });
  });

  it('does nothing when the response sets no cookie', () => {
    expect(readSessionCookie(null, NAME)).toEqual({ type: 'none' });
  });

  it('ignores a Set-Cookie for some other cookie', () => {
    expect(readSessionCookie('other=value; Path=/', NAME)).toEqual({
      type: 'none',
    });
  });
});
