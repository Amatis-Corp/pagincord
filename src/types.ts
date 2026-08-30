import type {
  ActionRowBuilder,
  ButtonInteraction,
  ButtonStyle,
  CommandInteraction,
  EmbedBuilder,
  Message,
  MessageActionRowComponentBuilder,
  MessageComponentInteraction,
  MessageMentionOptions,
  StringSelectMenuInteraction,
  User,
} from 'discord.js';
import type { LocaleButtonLabels, LocaleCode, LocaleStrings } from './locales';

/**
 * Plain object used to build an embed without creating an EmbedBuilder yourself.
 */
export interface EmbedData {
  title?: string;
  description?: string;
  color?: number | string;
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
  footer?: { text: string; iconURL?: string };
  thumbnail?: string;
  image?: string;
  author?: { name: string; iconURL?: string; url?: string };
  timestamp?: boolean | Date;
  url?: string;
}

export type EmbedResolvable = EmbedBuilder | EmbedData;

export type ButtonEmojiResolvable = string | { id?: string; name?: string; animated?: boolean };

export type ButtonKey = 'first' | 'previous' | 'pageIndicator' | 'next' | 'last' | 'stop';

/**
 * - `full` — first, previous, stop, next, last
 * - `compact` — previous, page indicator, next, stop
 * - `minimal` — previous, next
 * - `select` — stop button + select menu
 */
export type PaginationPreset = 'full' | 'compact' | 'minimal' | 'select';

export interface PaginationButtons {
  first?: boolean;
  previous?: boolean;
  next?: boolean;
  last?: boolean;
  stop?: boolean;
  pageIndicator?: boolean;
}

export interface PaginationButtonEmojis {
  first?: ButtonEmojiResolvable;
  previous?: ButtonEmojiResolvable;
  next?: ButtonEmojiResolvable;
  last?: ButtonEmojiResolvable;
  stop?: ButtonEmojiResolvable;
}

export interface PaginationButtonLabels {
  first?: string;
  previous?: string;
  next?: string;
  last?: string;
  stop?: string;
}

export interface PaginationButtonStyles {
  first?: ButtonStyle;
  previous?: ButtonStyle;
  next?: ButtonStyle;
  last?: ButtonStyle;
  stop?: ButtonStyle;
  pageIndicator?: ButtonStyle;
}

export interface AutoFooterOptions {
  /** Template. Tokens: `{page}` `{total}`. Uses the active locale when omitted. */
  format?: string;
  /** Keep the existing footer and append the page text. @default false */
  append?: boolean;
}

export interface JumpModalOptions {
  title?: string;
  label?: string;
  placeholder?: string;
  invalid?: string;
}

export type EndReason = 'timeout' | 'stop' | 'manual' | 'idle' | 'messageDelete';

export type ReplyAs = 'reply' | 'editReply' | 'followUp' | 'update';

export type EndBehavior = 'disable' | 'delete' | 'clear';

export interface PageContext {
  /** 0-based page index */
  page: number;
  /** Total number of pages */
  total: number;
}

export type PaginationFilter = (interaction: PaginationInteraction) => boolean;

export type ExtraRows =
  | ActionRowBuilder<MessageActionRowComponentBuilder>[]
  | ((
      ctx: PageContext
    ) => ActionRowBuilder<MessageActionRowComponentBuilder>[]);

export interface SelectOptionInfo {
  label: string;
  description?: string;
  emoji?: ButtonEmojiResolvable;
}

export type PaginationTexts = Partial<Omit<LocaleStrings, 'buttons'>> & {
  buttons?: Partial<LocaleButtonLabels>;
};

/**
 * Configuration options for {@link Paginator}.
 * Instance options override {@link configure} defaults.
 */
export interface PaginationOptions {
  embeds: EmbedResolvable[];

  /** UI language for built-in texts. `'en'` or `'es'`, or a code registered with `defineLocale`. */
  locale?: LocaleCode;

  /** Override individual strings for this paginator only. */
  texts?: PaginationTexts;

  /** Visual preset. Overridden by explicit `buttons` / `useSelectMenu`. */
  preset?: PaginationPreset;

  authorId?: string;
  allowedUsers?: string[];
  filter?: PaginationFilter;

  useSelectMenu?: boolean;
  selectPlaceholder?: string | ((page: number, total: number) => string);
  /** Custom select-option label / description / emoji per page. */
  selectOption?: (embed: EmbedBuilder, index: number, ctx: PageContext) => SelectOptionInfo | string;

  /**
   * Idle timeout in milliseconds. `0` disables idle expiry.
   * @default 60000
   */
  timeout?: number;

  /** Absolute collector lifetime in milliseconds, independent of idle clicks. */
  maxDuration?: number;

  buttonEmojis?: PaginationButtonEmojis;
  buttonLabels?: PaginationButtonLabels;
  buttonStyles?: PaginationButtonStyles;
  buttons?: PaginationButtons;
  /** Render order. Unknown keys are ignored. */
  buttonOrder?: ButtonKey[];

  /** Put locale (or custom) labels on navigation buttons. @default false */
  showButtonLabels?: boolean;
  /** Do not set emojis (requires labels). @default false */
  hideEmojis?: boolean;

  jumpModal?: boolean | JumpModalOptions;
  deleteOnStop?: boolean;
  endBehavior?: EndBehavior;
  startPage?: number;
  loop?: boolean;
  ephemeral?: boolean;
  content?: string | ((ctx: PageContext) => string);
  autoFooter?: boolean | AutoFooterOptions;
  unauthorizedMessage?: string | ((user: User) => string);
  hideButtonsIfSinglePage?: boolean;
  replyAs?: ReplyAs;

  /** Template for the `1 / 5` button. Tokens: `{page}` `{total}`. */
  indicatorFormat?: string;

  /** Prefix for component custom IDs. @default "pgc" */
  customIdPrefix?: string;

  /** Extra action rows (max 5 rows total including buttons + select). */
  extraRows?: ExtraRows;

  allowedMentions?: MessageMentionOptions;

  onPageChange?: (
    ctx: PageContext & { embed: EmbedBuilder; interaction?: PaginationInteraction }
  ) => void | Promise<void>;
  onEnd?: (reason: EndReason) => void | Promise<void>;
  onCollect?: (interaction: PaginationInteraction) => void | Promise<void>;
  onStart?: (message: Message) => void | Promise<void>;
  onUnauthorized?: (interaction: PaginationInteraction) => void | Promise<void>;
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  authorId?: string;
  ended: boolean;
  loop: boolean;
  locale: string;
  active: boolean;
}

export type PaginationTarget = Message | CommandInteraction | MessageComponentInteraction;

export type PaginationInteraction = ButtonInteraction | StringSelectMenuInteraction;

export interface PaginatorEvents {
  pageChange: [ctx: PageContext & { embed: EmbedBuilder; interaction?: PaginationInteraction }];
  end: [reason: EndReason];
  collect: [interaction: PaginationInteraction];
  unauthorized: [interaction: PaginationInteraction];
  start: [message: Message];
  error: [error: unknown];
}

