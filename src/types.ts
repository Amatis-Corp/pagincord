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
import type { PaginationTheme } from './themes';

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

export type ButtonKey =
  | 'first'
  | 'previous'
  | 'pageIndicator'
  | 'next'
  | 'last'
  | 'stop'
  | 'search'
  | 'home'
  | 'random'
  | 'back';

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
  search?: boolean;
  home?: boolean;
  random?: boolean;
  back?: boolean;
}

export interface PaginationButtonEmojis {
  first?: ButtonEmojiResolvable;
  previous?: ButtonEmojiResolvable;
  next?: ButtonEmojiResolvable;
  last?: ButtonEmojiResolvable;
  stop?: ButtonEmojiResolvable;
  search?: ButtonEmojiResolvable;
  home?: ButtonEmojiResolvable;
  random?: ButtonEmojiResolvable;
  back?: ButtonEmojiResolvable;
}

export interface PaginationButtonLabels {
  first?: string;
  previous?: string;
  next?: string;
  last?: string;
  stop?: string;
  search?: string;
  home?: string;
  random?: string;
  back?: string;
}

export interface PaginationButtonStyles {
  first?: ButtonStyle;
  previous?: ButtonStyle;
  next?: ButtonStyle;
  last?: ButtonStyle;
  stop?: ButtonStyle;
  pageIndicator?: ButtonStyle;
  search?: ButtonStyle;
  home?: ButtonStyle;
  random?: ButtonStyle;
  back?: ButtonStyle;
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

export interface LinkButton {
  label: string;
  url: string;
  emoji?: ButtonEmojiResolvable;
}

export interface SelectOptionInfo {
  label: string;
  description?: string;
  emoji?: ButtonEmojiResolvable;
}

export type FetchPageFn = (
  index: number,
  total: number
) => EmbedResolvable | EmbedResolvable[] | Promise<EmbedResolvable | EmbedResolvable[]>;

export interface ProgressBarOptions {
  /** Number of blocks. @default 10 */
  size?: number;
  /** `{bar}` `{page}` `{total}` `{percent}` */
  format?: string;
}

export type PaginationTexts = Partial<Omit<LocaleStrings, 'buttons'>> & {
  buttons?: Partial<LocaleButtonLabels>;
};

/**
 * Configuration options for {@link Paginator}.
 * Instance options override {@link configure} defaults.
 */
export interface PaginationOptions {
  /**
   * Pages to display. Optional when `fetchPage` + `totalPages` are set.
   */
  embeds?: EmbedResolvable[];

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

  /**
   * Emoji pack: `classic` | `arrows` | `round` | `discord`.
   * Overridden by `buttonEmojis`.
   */
  theme?: PaginationTheme;

  /**
   * Append the page number to the embed title at render time.
   * `true` uses `{title} ({page}/{total})`.
   */
  autoTitle?: boolean | string;

  /**
   * Mutate (or replace) the embed right before it is sent.
   */
  transform?: (
    embed: EmbedBuilder,
    ctx: PageContext
  ) => EmbedBuilder | EmbedData | void | Promise<EmbedBuilder | EmbedData | void>;

  /**
   * Return `false` to cancel navigation.
   */
  beforePageChange?: (
    from: number,
    to: number,
    interaction?: PaginationInteraction
  ) => boolean | Promise<boolean>;

  /**
   * Show a row of numbered page buttons (window of up to 5).
   * Pass a number (1–5) to set the window size.
   */
  numberedButtons?: boolean | number;

  /** Search modal: find a page by title or description. Adds a Search button. */
  searchable?: boolean;

  /** First Close click asks for confirmation; second click (within 10s) ends. */
  confirmStop?: boolean;

  /** Do not send an ephemeral message when a user is blocked. */
  silentUnauthorized?: boolean;

  /**
   * When `start()` receives a `Message`, edit that message instead of sending a new one.
   */
  editMessage?: boolean;

  /** `deferReply` automatically if the interaction has not been acknowledged. */
  autoDefer?: boolean;

  /**
   * Load pages on demand. Requires `totalPages` if `embeds` is empty.
   */
  fetchPage?: FetchPageFn;

  /**
   * Total pages when using `fetchPage` without preloaded embeds.
   */
  totalPages?: number;

  /**
   * How many embeds to show per page (1–10). @default 1
   */
  embedsPerPage?: number;

  /** Unicode progress bar in the footer. */
  progressBar?: boolean | ProgressBarOptions;

  /** Link buttons (open URLs). Uses a spare action row. */
  linkButtons?: LinkButton[];

  /** Role IDs allowed to click (in addition to `authorId` / `allowedUsers`). */
  allowedRoles?: string[];

  /**
   * After each navigation, send an ephemeral “now on page X”.
   */
  notifyPageChange?: boolean | ((ctx: PageContext) => string);

  /** Page index used by the Home button. @default 0 */
  homePage?: number;

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
  paused: boolean;
}

export type PaginationTarget = Message | CommandInteraction | MessageComponentInteraction;

export type PaginationInteraction = ButtonInteraction | StringSelectMenuInteraction;

export interface PaginatorEvents {
  pageChange: [ctx: PageContext & { embed: EmbedBuilder; interaction?: PaginationInteraction }];
  end: [reason: EndReason];
  collect: [interaction: PaginationInteraction];
  unauthorized: [interaction: PaginationInteraction];
  start: [message: Message];
  pause: [];
  resume: [];
  error: [error: unknown];
}

