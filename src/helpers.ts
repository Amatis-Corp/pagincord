import { EmbedBuilder } from 'discord.js';
import { getLocale } from './defaults';
import { interpolate, resolveLocaleStrings, type LocaleCode } from './locales';
import type { EmbedData, EmbedResolvable, PageContext } from './types';

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

/**
 * Split a long string into pieces that fit Discord embed descriptions.
 * Prefers breaking on blank lines, then newlines, then spaces.
 */
export function splitText(text: string, maxLength = 4096): string[] {
  if (maxLength < 1) {
    throw new Error('maxLength must be a positive number');
  }
  if (!text) return [''];
  if (text.length <= maxLength) return [text];

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      chunks.push(remaining);
      break;
    }

    let slice = remaining.slice(0, maxLength);
    const lastDouble = slice.lastIndexOf('\n\n');
    const lastLine = slice.lastIndexOf('\n');
    const lastSpace = slice.lastIndexOf(' ');
    const cut = Math.max(lastDouble, lastLine, lastSpace);

    if (cut > maxLength * 0.4) {
      slice = remaining.slice(0, cut);
    }

    chunks.push(slice.trimEnd());
    remaining = remaining.slice(slice.length).trimStart();
  }

  return chunks;
}

export interface CreatePagesContext<T> extends PageContext {
  items: T[];
  startIndex: number;
}

export interface CreatePagesOptions<T> {
  items: readonly T[];
  itemsPerPage?: number;
  mapItem?: (item: T, index: number, ctx: CreatePagesContext<T>) => string;
  mapPage?: (items: T[], ctx: CreatePagesContext<T>) => string;
  separator?: string;
  embed?: EmbedData | ((ctx: CreatePagesContext<T>) => EmbedData);
  emptyText?: string;
  pageFooter?: boolean;
  locale?: LocaleCode;
}

/**
 * Build embed pages from any list (leaderboards, shops, queues, search results).
 */
export function createPages<T>(options: CreatePagesOptions<T>): EmbedData[] {
  const locale = resolveLocaleStrings(options.locale ?? getLocale());
  const itemsPerPage = Math.max(1, options.itemsPerPage ?? 10);
  const groups = chunk(options.items, itemsPerPage);
  const total = Math.max(1, groups.length);
  const pages = groups.length === 0 ? ([[] as T[]]) : groups;
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
      list = options.emptyText ?? locale.emptyList;
    }

    if (list) {
      base.description = base.description ? `${base.description}\n\n${list}` : list;
    }

    if (useFooter) {
      const pageText = interpolate(locale.pageLabel, { page: i + 1, total });
      base.footer = base.footer?.text
        ? { ...base.footer, text: `${base.footer.text} • ${pageText}` }
        : { text: pageText };
    }

    return base;
  });
}

export interface CreateTextPagesOptions {
  /** Max characters per page. @default 4000 */
  maxLength?: number;
  title?: string | ((page: number, total: number) => string);
  descriptionPrefix?: string;
  color?: number | string;
  locale?: LocaleCode;
  pageFooter?: boolean;
}

/**
 * Paginate a long article, changelog, or rules block.
 */
export function createTextPages(text: string, options: CreateTextPagesOptions = {}): EmbedData[] {
  const locale = resolveLocaleStrings(options.locale ?? getLocale());
  const parts = splitText(text, options.maxLength ?? 4000);
  const total = Math.max(1, parts.length);
  const useFooter = options.pageFooter !== false;

  return parts.map((part, i) => {
    const title =
      typeof options.title === 'function'
        ? options.title(i + 1, total)
        : options.title ?? interpolate(locale.fallbackTitle, { page: i + 1, total });

    const description = options.descriptionPrefix
      ? `${options.descriptionPrefix}\n\n${part}`
      : part;

    const embed: EmbedData = { title, description, color: options.color };
    if (useFooter) {
      embed.footer = { text: interpolate(locale.pageLabel, { page: i + 1, total }) };
    }
    return embed;
  });
}

export interface CreateFieldPagesOptions {
  fieldsPerPage?: number;
  embed?: EmbedData | ((ctx: PageContext & { fields: EmbedData['fields'] }) => EmbedData);
  locale?: LocaleCode;
  pageFooter?: boolean;
}

/**
 * Paginate embed fields (Discord allows 25 fields per embed).
 */
export function createFieldPages(
  fields: NonNullable<EmbedData['fields']>,
  options: CreateFieldPagesOptions = {}
): EmbedData[] {
  const locale = resolveLocaleStrings(options.locale ?? getLocale());
  const perPage = Math.min(25, Math.max(1, options.fieldsPerPage ?? 6));
  const groups = chunk(fields, perPage);
  const total = Math.max(1, groups.length);
  const pages = groups.length === 0 ? [[]] : groups;
  const useFooter = options.pageFooter !== false;

  return pages.map((pageFields, i) => {
    const ctx = { page: i, total, fields: pageFields };
    const base: EmbedData =
      typeof options.embed === 'function'
        ? { ...options.embed(ctx) }
        : { ...(options.embed ?? {}) };

    base.fields = pageFields;
    if (!base.description && (!pageFields || pageFields.length === 0)) {
      base.description = locale.emptyList;
    }
    if (useFooter) {
      const pageText = interpolate(locale.pageLabel, { page: i + 1, total });
      base.footer = base.footer?.text
        ? { ...base.footer, text: `${base.footer.text} • ${pageText}` }
        : { text: pageText };
    }
    return base;
  });
}

/**
 * Convert mixed EmbedBuilder / plain objects into EmbedBuilder clones.
 */
export function toEmbedBuilders(embeds: EmbedResolvable[]): EmbedBuilder[] {
  return embeds.map((embed) =>
    embed instanceof EmbedBuilder ? EmbedBuilder.from(embed.data) : buildEmbedFromData(embed)
  );
}

export function buildEmbedFromData(data: EmbedData): EmbedBuilder {
  const embed = new EmbedBuilder();

  if (data.title) embed.setTitle(data.title);
  if (data.description) {
    embed.setDescription(data.description);
  } else if (!data.fields || data.fields.length === 0) {
    embed.setDescription('\u200B');
  }
  if (data.color !== undefined) {
    embed.setColor(parseColor(data.color) as never);
  }
  if (data.fields) embed.addFields(data.fields);
  if (data.footer) embed.setFooter(data.footer);
  if (data.thumbnail) embed.setThumbnail(data.thumbnail);
  if (data.image) embed.setImage(data.image);
  if (data.author) embed.setAuthor(data.author);
  if (data.url) embed.setURL(data.url);
  if (data.timestamp) {
    embed.setTimestamp(data.timestamp instanceof Date ? data.timestamp : new Date());
  }

  return embed;
}

export function parseColor(color: number | string): number {
  if (typeof color === 'number') return color;
  const hex = color.trim().replace(/^#/, '');
  const value = Number.parseInt(hex, 16);
  if (Number.isNaN(value)) {
    throw new Error(`Invalid color: ${color}`);
  }
  return value;
}
