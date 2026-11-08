// Ticket State Machine
// Defines valid transitions and throws on invalid ones.

import type { TicketStatus } from '@/types';

// Valid transitions map
const VALID_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  booked:      ['checked_in', 'cancelled'],
  checked_in:  ['called', 'cancelled', 'no_show'],
  called:      ['in_progress', 'no_show'],
  in_progress: ['completed'],
  completed:   [],
  cancelled:   [],
  no_show:     [],
};

export class InvalidTransitionError extends Error {
  constructor(from: TicketStatus, to: TicketStatus) {
    super(`Invalid ticket transition: ${from} → ${to}`);
    this.name = 'InvalidTransitionError';
  }
}

export function assertValidTransition(from: TicketStatus, to: TicketStatus): void {
  if (!VALID_TRANSITIONS[from].includes(to)) {
    throw new InvalidTransitionError(from, to);
  }
}

export function getValidNextStatuses(current: TicketStatus): TicketStatus[] {
  return VALID_TRANSITIONS[current];
}

export function isTerminal(status: TicketStatus): boolean {
  return VALID_TRANSITIONS[status].length === 0;
}

export function isSideExit(status: TicketStatus): boolean {
  return status === 'cancelled' || status === 'no_show';
}
