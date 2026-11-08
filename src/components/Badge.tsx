import React from 'react';
import { clsx } from 'clsx';
import type { TicketStatus } from '@/types';

type BadgeVariant = 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'orange' | 'purple';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  blue:   'bg-blue-100 text-blue-800',
  green:  'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  red:    'bg-red-100 text-red-800',
  gray:   'bg-gray-100 text-gray-700',
  orange: 'bg-orange-100 text-orange-800',
  purple: 'bg-purple-100 text-purple-800',
};

export const Badge: React.FC<BadgeProps> = ({ variant = 'gray', children, className }) => (
  <span className={clsx('inline-flex items-center px-3 py-1 rounded-full text-sm font-medium', variantClasses[variant], className)}>
    {children}
  </span>
);

// Map ticket status to badge variant
export function ticketStatusVariant(status: TicketStatus): BadgeVariant {
  const map: Record<TicketStatus, BadgeVariant> = {
    booked:      'blue',
    checked_in:  'purple',
    called:      'orange',
    in_progress: 'yellow',
    completed:   'green',
    cancelled:   'gray',
    no_show:     'red',
  };
  return map[status];
}
