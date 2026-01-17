'use client';

import * as React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Calendar,
  AlertCircle,
  GripVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { KanbanCard as KanbanCardType, KanbanColumnColor } from '@/types';

interface KanbanCardProps {
  card: KanbanCardType;
  onEdit?: (card: KanbanCardType) => void;
  onDelete?: (cardId: string) => void;
  onClick?: (card: KanbanCardType) => void;
  isDragging?: boolean;
  isOverlay?: boolean;
}

const priorityConfig = {
  low: { label: 'Low', color: 'text-muted-foreground' },
  medium: { label: 'Medium', color: 'text-blue-500' },
  high: { label: 'High', color: 'text-orange-500' },
  urgent: { label: 'Urgent', color: 'text-red-500' },
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(date: Date): string {
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `${Math.abs(diffDays)}d overdue`;
  } else if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Tomorrow';
  } else if (diffDays <= 7) {
    return `${diffDays}d`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

export function KanbanCard({
  card,
  onEdit,
  onDelete,
  onClick,
  isDragging,
  isOverlay,
}: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: 'card',
      card,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isCurrentlyDragging = isDragging || isSortableDragging;
  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative flex flex-col gap-3 rounded-lg border bg-card p-3 shadow-sm transition-all duration-200',
        'hover:shadow-md hover:border-primary/20',
        isCurrentlyDragging && 'opacity-50 shadow-lg ring-2 ring-primary/20',
        isOverlay && 'rotate-3 shadow-xl',
        onClick && 'cursor-pointer'
      )}
      onClick={() => onClick?.(card)}
    >
      {/* Drag Handle & Actions */}
      <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(card)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            )}
            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(card.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Labels */}
      {card.labels && card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {card.labels.map((label) => (
            <Badge
              key={label.id}
              variant={label.color as KanbanColumnColor}
              className="text-[10px] px-1.5 py-0"
            >
              {label.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Title */}
      <h4 className="text-sm font-medium leading-snug pr-14">{card.title}</h4>

      {/* Description */}
      {card.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">
          {card.description}
        </p>
      )}

      {/* Footer: Priority, Due Date, Assignees */}
      {(card.priority || card.dueDate || (card.assignees && card.assignees.length > 0)) && (
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            {/* Priority */}
            {card.priority && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn('flex items-center', priorityConfig[card.priority].color)}>
                    <AlertCircle className="h-3.5 w-3.5" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {priorityConfig[card.priority].label} Priority
                </TooltipContent>
              </Tooltip>
            )}

            {/* Due Date */}
            {card.dueDate && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      'flex items-center gap-1 text-xs',
                      isOverdue ? 'text-destructive' : 'text-muted-foreground'
                    )}
                  >
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(new Date(card.dueDate))}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  Due: {new Date(card.dueDate).toLocaleDateString()}
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Assignees */}
          {card.assignees && card.assignees.length > 0 && (
            <div className="flex -space-x-2">
              {card.assignees.slice(0, 3).map((assignee) => (
                <Tooltip key={assignee.id}>
                  <TooltipTrigger asChild>
                    <Avatar className="h-6 w-6 border-2 border-card">
                      {assignee.avatar && (
                        <AvatarImage src={assignee.avatar} alt={assignee.name} />
                      )}
                      <AvatarFallback className="text-[10px]">
                        {getInitials(assignee.name)}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>{assignee.name}</TooltipContent>
                </Tooltip>
              ))}
              {card.assignees.length > 3 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar className="h-6 w-6 border-2 border-card">
                      <AvatarFallback className="text-[10px] bg-muted">
                        +{card.assignees.length - 3}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    {card.assignees
                      .slice(3)
                      .map((a) => a.name)
                      .join(', ')}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function KanbanCardOverlay({ card }: { card: KanbanCardType }) {
  return <KanbanCard card={card} isOverlay />;
}
