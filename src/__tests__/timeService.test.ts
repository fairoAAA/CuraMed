import { describe, it, expect, beforeEach } from 'vitest';
import { timeService } from '@/services/mock/timeService';

describe('timeService', () => {
  beforeEach(() => {
    (timeService as { reset(): void }).reset();
  });

  it('now() returns a Date', () => {
    expect(timeService.now()).toBeInstanceOf(Date);
  });

  it('now() returns current time within 1 second', () => {
    const diff = Math.abs(timeService.now().getTime() - Date.now());
    expect(diff).toBeLessThan(1000);
  });

  it('advanceBy() moves time forward', () => {
    const before = timeService.now();
    (timeService as { advanceBy(m: number): void }).advanceBy(10);
    const after = timeService.now();
    const diffMin = (after.getTime() - before.getTime()) / 60000;
    expect(diffMin).toBeCloseTo(10, 1);
  });

  it('reset() restores current time', () => {
    (timeService as { advanceBy(m: number): void }).advanceBy(60);
    (timeService as { reset(): void }).reset();
    const diff = Math.abs(timeService.now().getTime() - Date.now());
    expect(diff).toBeLessThan(1000);
  });

  it('addMinutes() adds the correct duration', () => {
    const base = new Date('2026-01-01T10:00:00Z');
    const result = timeService.addMinutes(base, 20);
    expect(result.getTime() - base.getTime()).toBe(20 * 60 * 1000);
  });

  it('format() formats a date string', () => {
    const formatted = timeService.format('2026-06-15T09:30:00Z', 'HH:mm');
    // UTC offset aware — just check it's a time-like string
    expect(formatted).toMatch(/^\d{2}:\d{2}$/);
  });
});
