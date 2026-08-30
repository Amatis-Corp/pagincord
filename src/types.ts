import {
  EmbedBuilder,
  Message,
  CommandInteraction,
  ButtonInteraction,
  StringSelectMenuInteraction,
  InteractionResponse,
} from 'discord.js';

/**
 * Object structure for dynamically building embeds
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

/**
 * Configuration options for pagination
 */
export interface PaginationOptions {
  /**
   * Array of EmbedBuilder objects or EmbedData objects to paginate
   */
  embeds: EmbedBuilder[] | EmbedData[];

  /**
   * User ID who is allowed to control the pagination.
   * If set, other users will receive an ephemeral message when trying to interact.
   */
  authorId?: string;

  /**
   * Whether to include a select menu for jumping to specific pages
   * @default false
   */
  useSelectMenu?: boolean;

  /**
   * Idle timeout in milliseconds before disabling pagination
   * @default 60000 (60 seconds)
   */
  timeout?: number;

  /**
   * Custom button emojis
   */
  buttonEmojis?: {
    first?: string;
    previous?: string;
    next?: string;
    last?: string;
    stop?: string;
  };

  /**
   * Whether to delete the message when the stop button is pressed
   * @default false (will disable buttons instead)
   */
  deleteOnStop?: boolean;

  /**
   * Starting page index (0-based)
   * @default 0
   */
  startPage?: number;
}

/**
 * Internal state for managing active pagination instances
 */
export interface PaginationState {
  currentPage: number;
  totalPages: number;
  authorId?: string;
  timeout: NodeJS.Timeout;
  collectorEnded: boolean;
}

/**
 * Valid interaction types for pagination
 */
export type PaginationTarget = Message | CommandInteraction;

/**
 * Button interaction types used in pagination
 */
export type PaginationInteraction = ButtonInteraction | StringSelectMenuInteraction;
