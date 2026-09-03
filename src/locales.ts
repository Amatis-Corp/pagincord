/**
 * Built-in UI strings and locale helpers.
 * Tokens: `{page}` `{total}` `{title}` `{user}` `{query}`
 */

export type LocaleCode = 'en' | 'es' | 'pt' | 'fr' | 'de' | 'it' | (string & {});

export interface LocaleButtonLabels {
  first: string;
  previous: string;
  next: string;
  last: string;
  stop: string;
  search: string;
  home: string;
  random: string;
  back: string;
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
  searchModalTitle: string;
  searchModalLabel: string;
  searchModalPlaceholder: string;
  searchNoResults: string;
  confirmStop: string;
  paused: string;
  pageNow: string;
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
  searchModalTitle: 'Search pages',
  searchModalLabel: 'Search query',
  searchModalPlaceholder: 'Title or text…',
  searchNoResults: 'No page matched "{query}".',
  confirmStop: 'Click Close again to confirm.',
  paused: 'Pagination is paused.',
  pageNow: 'Now viewing page {page} of {total}.',
  buttons: {
    first: 'First',
    previous: 'Back',
    next: 'Next',
    last: 'Last',
    stop: 'Close',
    search: 'Search',
    home: 'Home',
    random: 'Random',
    back: 'History',
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
  searchModalTitle: 'Buscar páginas',
  searchModalLabel: 'Búsqueda',
  searchModalPlaceholder: 'Título o texto…',
  searchNoResults: 'Ninguna página coincide con "{query}".',
  confirmStop: 'Pulsa Cerrar otra vez para confirmar.',
  paused: 'La paginación está en pausa.',
  pageNow: 'Estás en la página {page} de {total}.',
  buttons: {
    first: 'Inicio',
    previous: 'Atrás',
    next: 'Siguiente',
    last: 'Final',
    stop: 'Cerrar',
    search: 'Buscar',
    home: 'Inicio',
    random: 'Aleatorio',
    back: 'Historial',
  },
};

export const pt: LocaleStrings = {
  unauthorized: 'Você não pode controlar esta paginação.',
  pageLabel: 'Página {page} de {total}',
  selectPlaceholder: 'Página {page} de {total}',
  selectEnded: 'Paginação encerrada',
  selectOption: '{page}. {title}',
  fallbackTitle: 'Página {page}',
  jumpModalTitle: 'Ir para a página',
  jumpModalLabel: 'Número da página (1-{total})',
  jumpModalPlaceholder: 'Atual: {page} de {total}',
  jumpModalInvalid: 'Digite um número entre 1 e {total}.',
  emptyList: 'Nenhum item para exibir.',
  indicator: '{page} / {total}',
  searchModalTitle: 'Pesquisar páginas',
  searchModalLabel: 'Busca',
  searchModalPlaceholder: 'Título ou texto…',
  searchNoResults: 'Nenhuma página corresponde a "{query}".',
  confirmStop: 'Clique em Fechar novamente para confirmar.',
  paused: 'A paginação está pausada.',
  pageNow: 'Você está na página {page} de {total}.',
  buttons: {
    first: 'Início',
    previous: 'Voltar',
    next: 'Próximo',
    last: 'Fim',
    stop: 'Fechar',
    search: 'Buscar',
    home: 'Início',
    random: 'Aleatório',
    back: 'Histórico',
  },
};

export const fr: LocaleStrings = {
  unauthorized: 'Vous ne pouvez pas contrôler cette pagination.',
  pageLabel: 'Page {page} sur {total}',
  selectPlaceholder: 'Page {page} sur {total}',
  selectEnded: 'Pagination terminée',
  selectOption: '{page}. {title}',
  fallbackTitle: 'Page {page}',
  jumpModalTitle: 'Aller à la page',
  jumpModalLabel: 'Numéro de page (1-{total})',
  jumpModalPlaceholder: 'Actuellement {page} sur {total}',
  jumpModalInvalid: 'Entrez un nombre entre 1 et {total}.',
  emptyList: 'Aucun élément à afficher.',
  indicator: '{page} / {total}',
  searchModalTitle: 'Rechercher',
  searchModalLabel: 'Recherche',
  searchModalPlaceholder: 'Titre ou texte…',
  searchNoResults: 'Aucune page ne correspond à « {query} ».',
  confirmStop: 'Cliquez à nouveau sur Fermer pour confirmer.',
  paused: 'La pagination est en pause.',
  pageNow: 'Vous êtes à la page {page} sur {total}.',
  buttons: {
    first: 'Début',
    previous: 'Retour',
    next: 'Suivant',
    last: 'Fin',
    stop: 'Fermer',
    search: 'Rechercher',
    home: 'Accueil',
    random: 'Aléatoire',
    back: 'Historique',
  },
};

export const de: LocaleStrings = {
  unauthorized: 'Du darfst diese Paginierung nicht steuern.',
  pageLabel: 'Seite {page} von {total}',
  selectPlaceholder: 'Seite {page} von {total}',
  selectEnded: 'Paginierung beendet',
  selectOption: '{page}. {title}',
  fallbackTitle: 'Seite {page}',
  jumpModalTitle: 'Zu Seite springen',
  jumpModalLabel: 'Seitennummer (1-{total})',
  jumpModalPlaceholder: 'Aktuell {page} von {total}',
  jumpModalInvalid: 'Bitte eine Zahl zwischen 1 und {total} eingeben.',
  emptyList: 'Keine Einträge vorhanden.',
  indicator: '{page} / {total}',
  searchModalTitle: 'Seiten durchsuchen',
  searchModalLabel: 'Suche',
  searchModalPlaceholder: 'Titel oder Text…',
  searchNoResults: 'Keine Seite passt zu „{query}“.',
  confirmStop: 'Zum Bestätigen erneut auf Schließen klicken.',
  paused: 'Die Paginierung ist pausiert.',
  pageNow: 'Du siehst Seite {page} von {total}.',
  buttons: {
    first: 'Anfang',
    previous: 'Zurück',
    next: 'Weiter',
    last: 'Ende',
    stop: 'Schließen',
    search: 'Suche',
    home: 'Start',
    random: 'Zufall',
    back: 'Verlauf',
  },
};

export const it: LocaleStrings = {
  unauthorized: 'Non puoi controllare questa paginazione.',
  pageLabel: 'Pagina {page} di {total}',
  selectPlaceholder: 'Pagina {page} di {total}',
  selectEnded: 'Paginazione terminata',
  selectOption: '{page}. {title}',
  fallbackTitle: 'Pagina {page}',
  jumpModalTitle: 'Vai alla pagina',
  jumpModalLabel: 'Numero di pagina (1-{total})',
  jumpModalPlaceholder: 'Attuale: {page} di {total}',
  jumpModalInvalid: 'Inserisci un numero tra 1 e {total}.',
  emptyList: 'Nessun elemento da mostrare.',
  indicator: '{page} / {total}',
  searchModalTitle: 'Cerca pagine',
  searchModalLabel: 'Ricerca',
  searchModalPlaceholder: 'Titolo o testo…',
  searchNoResults: 'Nessuna pagina corrisponde a "{query}".',
  confirmStop: 'Clicca di nuovo su Chiudi per confermare.',
  paused: 'La paginazione è in pausa.',
  pageNow: 'Stai visualizzando la pagina {page} di {total}.',
  buttons: {
    first: 'Inizio',
    previous: 'Indietro',
    next: 'Avanti',
    last: 'Fine',
    stop: 'Chiudi',
    search: 'Cerca',
    home: 'Home',
    random: 'Casuale',
    back: 'Cronologia',
  },
};

const registry = new Map<string, LocaleStrings>([
  ['en', en],
  ['es', es],
  ['pt', pt],
  ['pt-br', pt],
  ['fr', fr],
  ['de', de],
  ['it', it],
]);

export const locales = { en, es, pt, fr, de, it } as const;

export function interpolate(
  template: string,
  vars: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    vars[key] === undefined ? `{${key}}` : String(vars[key])
  );
}

export function defineLocale(code: string, strings: LocaleStrings): void {
  registry.set(code.toLowerCase(), strings);
}

export function resolveLocaleStrings(
  code?: string,
  overrides?: Partial<Omit<LocaleStrings, 'buttons'>> & { buttons?: Partial<LocaleButtonLabels> }
): LocaleStrings {
  const registered = registry.get((code ?? 'en').toLowerCase());
  const base: LocaleStrings = registered
    ? {
        ...en,
        ...registered,
        buttons: { ...en.buttons, ...registered.buttons },
      }
    : en;
  if (!overrides) return base;
  return {
    ...base,
    ...overrides,
    buttons: { ...base.buttons, ...overrides.buttons },
  };
}

export function listLocales(): string[] {
  return [...new Set(registry.keys())];
}

export function isRegisteredLocale(code: string): boolean {
  return registry.has(code.toLowerCase());
}
