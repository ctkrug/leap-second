import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { handAngles } from '../src/dial.js';

describe('handAngles', () => {
  it('points every hand straight up at midnight', () => {
    const { hourDeg, minuteDeg, secondDeg } = handAngles(new Date('2026-07-10T00:00:00Z'));

    expect(hourDeg).toBe(0);
    expect(minuteDeg).toBe(0);
    expect(secondDeg).toBe(0);
  });

  it('places the hour hand a quarter turn at 03:00:00', () => {
    const { hourDeg } = handAngles(new Date('2026-07-10T03:00:00Z'));
    expect(hourDeg).toBe(90);
  });

  it('places the minute hand a half turn at 30 minutes past', () => {
    const { minuteDeg } = handAngles(new Date('2026-07-10T00:30:00Z'));
    expect(minuteDeg).toBe(180);
  });

  it('places the second hand three-quarters around at :45', () => {
    const { secondDeg } = handAngles(new Date('2026-07-10T00:00:45Z'));
    expect(secondDeg).toBe(270);
  });

  it('wraps the hour hand at noon back to the top, nudged by minutes', () => {
    const { hourDeg } = handAngles(new Date('2026-07-10T12:15:00Z'));
    expect(hourDeg).toBeCloseTo(7.5, 5);
  });

  it('advances the hour hand fractionally as minutes progress', () => {
    const { hourDeg } = handAngles(new Date('2026-07-10T01:30:00Z'));
    expect(hourDeg).toBeCloseTo(45, 5);
  });
});

describe('handAngles — properties', () => {
  const anyDate = fc.date({
    min: new Date('1970-01-01T00:00:00Z'),
    max: new Date('2200-01-01T00:00:00Z'),
    noInvalidDate: true,
  });

  it('keeps every hand angle within a full turn, [0, 360)', () => {
    fc.assert(
      fc.property(anyDate, (date) => {
        const { hourDeg, minuteDeg, secondDeg } = handAngles(date);
        for (const deg of [hourDeg, minuteDeg, secondDeg]) {
          expect(deg).toBeGreaterThanOrEqual(0);
          expect(deg).toBeLessThan(360);
        }
      }),
    );
  });

  it('derives the second hand exactly as 6 degrees per second', () => {
    fc.assert(
      fc.property(anyDate, (date) => {
        const { secondDeg } = handAngles(date);
        expect(secondDeg).toBeCloseTo(date.getUTCSeconds() * 6, 10);
      }),
    );
  });
});
