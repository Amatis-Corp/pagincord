<div align="center">

# Pagincord

**Smart, fully configurable embed pagination for Discord.js v14+**

by [Amatis Corp](https://github.com/amatiscorp)

Buttons · Lazy pages · Progress bar · Search · Themes · EN / ES / PT / FR / DE / IT · TypeScript

[![npm version](https://img.shields.io/npm/v/@amatiscorp/pagincord.svg?style=flat-square)](https://www.npmjs.com/package/@amatiscorp/pagincord)
[![npm downloads](https://img.shields.io/npm/dm/@amatiscorp/pagincord.svg?style=flat-square)](https://www.npmjs.com/package/@amatiscorp/pagincord)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg?style=flat-square)](https://www.typescriptlang.org/)

[Install](#installation) · [Quick start](#quick-start) · [Locales](#languages-en--es) · [Configure](#global-defaults) · [API](#api-reference) · [Español](#español)

</div>

---

Pagincord turns an array of embeds into an interactive Discord message. You control the language, buttons, labels, timeout, who can click, and what happens when it ends.

Works with slash commands, buttons, select menus, and regular messages.

**Requires:** Node.js `>=16.11` and `discord.js` `^14`.

**Package:** [`@amatiscorp/pagincord`](https://www.npmjs.com/package/@amatiscorp/pagincord)  
**Repo:** [github.com/amatiscorp/pagincord](https://github.com/amatiscorp/pagincord)

---

## Installation

```bash
npm install @amatiscorp/pagincord discord.js
```

```bash
yarn add @amatiscorp/pagincord discord.js
```

```bash
pnpm add @amatiscorp/pagincord discord.js
```

`discord.js` is a peer dependency. Install it in your bot as well.

```javascript
const { Paginator, paginate, configure } = require('@amatiscorp/pagincord');
```

```typescript
import { Paginator, paginate, configure } from '@amatiscorp/pagincord';
```

---

## Quick start

### Slash command

```javascript
const { Paginator } = require('@amatiscorp/pagincord');
const { EmbedBuilder } = require('discord.js');

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== 'help') return;

  const paginator = new Paginator({
    embeds: [
      new EmbedBuilder().setTitle('Page 1').setDescription('Welcome').setColor(0x5865f2),
      new EmbedBuilder().setTitle('Page 2').setDescription('Commands').setColor(0x57f287),
      new EmbedBuilder().setTitle('Page 3').setDescription('Support').setColor(0xfee75c),
    ],
    authorId: interaction.user.id,
    locale: 'en',
  });

  await paginator.start(interaction);
});
```

### One-liner

```javascript
const { paginate } = require('@amatiscorp/pagincord');

await paginate(interaction, {
  embeds: pages,
  authorId: interaction.user.id,
  locale: 'en',
});
```

### Prefix command

```javascript
const { Paginator } = require('@amatiscorp/pagincord');

client.on('messageCreate', async (message) => {
  if (message.content !== '!pages') return;

  await new Paginator({
    embeds: [
      { title: 'Page 1', description: 'Hello', color: 0x00ff00 },
      { title: 'Page 2', description: 'World', color: 0x0000ff },
    ],
    authorId: message.author.id,
  }).start(message);
});
```

---

## Languages

Built-in UI strings (errors, footer, select, jump modal, search, empty list, button labels) ship in:

| Code | Language |
|------|----------|
| `en` | English (default) |
| `es` | Español |
| `pt` | Português (`pt-BR` also works) |
| `fr` | Français |
| `de` | Deutsch |
| `it` | Italiano |

```javascript
// English (default)
await paginate(interaction, { embeds, locale: 'en' });

// Español — modal, errores, footer y select en español
await paginate(interaction, {
  embeds,
  locale: 'es',
  showButtonLabels: true, // First → Inicio, Back → Atrás, …
});
```

Set it once for the whole bot:

```javascript
const { configure } = require('@amatiscorp/pagincord');

configure({
  locale: 'es',
  showButtonLabels: true,
  timeout: 120_000,
});
```

Override a single string:

```javascript
await paginate(interaction, {
  embeds,
  locale: 'es',
  texts: {
    unauthorized: 'Solo el autor del comando puede usar estos botones.',
  },
});
```

Add another language:

```javascript
const { defineLocale } = require('@amatiscorp/pagincord');

defineLocale('fr', {
  unauthorized: "Vous ne pouvez pas contrôler cette pagination.",
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
  buttons: {
    first: 'Début',
    previous: 'Retour',
    next: 'Suivant',
    last: 'Fin',
    stop: 'Fermer',
  },
});
```

Tokens you can use in templates: `{page}` `{total}` `{title}`.

---

## Global defaults

```javascript
const { configure, setLocale, Paginator } = require('@amatiscorp/pagincord');

configure({
  locale: 'en',
  timeout: 90_000,
  loop: false,
  useSelectMenu: false,
  endBehavior: 'disable',
  autoFooter: false,
  showButtonLabels: false,
  hideEmojis: false,
  preset: 'full',
  ephemeral: false,
});

// aliases
setLocale('es');
Paginator.configure({ locale: 'en' });
```

Instance options always win over `configure()`.

---

## Presets

| Preset | Buttons | Select menu |
|--------|---------|-------------|
| `full` (default) | First · Previous · Stop · Next · Last | no |
| `compact` | Previous · `1 / 5` · Next · Stop | no |
| `minimal` | Previous · Next | no |
| `select` | Stop only | yes |

```javascript
await paginate(interaction, {
  embeds,
  authorId: interaction.user.id,
  preset: 'compact',
  jumpModal: true,
});
```

You can still override `buttons`, `buttonOrder`, and `useSelectMenu` after picking a preset.

---

## Features

- **EmbedBuilder or plain objects** — mix both; hex colors like `'#5865F2'` are allowed
- **Lazy pages** — `fetchPage` + `totalPages` for huge datasets
- **`embedsPerPage`** — show up to 10 embeds at once
- **Progress bar**, **link buttons**, **home / random / history**
- **`allowedRoles`**, **`notifyPageChange`**, **`clone()`**, **`shufflePages()`**
- **EN / ES / PT / FR / DE / IT locales** plus `defineLocale()` for any other language
- **Themes** — `classic`, `arrows`, `round`, `discord`
- **Search** — find a page by title or description
- **Numbered buttons** — jump with `1 2 3 4 5`
- **`paginateList()`** — list → pages → start in one call
- **Tables, images, code** — `createTablePages`, `createImagePages`, `createCodePages`
- **Pause / resume**, confirm-close, `autoTitle`, `transform`, `beforePageChange`
- **User lock** — `authorId`, `allowedUsers`, or a custom `filter`
- **Smart buttons** — auto-disable at the edges; custom order, labels, styles, emojis
- **Jump-to-page modal** — click `1 / 5` and type a number
- **Select menu** — works with more than 25 pages (sliding window)
- **Helpers** — `createPages`, `createTextPages`, `createFieldPages`, `chunk`, `splitText`
- **Events** — `start`, `pageChange`, `collect`, `unauthorized`, `end`, `error`
- **Loop**, ephemeral replies, auto footer, extra action rows
- **Unique custom IDs** — several paginators can live in the same channel
- **Zero runtime dependencies**

---

## Examples

### 1. Paginate a list (`createPages`)

```javascript
const { paginate, createPages } = require('@amatiscorp/pagincord');

const pages = createPages({
  items: users,
  itemsPerPage: 5,
  mapItem: (user, i) => `**${i + 1}.** ${user.name} — **${user.score}** pts`,
  embed: { title: '🏆 Leaderboard', color: 0xffd700 },
  locale: 'en',
});

await paginate(interaction, {
  embeds: pages,
  authorId: interaction.user.id,
  useSelectMenu: true,
});
```

Custom page body:

```javascript
createPages({
  items: products,
  itemsPerPage: 3,
  mapPage: (items) => items.map((p) => `**${p.name}**\n${p.price} coins`).join('\n\n'),
  embed: { title: 'Shop', color: 0x3498db },
});
```

### 2. Long text (`createTextPages` / `splitText`)

```javascript
const { createTextPages, splitText } = require('@amatiscorp/pagincord');

const pages = createTextPages(rulesMarkdown, {
  title: (page, total) => `Rules (${page}/${total})`,
  color: 0xe74c3c,
  maxLength: 3500,
  locale: 'en',
});
```

`splitText(text, 4096)` only splits a string. Discord embed descriptions max out at 4096 characters.

### 3. Embed fields (`createFieldPages`)

```javascript
const { createFieldPages, paginate } = require('@amatiscorp/pagincord');

const pages = createFieldPages(
  [
    { name: 'Sword', value: '120 coins', inline: true },
    { name: 'Shield', value: '90 coins', inline: true },
    { name: 'Potion', value: '25 coins', inline: true },
  ],
  { fieldsPerPage: 6, embed: { title: 'Shop', color: 0x3498db } }
);

await paginate(interaction, { embeds: pages, authorId: interaction.user.id });
```

### 4. Labels, order, and emojis

```javascript
await paginate(interaction, {
  embeds,
  locale: 'en',
  showButtonLabels: true,
  hideEmojis: false,
  buttonOrder: ['previous', 'pageIndicator', 'next', 'stop'],
  buttons: { first: false, last: false, pageIndicator: true, stop: true },
  buttonLabels: { stop: 'Dismiss' },
  buttonEmojis: { previous: '⬅️', next: '➡️', stop: '❌' },
  jumpModal: true,
});
```

### 5. Who can click

```javascript
// anyone
await paginate(interaction, { embeds });

// author + extra users
await paginate(interaction, {
  embeds,
  authorId: interaction.user.id,
  allowedUsers: ['123456789012345678'],
});

// role filter
await paginate(interaction, {
  embeds,
  filter: (i) => i.member?.roles.cache.has(modRoleId),
  unauthorizedMessage: (user) => `${user}, this menu is for moderators.`,
});
```

### 6. Footer, content, ephemeral, end behavior

```javascript
await paginate(interaction, {
  embeds,
  authorId: interaction.user.id,
  locale: 'en',
  ephemeral: true,
  autoFooter: { format: 'Page {page} / {total}', append: true },
  content: ({ page, total }) => `Viewing **${page + 1}** of **${total}**`,
  endBehavior: 'clear', // 'disable' | 'delete' | 'clear'
  timeout: 120_000,     // idle; 0 = never
  maxDuration: 600_000, // hard cap, even if people keep clicking
});
```

`page` in callbacks is **0-based**. Show it as `page + 1`.

### 7. Events and live updates

```javascript
const paginator = new Paginator({
  embeds,
  authorId: interaction.user.id,
  onStart: (message) => console.log('sent', message.id),
  onPageChange: ({ page, total }) => console.log(`${page + 1}/${total}`),
  onEnd: (reason) => console.log(reason),
});

paginator.on('collect', (i) => console.log(i.user.tag));
paginator.on('unauthorized', (i) => console.log('blocked', i.user.id));
paginator.on('error', (err) => console.error(err));

await paginator.start(interaction);

await paginator.goToPage(2);
await paginator.next();
await paginator.previous();
await paginator.first();
await paginator.last();
await paginator.addEmbeds([{ title: 'Extra', description: 'Appended' }]);
await paginator.insertEmbeds(0, [{ title: 'Intro', description: 'New first page' }]);
await paginator.removePage(3);
paginator.setAllowedUsers([interaction.user.id]);
paginator.setLocale('es');
await paginator.refresh();
await paginator.stop();
```

### 8. Custom select options + extra rows

```javascript
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

await paginate(interaction, {
  embeds,
  useSelectMenu: true,
  selectOption: (embed, index) => ({
    label: `Go to ${embed.data.title}`,
    description: `Page ${index + 1}`,
    emoji: '📄',
  }),
  extraRows: ({ page }) => [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`claim-${page}`)
        .setLabel('Claim this page')
        .setStyle(ButtonStyle.Success)
    ),
  ],
});
```

Discord allows **5 rows** total. Pagincord fills buttons + select first, then appends `extraRows`.

### 9. Reply mode

```javascript
await interaction.deferReply();
await paginate(interaction, { embeds }); // editReply

await paginate(buttonInteraction, { embeds, replyAs: 'update' });
await paginate(interaction, { embeds, replyAs: 'followUp' });
```

### 10. Deferred command with slow I/O

```javascript
await interaction.deferReply();
const tracks = await fetchQueue();

const pages = createPages({
  items: tracks,
  itemsPerPage: 8,
  mapItem: (t, i) => `\`${i + 1}.\` ${t.title} — ${t.duration}`,
  embed: { title: 'Music queue', color: 0x1db954 },
});

await paginate(interaction, { embeds: pages, authorId: interaction.user.id, locale: 'en' });
```

### 11. One-shot lists (`paginateList`)

```javascript
const { paginateList } = require('@amatiscorp/pagincord');

await paginateList(interaction, users, {
  itemsPerPage: 5,
  mapItem: (user, i) => `**${i + 1}.** ${user.name} — ${user.score}`,
  embed: { title: '🏆 Leaderboard', color: 0xffd700 },
  authorId: interaction.user.id,
  locale: 'en',
  searchable: true,
  numberedButtons: true,
});
```

### 12. Themes, search, numbered buttons, auto title

```javascript
await paginate(interaction, {
  embeds,
  authorId: interaction.user.id,
  theme: 'arrows',          // ⏪ ⬅️ ➡️ ⏩ ❌
  searchable: true,         // 🔍 opens a search modal
  numberedButtons: true,    // row of 1–5
  autoTitle: true,          // "Welcome (1/3)"
  confirmStop: true,        // Close must be clicked twice
  autoDefer: true,
});
```

Other themes: `classic`, `arrows`, `round`, `discord`. Import `themes` if you want to copy an emoji pack.

### 13. Tables, images, code

```javascript
const {
  createTablePages,
  createImagePages,
  createCodePages,
  formatList,
} = require('@amatiscorp/pagincord');

createTablePages(
  [
    ['Alex', 1200],
    ['Sam', 980],
  ],
  { headers: ['Name', 'Score'], rowsPerPage: 10, embed: { title: 'Ranking' } }
);

createImagePages(['https://example.com/1.png', 'https://example.com/2.png'], {
  color: 0x5865f2,
});

createCodePages(source, { language: 'js', title: 'index.js' });

formatList(['alpha', 'beta'], { style: 'bulleted' });
// • alpha
// • beta
```

### 14. Transform, cancel navigation, pause

```javascript
const paginator = new Paginator({
  embeds,
  authorId: interaction.user.id,
  transform: (embed, { page, total }) =>
    embed.setFooter({ text: `Custom ${page + 1}/${total}` }),
  beforePageChange: (from, to) => to !== 2, // skip page 3
});

await paginator.start(interaction);
await paginator.pause();
await paginator.resume();

// Edit an existing bot message instead of sending a new one:
await paginator.attach(existingMessage);
```

### 15. Lazy pages, progress bar, extra buttons, roles

```javascript
await paginate(interaction, {
  fetchPage: async (index) => {
    const item = await db.getPage(index);
    return { title: item.name, description: item.body, color: 0x5865f2 };
  },
  totalPages: 200,
  authorId: interaction.user.id,
  progressBar: true,
  buttons: { home: true, random: true, back: true },
  allowedRoles: [modRoleId],
  notifyPageChange: true,
  linkButtons: [{ label: 'Docs', url: 'https://github.com/amatiscorp/pagincord' }],
  embedsPerPage: 1,
});
```

```javascript
const { createLeaderboardPages, createMentionPages, createProgressBar } = require('@amatiscorp/pagincord');

createLeaderboardPages(users, {
  mapItem: (u) => `${u.name} — ${u.score}`,
  itemsPerPage: 10,
});

createMentionPages(userIds, { kind: 'user', itemsPerPage: 15 });

createProgressBar(3, 10); // ██████░░░░
```

---

## API reference

### `configure(defaults)` / `setLocale(code)`

| Key | Type | Default |
|-----|------|---------|
| `locale` | `'en' \| 'es' \| 'pt' \| 'fr' \| 'de' \| string` | `'en'` |
| `timeout` | `number` | `60000` |
| `loop` | `boolean` | `false` |
| `useSelectMenu` | `boolean` | `false` |
| `endBehavior` | `'disable' \| 'delete' \| 'clear'` | `'disable'` |
| `autoFooter` | `boolean` | `false` |
| `showButtonLabels` | `boolean` | `false` |
| `hideEmojis` | `boolean` | `false` |
| `preset` | `'full' \| 'compact' \| 'minimal' \| 'select'` | — |
| `theme` | `'classic' \| 'arrows' \| 'round' \| 'discord'` | `'classic'` |
| `autoTitle` | `boolean \| string` | `false` |
| `numberedButtons` | `boolean \| number` | `false` |
| `searchable` | `boolean` | `false` |
| `confirmStop` | `boolean` | `false` |
| `silentUnauthorized` | `boolean` | `false` |
| `autoDefer` | `boolean` | `false` |
| `embedsPerPage` | `number` | `1` |
| `progressBar` | `boolean` | `false` |
| `ephemeral` | `boolean` | `false` |
| `buttons` / `buttonEmojis` | objects | built-in |

`getConfig()`, `resetConfig()`, `getLocale()` read the current defaults.

### `new Paginator(options)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `embeds` | `(EmbedBuilder \| EmbedData)[]` | **required** | Pages |
| `locale` | `'en' \| 'es' \| 'pt' \| 'fr' \| 'de' \| string` | config | UI language |
| `texts` | `object` | — | Per-instance string overrides |
| `preset` | `'full' \| 'compact' \| 'minimal' \| 'select'` | `full` | Button layout shortcut |
| `theme` | `'classic' \| 'arrows' \| 'round' \| 'discord'` | `classic` | Emoji pack |
| `autoTitle` | `boolean \| string` | `false` | Append `(1/5)` to the title |
| `transform` | `(embed, ctx) => …` | — | Mutate embed before send |
| `beforePageChange` | `(from, to) => boolean` | — | Return `false` to cancel |
| `numberedButtons` | `boolean \| number` | `false` | Number row (max 5) |
| `searchable` | `boolean` | `false` | Search modal + button |
| `confirmStop` | `boolean` | `false` | Double-click Close |
| `silentUnauthorized` | `boolean` | `false` | Block without a reply |
| `editMessage` | `boolean` | `false` | Edit the target `Message` |
| `autoDefer` | `boolean` | `false` | `deferReply` if needed |
| `fetchPage` | `(index, total) => embed(s)` | — | Load pages on demand |
| `totalPages` | `number` | — | Required with `fetchPage` if no embeds |
| `embedsPerPage` | `number` | `1` | 1–10 embeds visible at once |
| `progressBar` | `boolean \| { size, format }` | `false` | Footer bar `{bar}` `{percent}` |
| `linkButtons` | `{ label, url, emoji? }[]` | — | URL buttons |
| `allowedRoles` | `string[]` | `[]` | Role IDs that may click |
| `notifyPageChange` | `boolean \| fn` | `false` | Ephemeral “now on page X” |
| `homePage` | `number` | `0` | Target of the Home button |
| `buttons.home` / `.random` / `.back` | `boolean` | `false` | Extra nav buttons |
| `authorId` | `string` | — | Only this user can click |
| `allowedUsers` | `string[]` | `[]` | Extra allowed IDs |
| `filter` | `(i) => boolean` | — | Return `false` to reject |
| `useSelectMenu` | `boolean` | `false` | Page dropdown |
| `selectPlaceholder` | `string \| fn` | locale | Select placeholder |
| `selectOption` | `(embed, index, ctx) => …` | locale | Custom option label / emoji |
| `timeout` | `number` | `60000` | Idle ms (`0` = never) |
| `maxDuration` | `number` | — | Absolute collector lifetime |
| `buttonEmojis` | `object` | `⏮️ ◀️ ▶️ ⏭️ 🗑️` | Custom emojis |
| `buttonLabels` | `object` | — | Custom labels |
| `buttonStyles` | `object` | Primary / Danger | discord.js styles |
| `buttons` | `object` | all nav + stop | Toggle each button |
| `buttonOrder` | `ButtonKey[]` | default order | Render order |
| `showButtonLabels` | `boolean` | `false` | Use locale labels |
| `hideEmojis` | `boolean` | `false` | Labels only |
| `jumpModal` | `boolean \| object` | `false` | Type a page number |
| `deleteOnStop` | `boolean` | `false` | Alias of `endBehavior: 'delete'` |
| `endBehavior` | `'disable' \| 'delete' \| 'clear'` | `'disable'` | After stop / timeout |
| `startPage` | `number` | `0` | 0-based |
| `loop` | `boolean` | `false` | Wrap around |
| `ephemeral` | `boolean` | `false` | Interaction-only |
| `content` | `string \| fn` | — | Text above the embed |
| `autoFooter` | `boolean \| { format, append }` | `false` | Page footer |
| `unauthorizedMessage` | `string \| fn` | locale | Reject message |
| `hideButtonsIfSinglePage` | `boolean` | `false` | Hide controls if 1 page |
| `replyAs` | `'reply' \| 'editReply' \| 'followUp' \| 'update'` | auto | How to send |
| `indicatorFormat` | `string` | locale | `1 / 5` button text |
| `customIdPrefix` | `string` | `'pgc'` | Component ID prefix |
| `extraRows` | `rows \| (ctx) => rows` | — | Extra action rows |
| `allowedMentions` | `object` | — | Passed to Discord |
| `onPageChange` / `onEnd` / `onCollect` / `onStart` / `onUnauthorized` | fn | — | Callbacks |

`jumpModal`: `{ title?, label?, placeholder?, invalid? }`.

### Methods

```ts
await paginator.start(target)
await paginator.attach(message)    // edit an existing message
await paginator.stop()
await paginator.pause()
await paginator.resume()
await paginator.goToPage(index)    // 0-based
await paginator.next()
await paginator.previous()
await paginator.first()
await paginator.last()
await paginator.home()
await paginator.random()
await paginator.back()
await paginator.shufflePages()
paginator.clone()
await paginator.setEmbeds(embeds)
await paginator.addEmbeds(embeds)
await paginator.insertEmbeds(index, embeds)
await paginator.removePage(index)
await paginator.refresh()

paginator.setAllowedUsers(ids)
paginator.setLocale('es')
paginator.getLocale()
paginator.getEmbeds()
paginator.getTotalPages()
paginator.getCurrentPage()         // 0-based
paginator.getMessage()
paginator.isActive()
paginator.isPaused()
paginator.getState()               // includes locale, active, paused
```

### Helpers

| Function | Purpose |
|----------|---------|
| `paginate(target, options)` | `new Paginator` + `start` |
| `paginateList(target, items, opts)` | List → embeds → start |
| `createPages({ items, … })` | Split a list into embeds |
| `createTextPages(text, opts)` | Split a long string into embeds |
| `createFieldPages(fields, opts)` | Split embed fields (max 25 / page) |
| `createTablePages(rows, opts)` | Markdown/code table pages |
| `createImagePages(urls, opts)` | One image per page |
| `createLeaderboardPages(items, opts)` | Ranked list with 🥇🥈🥉 |
| `createMentionPages(ids, opts)` | `<@user>` / `<@&role>` / `<#channel>` |
| `createProgressBar(value, max, size)` | `██████░░░░` |
| `isPagincordCustomId(id)` | Detect Pagincord component IDs |
| `VERSION` | `'2.2.0'` |
| `formatList(items, opts)` | Numbered / bulleted / dashed |
| `chunk(array, size)` | Raw `T[][]` |
| `splitText(text, maxLength)` | Split a string on paragraphs / spaces |
| `toEmbedBuilders(embeds)` | Normalize mixed pages to `EmbedBuilder[]` |
| `interpolate(template, vars)` | Replace `{page}` `{total}` `{title}` |
| `defineLocale(code, strings)` | Register a language |
| `listLocales()` | Registered locale codes |
| `locales` / `themes` | Built-in dictionaries and emoji packs |

### Events

```ts
paginator.on('start', (message) => {});
paginator.on('pageChange', ({ page, total, embed, interaction }) => {});
paginator.on('end', (reason) => {});          // timeout | stop | manual | idle | messageDelete
paginator.on('collect', (interaction) => {});
paginator.on('unauthorized', (interaction) => {});
paginator.on('pause', () => {});
paginator.on('resume', () => {});
paginator.on('error', (error) => {});
```

Listen to `error` if you want failed Discord API calls (deleted message, etc.) instead of silent ignore.

### `EmbedData`

```ts
interface EmbedData {
  title?: string;
  description?: string;
  color?: number | string; // 0x5865f2 or '#5865F2'
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
  footer?: { text: string; iconURL?: string };
  thumbnail?: string;
  image?: string;
  author?: { name: string; iconURL?: string; url?: string };
  timestamp?: boolean | Date;
  url?: string;
}
```

---

## Button layout

Default (`full`):

`⏮️` First · `◀️` Previous · `🗑️` Stop · `▶️` Next · `⏭️` Last

- First / Previous disable on page 1 (unless `loop`)
- Next / Last disable on the last page (unless `loop`)
- Enable `pageIndicator` or `jumpModal` to insert `1 / 5`
- Discord allows 5 buttons per row; extras wrap
- Custom IDs look like `pgc:<id>:next` so two paginators never clash

---

## Notes

- Idle `timeout` resets on every authorized click. `maxDuration` is a hard stop.
- Select menus are limited to 25 options. Pagincord windows around the current page.
- Call `start()` **once** per instance. Create a new `Paginator` for each command.
- `ephemeral` only applies to interactions, not `message.channel.send`.
- Incoming `EmbedBuilder`s are cloned. Pagincord does not mutate yours.

---

## License

MIT © [Amatis Corp](https://github.com/amatiscorp)

---
---

# Español

Pagincord convierte un array de embeds en un mensaje interactivo. El paquete en npm es **`@amatiscorp/pagincord`**.

**Requiere:** Node.js 16.11+ y `discord.js` v14+.

## Instalación

```bash
npm install @amatiscorp/pagincord discord.js
```

```javascript
const { Paginator, paginate, configure } = require('@amatiscorp/pagincord');
```

## Idioma del bot

Todos los textos internos vienen en **inglés, español, portugués, francés, alemán e italiano**: error de permisos, footer, placeholder del select, modal “ir a página”, búsqueda, lista vacía y etiquetas de botones.

```javascript
configure({ locale: 'es', showButtonLabels: true, theme: 'arrows' });
```

```javascript
// Una vez al arrancar el bot
configure({
  locale: 'es',
  showButtonLabels: true, // Inicio, Atrás, Siguiente, Final, Cerrar
  timeout: 120_000,
});

// O solo en un comando
await paginate(interaction, {
  embeds: paginas,
  authorId: interaction.user.id,
  locale: 'es',
  showButtonLabels: true,
  jumpModal: true,
});
```

Textos en inglés por defecto (`locale: 'en'`).

Sobrescribe una frase:

```javascript
await paginate(interaction, {
  embeds: paginas,
  locale: 'es',
  texts: {
    unauthorized: 'Solo el autor del comando puede usar estos botones.',
    jumpModalTitle: 'Saltar a página',
  },
});
```

## Inicio rápido

```javascript
const { Paginator } = require('@amatiscorp/pagincord');
const { EmbedBuilder } = require('discord.js');

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== 'ayuda') return;

  const paginator = new Paginator({
    embeds: [
      new EmbedBuilder().setTitle('Página 1').setDescription('Bienvenida').setColor(0x5865f2),
      new EmbedBuilder().setTitle('Página 2').setDescription('Comandos').setColor(0x57f287),
      new EmbedBuilder().setTitle('Página 3').setDescription('Soporte').setColor(0xfee75c),
    ],
    authorId: interaction.user.id,
    locale: 'es',
    showButtonLabels: true,
  });

  await paginator.start(interaction);
});
```

Atajo:

```javascript
const { paginate } = require('@amatiscorp/pagincord');

await paginate(interaction, {
  embeds: paginas,
  authorId: interaction.user.id,
  locale: 'es',
});
```

## Paginar una lista

```javascript
const { paginate, createPages } = require('@amatiscorp/pagincord');

const paginas = createPages({
  items: usuarios,
  itemsPerPage: 5,
  mapItem: (user, i) => `**${i + 1}.** ${user.name} — **${user.score}** pts`,
  embed: { title: '🏆 Ranking', color: 0xffd700 },
  locale: 'es', // footer "Página X de Y"
});

await paginate(interaction, {
  embeds: paginas,
  authorId: interaction.user.id,
  locale: 'es',
  useSelectMenu: true,
});
```

Atajo de lista:

```javascript
const { paginateList } = require('@amatiscorp/pagincord');

await paginateList(interaction, usuarios, {
  itemsPerPage: 5,
  mapItem: (u, i) => `**${i + 1}.** ${u.name}`,
  embed: { title: 'Ranking' },
  authorId: interaction.user.id,
  locale: 'es',
  searchable: true,
  numberedButtons: true,
  theme: 'arrows',
});
```

Tablas, imágenes y código:

```javascript
const { createTablePages, createImagePages, createCodePages } = require('@amatiscorp/pagincord');

createTablePages(filas, { headers: ['Nombre', 'Puntos'], embed: { title: 'Ranking' } });
createImagePages(urls, { color: 0x5865f2 });
createCodePages(fuente, { language: 'js', title: 'bot.js' });
```

Páginas bajo demanda, barra de progreso y botones extra:

```javascript
await paginate(interaction, {
  fetchPage: async (i) => db.getPage(i),
  totalPages: 200,
  locale: 'es',
  progressBar: true,
  buttons: { home: true, random: true, back: true },
  allowedRoles: [idRolMod],
  linkButtons: [{ label: 'Web', url: 'https://example.com' }],
});
```

Texto largo (reglas, changelog):

```javascript
const { createTextPages } = require('@amatiscorp/pagincord');

const paginas = createTextPages(reglamento, {
  title: (page, total) => `Reglas (${page}/${total})`,
  color: 0xe74c3c,
  locale: 'es',
});
```

Campos de embed:

```javascript
const { createFieldPages } = require('@amatiscorp/pagincord');

const paginas = createFieldPages(campos, {
  fieldsPerPage: 6,
  embed: { title: 'Tienda' },
  locale: 'es',
});
```

## Presets

```javascript
await paginate(interaction, {
  embeds: paginas,
  locale: 'es',
  preset: 'compact', // Atrás · 1/5 · Siguiente · Cerrar
  jumpModal: true,   // pulsar 1/5 abre el modal
});
```

- `full` — todos los botones
- `compact` — atrás / indicador / siguiente / cerrar
- `minimal` — solo atrás y siguiente
- `select` — menú desplegable + cerrar

## Opciones frecuentes

```javascript
const paginator = new Paginator({
  embeds: misEmbeds,
  locale: 'es',
  showButtonLabels: true,
  authorId: interaction.user.id,
  allowedUsers: ['id1', 'id2'],
  useSelectMenu: true,
  jumpModal: true,
  timeout: 120_000,          // inactividad (0 = nunca)
  maxDuration: 10 * 60_000,  // tope absoluto
  loop: true,
  ephemeral: true,
  autoFooter: true,          // "Página X de Y"
  endBehavior: 'disable',    // 'disable' | 'delete' | 'clear'
  preset: 'compact',
  theme: 'arrows',
  searchable: true,
  numberedButtons: true,
  autoTitle: true,
  confirmStop: true,
  buttonOrder: ['previous', 'pageIndicator', 'next', 'stop', 'search'],
});

await paginator.start(interaction);
```

## Eventos y control

```javascript
paginator.on('pageChange', ({ page, total }) => {
  console.log(`Página ${page + 1}/${total}`);
});

paginator.on('end', (reason) => {
  console.log('Terminó:', reason);
});

await paginator.goToPage(2);
await paginator.next();
await paginator.first();
await paginator.addEmbeds([{ title: 'Extra', description: 'Añadida después' }]);
paginator.setLocale('en');
await paginator.stop();
```

`page` es **desde 0**. Para mostrarlo usa `page + 1`.

## Métodos

| Método | Qué hace |
|--------|----------|
| `start(target)` / `attach(message)` | Envía o edita un mensaje existente |
| `stop()` | Termina y aplica `endBehavior` |
| `pause()` / `resume()` | Congela o reactiva los botones |
| `home()` / `random()` / `back()` | Inicio, aleatorio, historial |
| `shufflePages()` / `clone()` | Mezcla páginas o duplica el paginador |
| `goToPage(n)` / `first()` / `last()` | Salta de página (desde 0) |
| `next()` / `previous()` | Avanza o retrocede |
| `setEmbeds` / `addEmbeds` / `insertEmbeds` / `removePage` | Cambia páginas en caliente |
| `refresh()` | Vuelve a pintar el mensaje |
| `setAllowedUsers(ids)` | Cambia quién puede pulsar |
| `setLocale('es')` | Cambia el idioma sobre la marcha |
| `getState()` | `{ currentPage, totalPages, locale, active, paused, … }` |

## Notas

- El timeout es de **inactividad** y se reinicia con cada clic válido.
- El select de Discord admite 25 opciones; si hay más páginas se muestra una ventana.
- Un `Paginator` = un `start()`. Crea uno nuevo en cada comando.
- `ephemeral` solo vale en interacciones, no en mensajes de texto.
- Publicación npm: **`@amatiscorp/pagincord`** (acceso público, organización Amatis Corp).

## Licencia

MIT © Amatis Corp
