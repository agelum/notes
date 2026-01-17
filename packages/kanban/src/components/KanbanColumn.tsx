'use client';

import * as React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { KanbanCard } from './KanbanCard';
import type {
  KanbanColumn as KanbanColumnType,
  KanbanCard as KanbanCardType,
  KanbanColumnColor,
} from '@/types';

interface KanbanColumnProps {
  column: KanbanColumnType;
  cards: KanbanCardType[];
  onAddCard?: (columnId: string) => void;
  onCardEdit?: (card: KanbanCardType) => void;
  onCardDelete?: (cardId: string) => void;
  onCardClick?: (card: KanbanCardType) => void;
}

const columnColorMap: Record<KanbanColumnColor, string> = {
  gray: 'bg-gray-500',
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  amber: 'bg-amber-500',
  yellow: 'bg-yellow-500',
  lime: 'bg-lime-500',
  green: 'bg-green-500',
  emerald: 'bg-emerald-500',
  teal: 'bg-teal-500',
  cyan: 'bg-cyan-500',
  sky: 'bg-sky-500',
  blue: 'bg-blue-500',
  indigo: 'bg-indigo-500',
  violet: 'bg-violet-500',
  purple: 'bg-purple-500',
  fuchsia: 'bg-fuchsia-500',
  pink: 'bg-pink-500',
  rose: 'bg-rose-500',
};

const columnBgMap: Record<KanbanColumnColor, string> = {
  gray: 'bg-gray-50 dark:bg-gray-900/20',
  red: 'bg-red-50 dark:bg-red-900/20',
  orange: 'bg-orange-50 dark:bg-orange-900/20',
  amber: 'bg-amber-50 dark:bg-amber-900/20',
  yellow: 'bg-yellow-50 dark:bg-yellow-900/20',
  lime: 'bg-lime-50 dark:bg-lime-900/20',
  green: 'bg-green-50 dark:bg-green-900/20',
  emerald: 'bg-emerald-50 dark:bg-emerald-900/20',
  teal: 'bg-teal-50 dark:bg-teal-900/20',
  cyan: 'bg-cyan-50 dark:bg-cyan-900/20',
  sky: 'bg-sky-50 dark:bg-sky-900/20',
  blue: 'bg-blue-50 dark:bg-blue-900/20',
  indigo: 'bg-indigo-50 dark:bg-indigo-900/20',
  violet: 'bg-violet-50 dark:bg-violet-900/20',
  purple: 'bg-purple-50 dark:bg-purple-900/20',
  fuchsia: 'bg-fuchsia-50 dark:bg-fuchsia-900/20',
  pink: 'bg-pink-50 dark:bg-pink-900/20',
  rose: 'bg-rose-50 dark:bg-rose-900/20',
};

export function KanbanColumn({
  column,
  cards,
  onAddCard,
  onCardEdit,
  onCardDelete,
  onCardClick,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      column,
    },
  });

  const cardIds = cards.map((card) => card.id);
  const color = column.color || 'gray';

  return (
    <div
      className={cn(
        'flex h-full w-[320px] flex-shrink-0 flex-col rounded-xl border',
        columnBgMap[color],
        isOver && 'ring-2 ring-primary/50'
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className={cn('h-2.5 w-2.5 rounded-full', columnColorMap[color])} />
          <h3 className="font-semibold text-sm">{column.title}</h3>
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground">
            {cards.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {onAddCard && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onAddCard(column.id)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Cards Container */}
      <ScrollArea className="flex-1">
        <div
          ref={setNodeRef}
          className={cn(
            'flex flex-col gap-2 p-2 min-h-[100px]',
            isOver && 'bg-primary/5'
          )}
        >
          <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
            {cards.map((card) => (
              <KanbanCard
                key={card.id}
                card={card}
                onEdit={onCardEdit}
                onDelete={onCardDelete}
                onClick={onCardClick}
              />
            ))}
          </SortableContext>
          {cards.length === 0 && (
            <div className="flex items-center justify-center h-20 text-sm text-muted-foreground">
              No cards
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Add Card Button */}
      {onAddCard && (
        <div className="p-2 border-t border-border/50">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => onAddCard(column.id)}
          >
            <Plus className="h-4 w-4" />
            Add card
          </Button>
        </div>
      )}
    </div>
  );
}
