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
  createLeaderboardPages,
  createMentionPages,
  formatList,
  createProgressBar,
  toEmbedBuilders,
  isPagincordCustomId,
} from './helpers';
export type {
  CreatePagesOptions,
  CreatePagesContext,
  CreateTextPagesOptions,
  CreateFieldPagesOptions,
  CreateTablePagesOptions,
  CreateImagePagesOptions,
  CreateCodePagesOptions,
  CreateLeaderboardPagesOptions,
  CreateMentionPagesOptions,
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
  it,
  defineLocale,
  interpolate,
  resolveLocaleStrings,
  listLocales,
} from './locales';
export type { LocaleCode, LocaleStrings, LocaleButtonLabels } from './locales';
export { themes } from './themes';
export type { PaginationTheme } from './themes';
export { VERSION } from './version';
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
  LinkButton,
  FetchPageFn,
  ProgressBarOptions,
} from './types';
