import { describe, it, expect } from 'vitest';
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
