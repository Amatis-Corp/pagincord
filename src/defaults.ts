import type {
  EndBehavior,
  PaginationButtonEmojis,
  PaginationButtons,
  PaginationPreset,
} from './types';
import type { LocaleCode } from './locales';

/**
 * Global defaults applied to every new {@link Paginator} unless overridden.
 */
export interface PagincordDefaults {
  locale?: LocaleCode;
  timeout?: number;
  loop?: boolean;
  useSelectMenu?: boolean;
  endBehavior?: EndBehavior;
  autoFooter?: boolean;
  hideButtonsIfSinglePage?: boolean;
  showButtonLabels?: boolean;
  hideEmojis?: boolean;
  preset?: PaginationPreset;
  buttonEmojis?: PaginationButtonEmojis;
  buttons?: PaginationButtons;
  ephemeral?: boolean;
}

const HARDCODED: Required<
  Pick<
    PagincordDefaults,
    | 'locale'
    | 'timeout'
    | 'loop'
    | 'useSelectMenu'
    | 'endBehavior'
    | 'autoFooter'
    | 'hideButtonsIfSinglePage'
    | 'showButtonLabels'
    | 'hideEmojis'
    | 'ephemeral'
  >
> = {
  locale: 'en',
  timeout: 60_000,
  loop: false,
  useSelectMenu: false,
  endBehavior: 'disable',
  autoFooter: false,
  hideButtonsIfSinglePage: false,
  showButtonLabels: false,
  hideEmojis: false,
  ephemeral: false,
};

let current: PagincordDefaults = { ...HARDCODED };

/**
 * Set defaults for the whole process (call once when the bot starts).
 *
 * @example
 * configure({ locale: 'es', timeout: 120_000, showButtonLabels: true });
 */
export function configure(defaults: PagincordDefaults): void {
  current = { ...current, ...defaults };
}

export function getConfig(): PagincordDefaults {
  return { ...current };
}

export function resetConfig(): void {
  current = { ...HARDCODED };
}

export function setLocale(locale: LocaleCode): void {
  current.locale = locale;
}

export function getLocale(): LocaleCode {
  return current.locale ?? 'en';
}
