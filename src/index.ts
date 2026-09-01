/**
 * Pagincord — smart embed pagination for Discord.js v14+
 * @packageDocumentation
 */

export { Paginator, paginate, paginateList } from './Paginator';
export {
  chunk,
  splitText,
  createPages,
  createTextPages,
  createFieldPages,
  createTablePages,
  createImagePages,
  createCodePages,
  formatList,
  toEmbedBuilders,
} from './helpers';
export type {
  CreatePagesOptions,
  CreatePagesContext,
  CreateTextPagesOptions,
  CreateFieldPagesOptions,
  CreateTablePagesOptions,
  CreateImagePagesOptions,
  CreateCodePagesOptions,
  ImagePageInput,
  ListStyle,
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
  pt,
  fr,
  de,
  defineLocale,
  interpolate,
  resolveLocaleStrings,
  listLocales,
} from './locales';
export type { LocaleCode, LocaleStrings, LocaleButtonLabels } from './locales';
export { themes } from './themes';
export type { PaginationTheme } from './themes';
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
