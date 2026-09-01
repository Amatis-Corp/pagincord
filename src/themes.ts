import type { PaginationButtonEmojis } from './types';

export type PaginationTheme = 'classic' | 'arrows' | 'round' | 'discord';

export const themes: Record<PaginationTheme, Required<PaginationButtonEmojis>> = {
  classic: {
    first: '⏮️',
    previous: '◀️',
    next: '▶️',
    last: '⏭️',
    stop: '🗑️',
    search: '🔍',
  },
  arrows: {
    first: '⏪',
    previous: '⬅️',
    next: '➡️',
    last: '⏩',
    stop: '❌',
    search: '🔎',
  },
  round: {
    first: '⏮️',
    previous: '◀️',
    next: '▶️',
    last: '⏭️',
    stop: '⛔',
    search: '🔍',
  },
  discord: {
    first: '⏮️',
    previous: '◀️',
    next: '▶️',
    last: '⏭️',
    stop: '🛑',
    search: '🔍',
  },
};

export function resolveTheme(name?: PaginationTheme): Required<PaginationButtonEmojis> {
  return { ...(themes[name ?? 'classic'] ?? themes.classic) };
}
