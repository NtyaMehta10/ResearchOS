import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
  customColor?: string;
}

export function Badge({ className, variant = 'default', customColor, children, style, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    secondary: 'bg-secondary text-secondary-foreground border-border',
    success: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    danger: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    outline: 'bg-transparent text-foreground border-border',
  };

  const dynamicStyle = customColor
    ? {
        backgroundColor: `${customColor}18`,
        color: customColor,
        borderColor: `${customColor}40`,
        ...style,
      }
    : style;

  return (
    <span
      style={dynamicStyle}
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors',
          !customColor && variants[variant],
          className
        )
      )}
      {...props}
    >
      {children}
    </span>
  );
}
