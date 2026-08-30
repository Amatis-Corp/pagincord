import type {
  EmbedBuilder,
  Message,
  CommandInteraction,
  ButtonInteraction,
  StringSelectMenuInteraction,
  MessageComponentInteraction,
  ButtonStyle,
  User,
} from 'discord.js';

/**
 * Plain object used to build an embed without creating an EmbedBuilder yourself.
 */
export interface EmbedData {
  title?: string;
  description?: string;
  color?: number;
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

export interface PaginationButtons {
  /** Jump to the first page. @default true */
  first?: boolean;
  /** Go to the previous page. @default true */
  previous?: boolean;
  /** Go to the next page. @default true */
  next?: boolean;
  /** Jump to the last page. @default true */
  last?: boolean;
  /** Stop pagination. @default true */
  stop?: boolean;
  /** Disabled (or clickable) button showing `1 / 5`. @default false */
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
}

export interface AutoFooterOptions {
  /** Template. Tokens: `{page}` `{total}`. @default "Page {page} of {total}" */
  format?: string;
  /** Keep the existing footer and append the page text. @default false */
  append?: boolean;
}

export interface JumpModalOptions {
  /** Modal title (max 45 characters). */
  title?: string;
  /** Input label (max 45 characters). */
  label?: string;
  /** Input placeholder. */
  placeholder?: string;
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

/**
 * Configuration options for {@link Paginator}.
 */
export interface PaginationOptions {
  /**
   * Pages to display. You can mix EmbedBuilder instances and plain objects.
   */
  embeds: EmbedResolvable[];

  /**
   * User ID allowed to control pagination.
   * Other users receive an ephemeral error message.
   */
  authorId?: string;

  /**
   * Extra user IDs allowed to control pagination (merged with `authorId`).
   */
  allowedUsers?: string[];

  /**
   * Custom allow/deny logic. Return `false` to reject the interaction.
   */
  filter?: PaginationFilter;

  /**
   * Include a select menu to jump to a page.
   * Automatically windows options when there are more than 25 pages.
   * @default false
   */
  useSelectMenu?: boolean;

  /**
   * Select menu placeholder. Can be a string or a function of (page, total).
   */
  selectPlaceholder?: string | ((page: number, total: number) => string);

  /**
   * Idle timeout in milliseconds. `0` disables the timeout.
   * @default 60000
   */
  timeout?: number;

  /**
   * Custom button emojis.
   */
  buttonEmojis?: PaginationButtonEmojis;

  /**
   * Optional text labels next to (or instead of) emojis.
   */
  buttonLabels?: PaginationButtonLabels;

  /**
   * Custom discord.js button styles.
   */
  buttonStyles?: PaginationButtonStyles;

  /**
   * Which buttons to render.
   */
  buttons?: PaginationButtons;

  /**
   * Clicking the page-indicator button opens a modal to type a page number.
   */
  jumpModal?: boolean | JumpModalOptions;

  /**
   * Delete the message when pagination ends via the stop button.
   * Prefer {@link PaginationOptions.endBehavior} for new code.
   * @default false
   */
  deleteOnStop?: boolean;

  /**
   * What to do when pagination ends.
   * @default "disable" (or "delete" if `deleteOnStop` is true)
   */
  endBehavior?: EndBehavior;

  /**
   * Starting page index (0-based).
   * @default 0
   */
  startPage?: number;

  /**
   * Wrap around from last → first and first → last.
   * @default false
   */
  loop?: boolean;

  /**
   * Send the pagination message as ephemeral (interactions only).
   * @default false
   */
  ephemeral?: boolean;

  /**
   * Message content shown above the embed.
   */
  content?: string | ((ctx: PageContext) => string);

  /**
   * Automatically set (or append) a footer with the current page.
   * @default false
   */
  autoFooter?: boolean | AutoFooterOptions;

  /**
   * Message sent when a user is not allowed to control the paginator.
   */
  unauthorizedMessage?: string | ((user: User) => string);

  /**
   * Hide every button when there is only one page.
   * @default false
   */
  hideButtonsIfSinglePage?: boolean;

  /**
   * How to send the message when `start()` receives an interaction.
   * By default: `editReply` if already replied/deferred, otherwise `reply`.
   */
  replyAs?: ReplyAs;

  /**
   * Called after the page changes.
   */
  onPageChange?: (
    ctx: PageContext & { embed: EmbedBuilder; interaction?: PaginationInteraction }
  ) => void | Promise<void>;

  /**
   * Called when pagination ends.
   */
  onEnd?: (reason: EndReason) => void | Promise<void>;

  /**
   * Called for every authorized component interaction.
   */
  onCollect?: (interaction: PaginationInteraction) => void | Promise<void>;
}

/**
 * Snapshot of a running paginator.
 */
export interface PaginationState {
  currentPage: number;
  totalPages: number;
  authorId?: string;
  ended: boolean;
  loop: boolean;
}

/**
 * A Discord message or any interaction that can reply.
 */
export type PaginationTarget = Message | CommandInteraction | MessageComponentInteraction;

/**
 * Component interactions handled by the paginator.
 */
export type PaginationInteraction = ButtonInteraction | StringSelectMenuInteraction;

/**
 * Events emitted by {@link Paginator}.
 */
export interface PaginatorEvents {
  pageChange: [ctx: PageContext & { embed: EmbedBuilder; interaction?: PaginationInteraction }];
  end: [reason: EndReason];
  collect: [interaction: PaginationInteraction];
  unauthorized: [interaction: PaginationInteraction];
  error: [error: unknown];
}
