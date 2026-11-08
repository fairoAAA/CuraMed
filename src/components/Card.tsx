import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  role?: string;
  tabIndex?: number;
}

export const Card: React.FC<CardProps> = ({ className, children, onClick, role, tabIndex }) => (
  <div
    className={clsx(
      'bg-white rounded-xl shadow-sm border border-gray-200 p-6',
      onClick && 'cursor-pointer hover:shadow-md hover:border-brand-300 transition-all',
      className
    )}
    onClick={onClick}
    role={role}
    tabIndex={tabIndex}
  >
    {children}
  </div>
);
