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
    home: '🏠',
    random: '🎲',
    back: '↩️',
  },
  arrows: {
    first: '⏪',
    previous: '⬅️',
    next: '➡️',
    last: '⏩',
    stop: '❌',
    search: '🔎',
    home: '🏠',
    random: '🎲',
    back: '↩️',
  },
  round: {
    first: '⏮️',
    previous: '◀️',
    next: '▶️',
    last: '⏭️',
    stop: '⛔',
    search: '🔍',
    home: '🏠',
    random: '🎲',
    back: '↩️',
  },
  discord: {
    first: '⏮️',
    previous: '◀️',
    next: '▶️',
    last: '⏭️',
    stop: '🛑',
    search: '🔍',
    home: '🏠',
    random: '🎲',
    back: '↩️',
  },
};

export function resolveTheme(name?: PaginationTheme): Required<PaginationButtonEmojis> {
  return { ...(themes[name ?? 'classic'] ?? themes.classic) };
}
