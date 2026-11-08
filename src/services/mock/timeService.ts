// timeService — single source of "now" for the entire application.
// Never use Date.now() or new Date() directly in components.

import type { ITimeService } from '@/services/interfaces';
import { format as fnsFormat, addMinutes as fnsAddMinutes, parseISO } from 'date-fns';

class TimeService implements ITimeService {
  private offset = 0; // ms offset for testing/demo purposes

  now(): Date {
    return new Date(Date.now() + this.offset);
  }

  format(date: Date | string, fmt: string): string {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return fnsFormat(d, fmt);
  }

  addMinutes(date: Date | string, minutes: number): Date {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return fnsAddMinutes(d, minutes);
  }

  /** Advance mock time by n minutes (for testing/demo). */
  advanceBy(minutes: number): void {
    this.offset += minutes * 60_000;
  }

  reset(): void {
    this.offset = 0;
  }
}

export const timeService: ITimeService & { advanceBy(m: number): void; reset(): void } =
  new TimeService() as TimeService;
