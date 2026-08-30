/**
 * Pagincord — smart embed pagination for Discord.js v14+
 * @packageDocumentation
 */

export { Paginator, paginate } from './Paginator';
export {
  chunk,
  splitText,
  createPages,
  createTextPages,
  createFieldPages,
  toEmbedBuilders,
} from './helpers';
export type {
  CreatePagesOptions,
  CreatePagesContext,
  CreateTextPagesOptions,
  CreateFieldPagesOptions,
} from './helpers';
export {
  configure,
  getConfig,
  resetConfig,
  setLocale,
  getLocale,
} from './defaults';
export type { PagincordDefaults } from './defaults';
export {
  locales,
  en,
  es,
  defineLocale,
  interpolate,
  resolveLocaleStrings,
} from './locales';
export type { LocaleCode, LocaleStrings, LocaleButtonLabels } from './locales';
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
  PaginationPreset,
  PaginationTexts,
  PaginatorEvents,
  PageContext,
  AutoFooterOptions,
  JumpModalOptions,
  EndReason,
  ReplyAs,
  EndBehavior,
  ButtonEmojiResolvable,
  ButtonKey,
  ExtraRows,
  SelectOptionInfo,
} from './types';
