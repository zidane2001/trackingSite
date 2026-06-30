import React from 'react';
import { cn } from '../lib/utils';
import type { PackageStatus } from '../types';
import { STATUS_LABELS, STATUS_COLORS } from '../types';

interface Props {
  status: PackageStatus;
  className?: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, className, size = 'md' }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-bold rounded-md border',
        STATUS_COLORS[status],
        size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1',
        className,
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {STATUS_LABELS[status]}
    </span>
  );
}
