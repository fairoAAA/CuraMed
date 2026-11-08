import { describe, it, expect } from 'vitest';
import {
  assertValidTransition,
  InvalidTransitionError,
  getValidNextStatuses,
  isTerminal,
  isSideExit,
} from '@/utils/ticketStateMachine';
import type { TicketStatus } from '@/types';

describe('Ticket State Machine', () => {
  // Valid transitions
  it('allows booked → checked_in', () => {
    expect(() => assertValidTransition('booked', 'checked_in')).not.toThrow();
  });

  it('allows booked → cancelled', () => {
    expect(() => assertValidTransition('booked', 'cancelled')).not.toThrow();
  });

  it('allows checked_in → called', () => {
    expect(() => assertValidTransition('checked_in', 'called')).not.toThrow();
  });

  it('allows called → in_progress', () => {
    expect(() => assertValidTransition('called', 'in_progress')).not.toThrow();
  });

  it('allows in_progress → completed', () => {
    expect(() => assertValidTransition('in_progress', 'completed')).not.toThrow();
  });

  it('allows called → no_show', () => {
    expect(() => assertValidTransition('called', 'no_show')).not.toThrow();
  });

  it('allows checked_in → no_show', () => {
    expect(() => assertValidTransition('checked_in', 'no_show')).not.toThrow();
  });

  // Invalid transitions
  it('throws on booked → in_progress (skip steps)', () => {
    expect(() => assertValidTransition('booked', 'in_progress')).toThrow(InvalidTransitionError);
  });

  it('throws on booked → completed', () => {
    expect(() => assertValidTransition('booked', 'completed')).toThrow(InvalidTransitionError);
  });

  it('throws on completed → booked (reverse)', () => {
    expect(() => assertValidTransition('completed', 'booked')).toThrow(InvalidTransitionError);
  });

  it('throws on cancelled → booked', () => {
    expect(() => assertValidTransition('cancelled', 'booked')).toThrow(InvalidTransitionError);
  });

  it('throws on in_progress → called (backward)', () => {
    expect(() => assertValidTransition('in_progress', 'called')).toThrow(InvalidTransitionError);
  });

  it('throws on no_show → checked_in', () => {
    expect(() => assertValidTransition('no_show', 'checked_in')).toThrow(InvalidTransitionError);
  });

  it('throws with correct error name', () => {
    try {
      assertValidTransition('completed', 'booked');
    } catch (e) {
      expect((e as Error).name).toBe('InvalidTransitionError');
      expect((e as Error).message).toContain('completed → booked');
    }
  });

  // Helper functions
  it('getValidNextStatuses(booked) returns [checked_in, cancelled]', () => {
    const next = getValidNextStatuses('booked');
    expect(next).toContain('checked_in');
    expect(next).toContain('cancelled');
  });

  it('isTerminal(completed) is true', () => {
    expect(isTerminal('completed')).toBe(true);
  });

  it('isTerminal(cancelled) is true', () => {
    expect(isTerminal('cancelled')).toBe(true);
  });

  it('isTerminal(no_show) is true', () => {
    expect(isTerminal('no_show')).toBe(true);
  });

  it('isTerminal(booked) is false', () => {
    expect(isTerminal('booked')).toBe(false);
  });

  it('isSideExit(cancelled) is true', () => {
    expect(isSideExit('cancelled')).toBe(true);
  });

  it('isSideExit(no_show) is true', () => {
    expect(isSideExit('no_show')).toBe(true);
  });

  it('isSideExit(completed) is false', () => {
    expect(isSideExit('completed')).toBe(false);
  });

  // All terminal states have no valid next transitions
  const terminalStates: TicketStatus[] = ['completed', 'cancelled', 'no_show'];
  terminalStates.forEach(status => {
    it(`${status} has no valid outgoing transitions`, () => {
      expect(getValidNextStatuses(status)).toHaveLength(0);
    });
  });
});
