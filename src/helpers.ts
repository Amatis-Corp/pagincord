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

export type ListStyle = 'numbered' | 'bulleted' | 'dashed' | 'none';

/**
 * Format items as a Discord-ready list string.
 */
export function formatList(
  items: readonly unknown[],
  options: {
    style?: ListStyle;
    start?: number;
    map?: (item: unknown, index: number) => string;
  } = {}
): string {
  const style = options.style ?? 'numbered';
  const start = options.start ?? 1;
  return items
    .map((item, i) => {
      const text = options.map ? options.map(item, i) : String(item);
      switch (style) {
        case 'numbered':
          return `${start + i}. ${text}`;
        case 'bulleted':
          return `• ${text}`;
        case 'dashed':
          return `- ${text}`;
        default:
          return text;
      }
    })
    .join('\n');
}

export interface CreateTablePagesOptions {
  headers?: string[];
  rowsPerPage?: number;
  embed?: EmbedData | ((ctx: PageContext) => EmbedData);
  locale?: LocaleCode;
  pageFooter?: boolean;
}

/**
 * Paginate a 2D table inside a code block (leaderboards, inventories).
 */
export function createTablePages(
  rows: Array<Array<string | number>>,
  options: CreateTablePagesOptions = {}
): EmbedData[] {
  const locale = resolveLocaleStrings(options.locale ?? getLocale());
  const stringRows = rows.map((row) => row.map((cell) => String(cell)));
  const headers = options.headers?.map(String);
  const sample = headers ? [headers, ...stringRows] : stringRows;
  const colCount = sample.reduce((max, row) => Math.max(max, row.length), 0);
  const widths = Array.from({ length: colCount }, (_, col) =>
    sample.reduce((max, row) => Math.max(max, (row[col] ?? '').length), 0)
  );

  const formatRow = (row: string[]) =>
    row
      .concat(Array(colCount).fill(''))
      .slice(0, colCount)
      .map((cell, i) => cell.padEnd(widths[i]))
      .join('  ');

  const headerBlock = headers
    ? `${formatRow(headers)}\n${widths.map((w) => '-'.repeat(w)).join('  ')}`
    : '';

  return createPages({
    items: stringRows,
    itemsPerPage: Math.max(1, options.rowsPerPage ?? 8),
    locale: options.locale,
    pageFooter: options.pageFooter,
    emptyText: locale.emptyList,
    embed: options.embed,
    mapPage: (items) => {
      const body = items.map(formatRow).join('\n');
      const table = headerBlock ? `${headerBlock}\n${body}` : body;
      return `\`\`\`\n${table || locale.emptyList}\n\`\`\``;
    },
  });
}

export type ImagePageInput =
  | string
  | { url: string; title?: string; description?: string; color?: number | string };

export interface CreateImagePagesOptions {
  locale?: LocaleCode;
  pageFooter?: boolean;
  color?: number | string;
}

/**
 * One image per page (galleries, screenshots, item art).
 */
export function createImagePages(
  images: readonly ImagePageInput[],
  options: CreateImagePagesOptions = {}
): EmbedData[] {
  const locale = resolveLocaleStrings(options.locale ?? getLocale());
  const total = Math.max(1, images.length);
  const list = images.length === 0 ? [null] : images;

  return list.map((entry, i) => {
    const url = typeof entry === 'string' ? entry : entry?.url;
    const title =
      typeof entry === 'object' && entry?.title
        ? entry.title
        : interpolate(locale.fallbackTitle, { page: i + 1, total });
    const embed: EmbedData = {
      title,
      description: typeof entry === 'object' ? entry?.description : undefined,
      color: (typeof entry === 'object' ? entry?.color : undefined) ?? options.color,
      image: url,
    };
    if (options.pageFooter !== false) {
      embed.footer = { text: interpolate(locale.pageLabel, { page: i + 1, total }) };
    }
    return embed;
  });
}

export interface CreateCodePagesOptions {
  language?: string;
  maxLength?: number;
  title?: string | ((page: number, total: number) => string);
  color?: number | string;
  locale?: LocaleCode;
  pageFooter?: boolean;
}

/**
 * Paginate source code or logs inside Discord code blocks.
 */
export function createCodePages(code: string, options: CreateCodePagesOptions = {}): EmbedData[] {
  const locale = resolveLocaleStrings(options.locale ?? getLocale());
  const lang = options.language ?? '';
  const wrap = 8 + lang.length;
  const parts = splitText(code, Math.max(100, (options.maxLength ?? 3900) - wrap));
  const total = Math.max(1, parts.length);
  const useFooter = options.pageFooter !== false;

  return parts.map((part, i) => {
    const title =
      typeof options.title === 'function'
        ? options.title(i + 1, total)
        : options.title ?? interpolate(locale.fallbackTitle, { page: i + 1, total });
    const embed: EmbedData = {
      title,
      description: `\`\`\`${lang}\n${part}\n\`\`\``,
      color: options.color,
    };
    if (useFooter) {
      embed.footer = { text: interpolate(locale.pageLabel, { page: i + 1, total }) };
    }
    return embed;
  });
}

/**
 * Unicode progress bar, e.g. `██████░░░░`.
 */
export function createProgressBar(value: number, max: number, size = 10): string {
  const width = Math.max(1, Math.floor(size));
  if (max <= 0) return '░'.repeat(width);
  const ratio = Math.min(1, Math.max(0, value / max));
  const filled = Math.round(ratio * width);
  return `${'█'.repeat(filled)}${'░'.repeat(Math.max(0, width - filled))}`;
}

export interface CreateLeaderboardPagesOptions<T> extends Omit<CreatePagesOptions<T>, 'items'> {
  medals?: boolean;
}

/**
 * Ranked list with optional 🥇🥈🥉 on the first three global ranks.
 */
export function createLeaderboardPages<T>(
  items: readonly T[],
  options: CreateLeaderboardPagesOptions<T> = {}
): EmbedData[] {
  const medalsOn = options.medals !== false;
  const prefix = (index: number) => {
    if (!medalsOn) return `**${index + 1}.** `;
    if (index === 0) return '🥇 ';
    if (index === 1) return '🥈 ';
    if (index === 2) return '🥉 ';
    return `**${index + 1}.** `;
  };

  return createPages({
    ...options,
    items,
    mapItem: (item, index, ctx) => {
      const body = options.mapItem ? options.mapItem(item, index, ctx) : String(item);
      return `${prefix(index)}${body}`;
    },
    embed: options.embed ?? { title: '🏆 Leaderboard', color: 0xffd700 },
  });
}

export interface CreateMentionPagesOptions {
  itemsPerPage?: number;
  kind?: 'user' | 'role' | 'channel';
  embed?: EmbedData | ((ctx: CreatePagesContext<string>) => EmbedData);
  locale?: LocaleCode;
  pageFooter?: boolean;
}

/**
 * Paginate Discord snowflakes as mentions (`<@id>`, `<@&id>`, `<#id>`).
 */
export function createMentionPages(
  ids: readonly string[],
  options: CreateMentionPagesOptions = {}
): EmbedData[] {
  const wrap =
    options.kind === 'role'
      ? (id: string) => `<@&${id}>`
      : options.kind === 'channel'
        ? (id: string) => `<#${id}>`
        : (id: string) => `<@${id}>`;

  return createPages({
    items: [...ids],
    itemsPerPage: options.itemsPerPage ?? 10,
    mapItem: (id, i) => `${i + 1}. ${wrap(id)}`,
    embed: options.embed ?? { color: 0x5865f2 },
    locale: options.locale,
    pageFooter: options.pageFooter,
  });
}

/**
 * True when a component custom id was generated by Pagincord.
 */
export function isPagincordCustomId(customId: string, prefix = 'pgc'): boolean {
  return customId.startsWith(`${prefix}:`);
}
