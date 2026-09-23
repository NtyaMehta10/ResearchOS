import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode | React.ElementType;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
  action?: { label: string; onClick: () => void; icon?: React.ReactNode };
  secondaryAction?: { label: string; onClick: () => void; icon?: React.ReactNode };
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
  action,
  secondaryAction,
}: EmptyStateProps) {
  // Support both passing an element <Icon/> or a component reference Icon
  const renderIcon = () => {
    if (!Icon) return null;
    if (React.isValidElement(Icon)) return Icon;
    const IconComponent = Icon as React.ElementType;
    return <IconComponent className="w-7 h-7" />;
  };

  const primaryAction = action || (actionLabel && onAction ? { label: actionLabel, onClick: onAction, icon: actionIcon } : undefined);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl border border-dashed border-border bg-gradient-to-b from-card/50 to-card/20">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-4 text-muted-foreground shadow-sm">
          {renderIcon()}
        </div>
      )}
      <h3 className="text-sm font-semibold text-foreground mb-1.5">{title}</h3>
      {description && <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">{description}</p>}
      {(primaryAction || secondaryAction) && (
        <div className="flex items-center gap-3 mt-5">
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick} leftIcon={secondaryAction.icon} size="sm">
              {secondaryAction.label}
            </Button>
          )}
          {primaryAction && (
            <Button onClick={primaryAction.onClick} leftIcon={primaryAction.icon} size="sm">
              {primaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
