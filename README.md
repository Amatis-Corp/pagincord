<div align="center">

# Pagincord

**Smart embed pagination for Discord.js v14+**

Buttons · Select menus · Jump-to-page modal · Events · List helpers · TypeScript

[![npm version](https://img.shields.io/npm/v/pagincord.svg?style=flat-square)](https://www.npmjs.com/package/pagincord)
[![npm downloads](https://img.shields.io/npm/dm/pagincord.svg?style=flat-square)](https://www.npmjs.com/package/pagincord)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg?style=flat-square)](https://www.typescriptlang.org/)

[Installation](#installation) · [Quick start](#quick-start) · [Examples](#examples) · [API](#api-reference) · [Español](#español)

</div>

---

Pagincord turns an array of embeds into an interactive Discord message: first / previous / next / last / stop, an optional select menu, an optional “jump to page” modal, idle timeout, and user locks. It works with slash commands, component interactions, and regular messages.

**Requires:** Node.js 16.11+ and `discord.js` v14+.

---

## Installation

```bash
npm install pagincord discord.js
```

```bash
yarn add pagincord discord.js
```

```bash
pnpm add pagincord discord.js
```

`discord.js` is a peer dependency. You must install it in your bot.

---

## Quick start

### Slash command (JavaScript)

```javascript
const { Paginator } = require('pagincord');
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
    timeout: 60_000,
  });

  await paginator.start(interaction);
});
```

### One-liner with `paginate()`

```javascript
const { paginate } = require('pagincord');

await paginate(interaction, {
  embeds: pages,
  authorId: interaction.user.id,
});
```

### TypeScript

```typescript
import { Paginator, paginate, createPages, type EmbedData } from 'pagincord';
import { EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';

async function help(interaction: ChatInputCommandInteraction) {
  const pages: EmbedData[] = [
    { title: 'Welcome', description: 'Page one', color: 0x5865f2 },
    { title: 'Commands', description: 'Page two', color: 0x57f287 },
  ];

  await paginate(interaction, {
    embeds: pages,
    authorId: interaction.user.id,
    useSelectMenu: true,
  });
}
```

### Prefix / message command

```javascript
client.on('messageCreate', async (message) => {
  if (message.content !== '!pages') return;

  const { Paginator } = require('pagincord');
  const { EmbedBuilder } = require('discord.js');

  const paginator = new Paginator({
    embeds: [
      new EmbedBuilder().setTitle('Page 1').setColor(0x00ff00),
      new EmbedBuilder().setTitle('Page 2').setColor(0x0000ff),
    ],
    authorId: message.author.id,
  });

  await paginator.start(message);
});
```

---

## Features

- **EmbedBuilder or plain objects** — mix both in the same array
- **User lock** — `authorId`, `allowedUsers`, or a custom `filter`
- **Smart buttons** — First / Previous / Next / Last auto-disable at the edges
- **Page indicator** — `1 / 5` button; optionally opens a jump-to-page modal
- **Select menu** — jump to a page by title (handles more than 25 pages)
- **Loop** — wrap from last page back to the first
- **Idle timeout** — resets on every click; `timeout: 0` means never expire
- **End behavior** — disable buttons, remove them, or delete the message
- **Events** — `pageChange`, `end`, `collect`, `unauthorized`, `error`
- **Helpers** — `chunk()`, `createPages()`, `paginate()`
- **Unique custom IDs** — several paginators can live in the same channel
- **Zero runtime dependencies** — only `discord.js` as a peer dependency

---

## Examples

### 1. Plain objects (no EmbedBuilder)

```javascript
const { Paginator } = require('pagincord');

const paginator = new Paginator({
  embeds: [
    {
      title: 'Welcome',
      description: 'Thanks for joining.',
      color: 0x00ff00,
      thumbnail: 'https://example.com/logo.png',
      fields: [
        { name: 'Members', value: '1,204', inline: true },
        { name: 'Online', value: '86', inline: true },
      ],
      footer: { text: 'Server info' },
      timestamp: true,
    },
    {
      title: 'Rules',
      description: 'Be respectful. No spam.',
      color: 0xff0000,
      author: { name: 'Moderation team' },
    },
  ],
  authorId: interaction.user.id,
});

await paginator.start(interaction);
```

### 2. Paginate any list with `createPages()`

This is the usual pattern for leaderboards, queues, shop items, search results, etc.

```javascript
const { paginate, createPages } = require('pagincord');

const users = [
  { name: 'Alex', score: 1200 },
  { name: 'Sam', score: 980 },
  { name: 'Riley', score: 875 },
  // ...
];

const pages = createPages({
  items: users,
  itemsPerPage: 5,
  mapItem: (user, i) => `**${i + 1}.** ${user.name} — **${user.score}** pts`,
  embed: {
    title: '🏆 Leaderboard',
    color: 0xffd700,
  },
});

await paginate(interaction, {
  embeds: pages,
  authorId: interaction.user.id,
  useSelectMenu: true,
});
```

`mapPage` gives you the whole slice if you need a custom layout:

```javascript
const pages = createPages({
  items: products,
  itemsPerPage: 3,
  mapPage: (items) => items.map((p) => `**${p.name}**\n${p.price} coins`).join('\n\n'),
  embed: { title: 'Shop', color: 0x3498db },
});
```

### 3. Select menu + jump-to-page modal

```javascript
const paginator = new Paginator({
  embeds: myEmbeds,
  authorId: interaction.user.id,
  useSelectMenu: true,
  jumpModal: true, // page-indicator button opens a modal
  timeout: 120_000,
});

await paginator.start(interaction);
```

Custom modal copy:

```javascript
jumpModal: {
  title: 'Jump to page',
  label: 'Page number',
  placeholder: 'e.g. 4',
}
```

### 4. Loop, labels, and which buttons to show

```javascript
const paginator = new Paginator({
  embeds: myEmbeds,
  authorId: interaction.user.id,
  loop: true,
  buttons: {
    first: false,
    last: false,
    previous: true,
    next: true,
    stop: true,
    pageIndicator: true,
  },
  buttonLabels: {
    previous: 'Back',
    next: 'Next',
    stop: 'Close',
  },
  buttonEmojis: {
    previous: '⬅️',
    next: '➡️',
    stop: '❌',
  },
});
```

### 5. Public pagination (anyone can click)

Omit `authorId`. Use `allowedUsers` if several people should share control.

```javascript
const paginator = new Paginator({
  embeds: myEmbeds,
  allowedUsers: [interaction.user.id, '123456789012345678'],
  timeout: 5 * 60_000,
  unauthorizedMessage: 'Only the command author and the co-host can change pages.',
});
```

Custom filter (for example: members with a role):

```javascript
const paginator = new Paginator({
  embeds: myEmbeds,
  filter: (i) => i.member?.roles.cache.has(modRoleId),
  unauthorizedMessage: (user) => `${user}, this menu is for moderators.`,
});
```

### 6. Auto footer, content, and ephemeral reply

```javascript
const paginator = new Paginator({
  embeds: myEmbeds,
  authorId: interaction.user.id,
  ephemeral: true,
  autoFooter: { format: 'Page {page} / {total}', append: true },
  content: ({ page, total }) => `Viewing **${page + 1}** of **${total}**`,
  endBehavior: 'clear', // remove buttons when it expires
});
```

`page` in callbacks is **0-based**. Display it as `page + 1`.

### 7. Events

```javascript
const paginator = new Paginator({
  embeds: myEmbeds,
  authorId: interaction.user.id,
  onPageChange: async ({ page, total }) => {
    console.log(`Now on page ${page + 1}/${total}`);
  },
  onEnd: (reason) => {
    console.log('Ended because:', reason); // timeout | stop | manual | idle | messageDelete
  },
});

paginator.on('collect', (i) => {
  console.log(`${i.user.tag} clicked ${i.customId}`);
});

paginator.on('unauthorized', (i) => {
  console.log(`${i.user.tag} was blocked`);
});

await paginator.start(interaction);
```

### 8. Programmatic control

```javascript
const paginator = new Paginator({ embeds: myEmbeds, authorId: interaction.user.id });
await paginator.start(interaction);

console.log(paginator.getCurrentPage(), paginator.getTotalPages(), paginator.isActive());

await paginator.goToPage(2);
await paginator.next();
await paginator.previous();

await paginator.addEmbeds([{ title: 'Extra page', description: 'Appended later' }]);
await paginator.setEmbeds(newPages);

setTimeout(() => paginator.stop(), 30_000);
```

### 9. `chunk()` for raw arrays

```javascript
const { chunk } = require('pagincord');

const groups = chunk(allItems, 10);
const embeds = groups.map((group, i) => ({
  title: `Results ${i + 1}`,
  description: group.join('\n'),
}));
```

### 10. Reply mode on interactions

By default Pagincord uses `editReply` if the interaction is already deferred/replied, otherwise `reply`.

```javascript
await interaction.deferReply();
await paginate(interaction, { embeds }); // editReply

// Replace the message that contained the button:
await paginate(buttonInteraction, { embeds, replyAs: 'update' });

// Always send a new follow-up:
await paginate(interaction, { embeds, replyAs: 'followUp' });
```

### 11. Deferred slash command

```javascript
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand() || interaction.commandName !== 'queue') return;

  await interaction.deferReply();
  const tracks = await fetchQueue(); // slow I/O

  const pages = createPages({
    items: tracks,
    itemsPerPage: 8,
    mapItem: (t, i) => `\`${i + 1}.\` ${t.title} — ${t.duration}`,
    embed: { title: 'Music queue', color: 0x1db954 },
  });

  await paginate(interaction, { embeds: pages, authorId: interaction.user.id });
});
```

---

## API reference

### `new Paginator(options)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `embeds` | `(EmbedBuilder \| EmbedData)[]` | **required** | Pages to display |
| `authorId` | `string` | — | Only this user can click |
| `allowedUsers` | `string[]` | `[]` | Extra user IDs (merged with `authorId`) |
| `filter` | `(interaction) => boolean` | — | Return `false` to reject a click |
| `useSelectMenu` | `boolean` | `false` | Dropdown to jump to a page |
| `selectPlaceholder` | `string \| (page, total) => string` | `"Page X of Y"` | Select menu placeholder |
| `timeout` | `number` | `60000` | Idle timeout in ms. `0` = never |
| `buttonEmojis` | `object` | `⏮️ ◀️ ▶️ ⏭️ 🗑️` | Custom emojis |
| `buttonLabels` | `object` | — | Optional text on buttons |
| `buttonStyles` | `object` | Primary / Danger | discord.js `ButtonStyle` |
| `buttons` | `object` | all nav + stop | Toggle `first`, `previous`, `next`, `last`, `stop`, `pageIndicator` |
| `jumpModal` | `boolean \| object` | `false` | Click the page indicator to type a page number |
| `deleteOnStop` | `boolean` | `false` | Alias for `endBehavior: 'delete'` |
| `endBehavior` | `'disable' \| 'delete' \| 'clear'` | `'disable'` | What happens when pagination ends |
| `startPage` | `number` | `0` | Initial page (0-based) |
| `loop` | `boolean` | `false` | Wrap around at the edges |
| `ephemeral` | `boolean` | `false` | Ephemeral reply (interactions only) |
| `content` | `string \| (ctx) => string` | — | Message text above the embed |
| `autoFooter` | `boolean \| { format, append }` | `false` | Write `Page X of Y` on the footer |
| `unauthorizedMessage` | `string \| (user) => string` | English default | Ephemeral reject message |
| `hideButtonsIfSinglePage` | `boolean` | `false` | Hide controls when there is one page |
| `replyAs` | `'reply' \| 'editReply' \| 'followUp' \| 'update'` | auto | How to send on an interaction |
| `onPageChange` | `(ctx) => void` | — | After the page changes |
| `onEnd` | `(reason) => void` | — | When pagination ends |
| `onCollect` | `(interaction) => void` | — | After an authorized click |

`jumpModal` object: `{ title?, label?, placeholder? }`.

`autoFooter` object: `{ format?: 'Page {page} of {total}', append?: boolean }`.

### Methods

```ts
await paginator.start(target)      // Message | CommandInteraction | MessageComponentInteraction
await paginator.stop()
await paginator.goToPage(index)    // 0-based
await paginator.next()
await paginator.previous()
await paginator.setEmbeds(embeds)
await paginator.addEmbeds(embeds)

paginator.getTotalPages()          // number
paginator.getCurrentPage()         // number (0-based)
paginator.getMessage()             // Message | undefined
paginator.isActive()               // boolean
paginator.getState()               // { currentPage, totalPages, authorId, ended, loop }
```

### `paginate(target, options)`

Same as `new Paginator(options)` + `start(target)`. Returns the `Paginator` instance.

### `createPages(options)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `items` | `T[]` | **required** | Data to split |
| `itemsPerPage` | `number` | `10` | Items on each embed |
| `mapItem` | `(item, index, ctx) => string` | `String(item)` | One line per item |
| `mapPage` | `(items, ctx) => string` | — | Custom page body (wins over `mapItem`) |
| `separator` | `string` | `"\n"` | Joiner for `mapItem` |
| `embed` | `EmbedData \| (ctx) => EmbedData` | `{}` | Base embed. Description is kept; the list is appended |
| `emptyText` | `string` | `"No items to display."` | Used when `items` is empty |
| `pageFooter` | `boolean` | `true` | Adds `Page X of Y` to the footer |

`ctx.page` is **0-based**. `ctx.total` is the number of pages. `ctx.startIndex` is the global index of the first item on that page.

### `chunk(array, size)`

Returns `T[][]`. Throws if `size` is not a positive number.

### Events

```ts
paginator.on('pageChange', ({ page, total, embed, interaction }) => {});
paginator.on('end', (reason) => {});
paginator.on('collect', (interaction) => {});
paginator.on('unauthorized', (interaction) => {});
paginator.on('error', (error) => {});
```

If you listen to `error`, failed Discord API calls (deleted message, etc.) are forwarded there instead of being swallowed.

### `EmbedData`

```ts
interface EmbedData {
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
```

---

## Button layout

Default row:

`⏮️ First` · `◀️ Previous` · `🗑️ Stop` · `▶️ Next` · `⏭️ Last`

- First / Previous disable on page 1 (unless `loop`)
- Next / Last disable on the last page (unless `loop`)
- All navigation disables when there is only one page
- Enable `pageIndicator` (or `jumpModal`) to insert a `1 / 5` button
- Discord allows 5 buttons per row; extra buttons wrap to a second row
- Custom IDs are unique per instance (`pgc:<id>:next`), so two paginators never clash

---

## Notes

- **Idle timeout** uses the collector `idle` option: the timer resets on every authorized click.
- **Select menus** are limited to 25 options by Discord. Pagincord shows a sliding window around the current page when you have more than 25 pages.
- **`start()` once** — create a new `Paginator` for each command invocation. Calling `start()` twice on the same instance throws.
- **Ephemeral** only applies to interaction replies, not to `message.channel.send`.
- Clone safety: incoming `EmbedBuilder`s are copied, so Pagincord does not mutate your originals.

---

## License

MIT

---
---

# Español

Pagincord convierte un array de embeds en un mensaje interactivo de Discord: botones de navegación, menú de selección, modal para saltar de página, timeout por inactividad y bloqueo por usuario. Funciona con slash commands, interacciones de componentes y mensajes normales.

**Requiere:** Node.js 16.11+ y `discord.js` v14+.

## Instalación

```bash
npm install pagincord discord.js
```

`discord.js` es una peer dependency: instálalo también en tu bot.

## Inicio rápido

```javascript
const { Paginator } = require('pagincord');
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
    timeout: 60_000,
  });

  await paginator.start(interaction);
});
```

Atajo:

```javascript
const { paginate } = require('pagincord');

await paginate(interaction, {
  embeds: paginas,
  authorId: interaction.user.id,
});
```

## Paginar una lista (ranking, tienda, cola…)

```javascript
const { paginate, createPages } = require('pagincord');

const paginas = createPages({
  items: usuarios,
  itemsPerPage: 5,
  mapItem: (user, i) => `**${i + 1}.** ${user.name} — **${user.score}** pts`,
  embed: { title: '🏆 Ranking', color: 0xffd700 },
});

await paginate(interaction, {
  embeds: paginas,
  authorId: interaction.user.id,
  useSelectMenu: true,
});
```

## Opciones más usadas

```javascript
const paginator = new Paginator({
  embeds: misEmbeds,
  authorId: interaction.user.id,   // solo este usuario puede pulsar
  allowedUsers: ['id1', 'id2'],    // más usuarios permitidos
  useSelectMenu: true,             // desplegable para saltar de página
  jumpModal: {                     // el indicador 1/5 abre un modal
    title: 'Ir a página',
    label: 'Número de página',
    placeholder: 'Ejemplo: 4',
  },
  timeout: 120_000,                // 2 minutos de inactividad (0 = nunca)
  loop: true,                      // de la última vuelve a la primera
  ephemeral: true,                 // solo lo ve quien ejecutó el comando
  autoFooter: true,                // footer "Page X of Y"
  endBehavior: 'disable',          // 'disable' | 'delete' | 'clear'
  unauthorizedMessage: 'No puedes controlar esta paginación.',
  buttonLabels: {
    previous: 'Atrás',
    next: 'Siguiente',
    stop: 'Cerrar',
  },
});

await paginator.start(interaction);
```

## Eventos y control manual

```javascript
paginator.on('pageChange', ({ page, total }) => {
  console.log(`Ahora en la página ${page + 1}/${total}`);
});

paginator.on('end', (reason) => {
  console.log('Terminó:', reason); // timeout | stop | manual | idle | messageDelete
});

await paginator.goToPage(2); // índice desde 0
await paginator.next();
await paginator.stop();
```

## Comando con defer (consultas lentas)

```javascript
await interaction.deferReply();
const tracks = await obtenerCola();

const paginas = createPages({
  items: tracks,
  itemsPerPage: 8,
  mapItem: (t, i) => `\`${i + 1}.\` ${t.title}`,
  embed: { title: 'Cola de música', color: 0x1db954 },
});

await paginate(interaction, { embeds: paginas, authorId: interaction.user.id });
```

## Métodos

| Método | Descripción |
|--------|-------------|
| `start(target)` | Envía la paginación (mensaje o interacción) |
| `stop()` | Termina y aplica `endBehavior` |
| `goToPage(n)` | Salta a la página `n` (desde 0) |
| `next()` / `previous()` | Avanza o retrocede |
| `setEmbeds()` / `addEmbeds()` | Reemplaza o añade páginas |
| `getCurrentPage()` / `getTotalPages()` | Estado actual |
| `isActive()` | `true` mientras el collector vive |
| `getMessage()` | El `Message` de Discord |

`page` en callbacks es **desde 0**. Para mostrarlo al usuario usa `page + 1`.

## Notas rápidas

- El timeout es de **inactividad**: se reinicia con cada clic válido.
- El select menu de Discord admite 25 opciones. Si hay más páginas, Pagincord muestra una ventana alrededor de la página actual.
- Llama a `start()` **una sola vez** por instancia. Crea un `Paginator` nuevo en cada comando.
- `ephemeral` solo aplica a interacciones, no a mensajes de texto.
- Varios paginadores pueden existir a la vez: cada uno usa custom IDs únicos.

## Licencia

MIT
