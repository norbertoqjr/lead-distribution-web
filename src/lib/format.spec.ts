import { formatDateTime, formatWorkingDays, minutesToTime } from './format';

describe('minutesToTime', () => {
  it.each([
    [0, '00:00'],
    [540, '09:00'],
    [1080, '18:00'],
    [1439, '23:59'],
    [90, '01:30'],
  ])('renders %i minutes as %s', (minutes, expected) => {
    expect(minutesToTime(minutes)).toBe(expected);
  });

  it('wraps the end of day to 00:00 rather than showing 24:00', () => {
    // 1440 is the stored value for "closes at midnight"; a time input rejects
    // 24:00, so it has to come back as 00:00.
    expect(minutesToTime(1440)).toBe('00:00');
  });

  it('clamps values outside a day instead of producing nonsense', () => {
    expect(minutesToTime(-30)).toBe('00:00');
    expect(minutesToTime(9999)).toBe('00:00');
  });
});

describe('formatWorkingDays', () => {
  it('names the days', () => {
    expect(formatWorkingDays('1,2,3,4,5')).toBe('Mon, Tue, Wed, Thu, Fri');
  });

  it('collapses a full week to a phrase', () => {
    expect(formatWorkingDays('1,2,3,4,5,6,7')).toBe('Every day');
  });

  it('handles a single day', () => {
    expect(formatWorkingDays('7')).toBe('Sun');
  });

  it('says None for an empty set rather than rendering blank', () => {
    expect(formatWorkingDays('')).toBe('None');
  });

  it('ignores values outside 1-7', () => {
    expect(formatWorkingDays('0,1,8,9')).toBe('Mon');
  });

  it('tolerates stray whitespace', () => {
    expect(formatWorkingDays('1, 2 ,3')).toBe('Mon, Tue, Wed');
  });
});

describe('formatDateTime', () => {
  it('renders a dash for a lead that was never assigned', () => {
    // assignedAt is null until a broker receives the lead; the column must not
    // show "Invalid Date".
    expect(formatDateTime(null)).toBe('—');
  });

  it('formats a real timestamp', () => {
    expect(formatDateTime('2024-01-01T09:00:00.000Z')).not.toBe('—');
  });
});
