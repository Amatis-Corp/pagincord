# Pagincord

[![npm version](https://img.shields.io/npm/v/pagincord.svg)](https://www.npmjs.com/package/pagincord)
[![npm downloads](https://img.shields.io/npm/dm/pagincord.svg)](https://www.npmjs.com/package/pagincord)
[![license](https://img.shields.io/npm/l/pagincord.svg)](https://github.com/yourusername/pagincord/blob/main/LICENSE)

A modern, lightweight, and production-ready pagination library for Discord.js v14+ with full TypeScript support.

## Features

✨ **Flexible Input** - Accept EmbedBuilder objects or plain objects to build embeds dynamically  
🔒 **User Restrictions** - Restrict navigation to specific users with ephemeral error messages  
🎮 **Smart Buttons** - Auto-disable First/Previous on page 1 and Next/Last on final page  
📋 **Optional Select Menu** - Include a dropdown for direct page jumping  
⏱️ **Timeout Management** - Configurable idle timeout with graceful cleanup  
💾 **Memory Safe** - Proper collector cleanup to prevent memory leaks  
📦 **Zero Dependencies** - Only requires discord.js as a peer dependency  
🎯 **TypeScript First** - Full type definitions included

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

## Quick Start

### JavaScript (CommonJS)

```javascript
const { Paginator } = require('pagincord');
const { EmbedBuilder } = require('discord.js');

// In your command handler
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'pages') {
    const embeds = [
      new EmbedBuilder()
        .setTitle('Page 1')
        .setDescription('This is the first page')
        .setColor(0x00ff00),
      new EmbedBuilder()
        .setTitle('Page 2')
        .setDescription('This is the second page')
        .setColor(0x0000ff),
      new EmbedBuilder()
        .setTitle('Page 3')
        .setDescription('This is the third page')
        .setColor(0xff0000),
    ];

    const paginator = new Paginator({
      embeds: embeds,
      authorId: interaction.user.id,
      timeout: 60000,
    });

    await paginator.start(interaction);
  }
});
```

### TypeScript (ESM)

```typescript
import { Paginator, PaginationOptions, EmbedData } from 'pagincord';
import { EmbedBuilder, CommandInteraction } from 'discord.js';

async function handlePaginationCommand(interaction: CommandInteraction) {
  const embeds: EmbedBuilder[] = [
    new EmbedBuilder()
      .setTitle('Page 1')
      .setDescription('This is the first page')
      .setColor(0x00ff00),
    new EmbedBuilder()
      .setTitle('Page 2')
      .setDescription('This is the second page')
      .setColor(0x0000ff),
    new EmbedBuilder()
      .setTitle('Page 3')
      .setDescription('This is the third page')
      .setColor(0xff0000),
  ];

  const paginator = new Paginator({
    embeds,
    authorId: interaction.user.id,
    timeout: 60000,
  });

  await paginator.start(interaction);
}
```

## Usage Examples

### Using Plain Objects (Dynamic Embed Building)

```javascript
const { Paginator } = require('pagincord');

const embedData = [
  {
    title: 'Welcome Page',
    description: 'Welcome to our server!',
    color: 0x00ff00,
    thumbnail: 'https://example.com/image1.png',
    fields: [
      { name: 'Field 1', value: 'Value 1', inline: true },
      { name: 'Field 2', value: 'Value 2', inline: true },
    ],
    footer: { text: 'Page 1' },
    timestamp: true,
  },
  {
    title: 'Rules Page',
    description: 'Please follow these rules',
    color: 0xff0000,
    fields: [
      { name: 'Rule 1', value: 'Be respectful' },
      { name: 'Rule 2', value: 'No spam' },
    ],
    footer: { text: 'Page 2' },
  },
  {
    title: 'Info Page',
    description: 'Additional information',
    color: 0x0000ff,
    author: {
      name: 'Bot Name',
      iconURL: 'https://example.com/bot-icon.png',
    },
    footer: { text: 'Page 3' },
  },
];

const paginator = new Paginator({
  embeds: embedData,
  authorId: interaction.user.id,
});

await paginator.start(interaction);
```

### With Select Menu for Page Jumping

```javascript
const paginator = new Paginator({
  embeds: myEmbeds,
  authorId: interaction.user.id,
  useSelectMenu: true, // Enable select menu
  timeout: 120000, // 2 minutes
});

await paginator.start(interaction);
```

### Using with Regular Messages (Non-Interaction)

```javascript
client.on('messageCreate', async (message) => {
  if (message.content === '!pages') {
    const embeds = [
      new EmbedBuilder().setTitle('Page 1').setColor(0x00ff00),
      new EmbedBuilder().setTitle('Page 2').setColor(0x0000ff),
    ];

    const paginator = new Paginator({
      embeds,
      authorId: message.author.id,
    });

    await paginator.start(message);
  }
});
```

### Custom Button Emojis

```javascript
const paginator = new Paginator({
  embeds: myEmbeds,
  authorId: interaction.user.id,
  buttonEmojis: {
    first: '⏪',
    previous: '⬅️',
    next: '➡️',
    last: '⏩',
    stop: '❌',
  },
});

await paginator.start(interaction);
```

### Delete Message on Stop

```javascript
const paginator = new Paginator({
  embeds: myEmbeds,
  authorId: interaction.user.id,
  deleteOnStop: true, // Delete message when stop button is pressed
});

await paginator.start(interaction);
```

### Start on a Specific Page

```javascript
const paginator = new Paginator({
  embeds: myEmbeds,
  startPage: 2, // Start on page 3 (0-indexed)
});

await paginator.start(interaction);
```

### Without User Restriction (Public Pagination)

```javascript
const paginator = new Paginator({
  embeds: myEmbeds,
  // No authorId = anyone can control pagination
  timeout: 300000, // 5 minutes
});

await paginator.start(interaction);
```

### Manual Stop

```javascript
const paginator = new Paginator({
  embeds: myEmbeds,
  authorId: interaction.user.id,
});

const message = await paginator.start(interaction);

// Stop pagination after 30 seconds
setTimeout(() => {
  paginator.stop();
}, 30000);
```

## API Reference

### `Paginator`

Main pagination class.

#### Constructor Options

```typescript
interface PaginationOptions {
  embeds: EmbedBuilder[] | EmbedData[];
  authorId?: string;
  useSelectMenu?: boolean;
  timeout?: number;
  buttonEmojis?: {
    first?: string;
    previous?: string;
    next?: string;
    last?: string;
    stop?: string;
  };
  deleteOnStop?: boolean;
  startPage?: number;
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `embeds` | `EmbedBuilder[]` or `EmbedData[]` | **Required** | Array of embeds to paginate |
| `authorId` | `string` | `undefined` | User ID who can control pagination |
| `useSelectMenu` | `boolean` | `false` | Include select menu for page jumping |
| `timeout` | `number` | `60000` | Idle timeout in milliseconds |
| `buttonEmojis` | `object` | Default emojis | Custom button emojis |
| `deleteOnStop` | `boolean` | `false` | Delete message when stopped |
| `startPage` | `number` | `0` | Starting page index (0-based) |

#### Methods

##### `start(target: Message | CommandInteraction | InteractionResponse): Promise<Message>`

Start pagination on a message or interaction.

##### `stop(): Promise<void>`

Manually stop pagination and clean up collectors.

##### `getTotalPages(): number`

Get the total number of pages.

##### `getCurrentPage(): number`

Get the current page index (0-based).

### `EmbedData`

Interface for dynamically building embeds.

```typescript
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

## Button Behavior

- **First** (⏮️): Jump to first page (disabled on page 1)
- **Previous** (◀️): Go to previous page (disabled on page 1)
- **Stop** (🗑️): End pagination (always enabled)
- **Next** (▶️): Go to next page (disabled on last page)
- **Last** (⏭️): Jump to last page (disabled on last page)

All buttons are automatically disabled when there's only one page.

## User Restriction

When `authorId` is set, only that user can control the pagination. Other users clicking buttons will receive:

> "You are not allowed to control this pagination."

This message is sent as an ephemeral reply (only visible to the user who clicked).

## Memory Management

Pagincord automatically:
- Cleans up collectors when pagination ends
- Clears timeouts to prevent memory leaks
- Disables or removes components after timeout
- Stops all active collectors on manual stop

## TypeScript Support

Pagincord is written in TypeScript and includes full type definitions. All types are exported for your convenience:

```typescript
import {
  Paginator,
  PaginationOptions,
  EmbedData,
  PaginationTarget,
  PaginationInteraction,
  PaginationState,
} from 'pagincord';
```

## Requirements

- Node.js 16.11.0 or higher
- Discord.js v14.0.0 or higher

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.
#   p a g i n c o r d  
 #   p a g i n c o r d  
 