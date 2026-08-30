/**
 * Built-in UI strings and locale helpers.
 * Tokens: `{page}` `{total}` `{title}` `{user}`
 */

export type LocaleCode = 'en' | 'es' | (string & {});

export interface LocaleButtonLabels {
  first: string;
  previous: string;
  next: string;
  last: string;
  stop: string;
}

export interface LocaleStrings {
  unauthorized: string;
  pageLabel: string;
  selectPlaceholder: string;
  selectEnded: string;
  selectOption: string;
  fallbackTitle: string;
  jumpModalTitle: string;
  jumpModalLabel: string;
  jumpModalPlaceholder: string;
  jumpModalInvalid: string;
  emptyList: string;
  indicator: string;
  buttons: LocaleButtonLabels;
}

export const en: LocaleStrings = {
  unauthorized: 'You are not allowed to control this pagination.',
  pageLabel: 'Page {page} of {total}',
  selectPlaceholder: 'Page {page} of {total}',
  selectEnded: 'Pagination ended',
  selectOption: '{page}. {title}',
  fallbackTitle: 'Page {page}',
  jumpModalTitle: 'Go to page',
  jumpModalLabel: 'Page number (1-{total})',
  jumpModalPlaceholder: 'Currently {page} of {total}',
  jumpModalInvalid: 'Please enter a number between 1 and {total}.',
  emptyList: 'No items to display.',
  indicator: '{page} / {total}',
  buttons: {
    first: 'First',
    previous: 'Back',
    next: 'Next',
    last: 'Last',
    stop: 'Close',
  },
};

export const es: LocaleStrings = {
  unauthorized: 'No puedes controlar esta paginación.',
  pageLabel: 'Página {page} de {total}',
  selectPlaceholder: 'Página {page} de {total}',
  selectEnded: 'Paginación finalizada',
  selectOption: '{page}. {title}',
  fallbackTitle: 'Página {page}',
  jumpModalTitle: 'Ir a página',
  jumpModalLabel: 'Número de página (1-{total})',
  jumpModalPlaceholder: 'Actual: {page} de {total}',
  jumpModalInvalid: 'Introduce un número entre 1 y {total}.',
  emptyList: 'No hay elementos para mostrar.',
  indicator: '{page} / {total}',
  buttons: {
    first: 'Inicio',
    previous: 'Atrás',
    next: 'Siguiente',
    last: 'Final',
    stop: 'Cerrar',
  },
};

const registry = new Map<string, LocaleStrings>([
  ['en', en],
  ['es', es],
]);

export const locales = { en, es } as const;

/**
 * Replace `{token}` placeholders in a template.
 */
export function interpolate(
  template: string,
  vars: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    vars[key] === undefined ? `{${key}}` : String(vars[key])
  );
}

/**
 * Register extra locales (`fr`, `pt-BR`, …) or override `en` / `es`.
 */
export function defineLocale(code: string, strings: LocaleStrings): void {
  registry.set(code.toLowerCase(), strings);
}

export function resolveLocaleStrings(
  code?: string,
  overrides?: Partial<Omit<LocaleStrings, 'buttons'>> & { buttons?: Partial<LocaleButtonLabels> }
): LocaleStrings {
  const base = registry.get((code ?? 'en').toLowerCase()) ?? en;
  if (!overrides) return base;
  return {
    ...base,
    ...overrides,
    buttons: { ...base.buttons, ...overrides.buttons },
  };
}

export function isRegisteredLocale(code: string): boolean {
  return registry.has(code.toLowerCase());
}
