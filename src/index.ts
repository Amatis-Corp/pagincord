/**
 * Pagincord — smart embed pagination for Discord.js v14+
 * @packageDocumentation
 */

export { Paginator, paginate } from './Paginator';
export { chunk, createPages } from './helpers';
export type { CreatePagesOptions, CreatePagesContext } from './helpers';
export type {
  EmbedData,
  EmbedResolvable,
  PaginationOptions,
  PaginationState,
  PaginationTarget,
  PaginationInteraction,
  PaginationButtons,
  PaginationButtonEmojis,
  PaginationButtonLabels,
  PaginationButtonStyles,
  PaginationFilter,
  PaginatorEvents,
  PageContext,
  AutoFooterOptions,
  JumpModalOptions,
  EndReason,
  ReplyAs,
  EndBehavior,
  ButtonEmojiResolvable,
} from './types';
