import type { EmbedData, PageContext } from './types';

/**
 * Split an array into chunks of `size`.
 *
 * @example
 * chunk(['a', 'b', 'c', 'd'], 2) // [['a', 'b'], ['c', 'd']]
 */
export function chunk<T>(array: readonly T[], size: number): T[][] {
  if (size < 1 || !Number.isFinite(size)) {
    throw new Error('chunk size must be a positive number');
  }

  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

export interface CreatePagesContext<T> extends PageContext {
  /** Items on this page */
  items: T[];
  /** Global index of the first item on this page */
  startIndex: number;
}

export interface CreatePagesOptions<T> {
  /** Data to paginate */
  items: readonly T[];
  /** How many items per embed. @default 10 */
  itemsPerPage?: number;
  /**
   * Turn a single item into a line of the description.
   * Receives the item, its global index, and the page context.
   */
  mapItem?: (item: T, index: number, ctx: CreatePagesContext<T>) => string;
  /**
   * Turn the whole page into a description string (overrides `mapItem`).
   */
  mapPage?: (items: T[], ctx: CreatePagesContext<T>) => string;
  /** Joiner used with `mapItem`. @default "\\n" */
  separator?: string;
  /**
   * Base embed fields, or a function that receives the page context.
   * If `description` is set, the item list is appended under it.
   */
  embed?: EmbedData | ((ctx: CreatePagesContext<T>) => EmbedData);
  /** Text used when `items` is empty. @default "No items to display." */
  emptyText?: string;
  /**
   * Add `Page X of Y` to the footer.
   * @default true
   */
  pageFooter?: boolean;
}

/**
 * Build an array of {@link EmbedData} pages from any list of items.
 *
 * @example
 * const pages = createPages({
 *   items: users,
 *   itemsPerPage: 5,
 *   mapItem: (user, i) => `**${i + 1}.** ${user.name} — ${user.score}`,
 *   embed: { title: 'Leaderboard', color: 0xffd700 },
 * });
 */
export function createPages<T>(options: CreatePagesOptions<T>): EmbedData[] {
  const itemsPerPage = Math.max(1, options.itemsPerPage ?? 10);
  const groups = chunk(options.items, itemsPerPage);
  const total = Math.max(1, groups.length);
  const pages = groups.length === 0 ? [[]] as T[][] : groups;
  const useFooter = options.pageFooter !== false;

  return pages.map((pageItems, i) => {
    const ctx: CreatePagesContext<T> = {
      page: i,
      total,
      items: pageItems,
      startIndex: i * itemsPerPage,
    };

    const base: EmbedData =
      typeof options.embed === 'function'
        ? { ...options.embed(ctx) }
        : { ...(options.embed ?? {}) };

    let list: string | undefined;
    if (options.mapPage) {
      list = options.mapPage(pageItems, ctx);
    } else if (pageItems.length > 0) {
      list = pageItems
        .map((item, idx) =>
          options.mapItem
            ? options.mapItem(item, ctx.startIndex + idx, ctx)
            : String(item)
        )
        .join(options.separator ?? '\n');
    } else {
      list = options.emptyText ?? 'No items to display.';
    }

    if (list) {
      base.description = base.description ? `${base.description}\n\n${list}` : list;
    }

    if (useFooter) {
      const pageText = `Page ${i + 1} of ${total}`;
      base.footer = base.footer?.text
        ? { ...base.footer, text: `${base.footer.text} • ${pageText}` }
        : { text: pageText };
    }

    return base;
  });
}
