import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number;
}

export function Skeleton({
  className,
  lines,
  ...props
}: SkeletonProps) {
  if (lines) {
    return (
      <div className="space-y-2 w-full">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className={twMerge(clsx('animate-pulse rounded-md bg-muted/60 h-4', className))} />
        ))}
      </div>
    );
  }

  return (
    <div
      className={twMerge(clsx('animate-pulse rounded-md bg-muted/60', className))}
      {...props}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="p-6 rounded-xl border border-border bg-card space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex items-center gap-2 pt-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}
