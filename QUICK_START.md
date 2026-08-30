# Quick Start Guide

Get started with Pagincord in under 5 minutes!

## Installation

```bash
npm install pagincord discord.js
```

## Minimal Example

```javascript
const { Paginator } = require('pagincord');
const { EmbedBuilder } = require('discord.js');

// Create your embeds
const embeds = [
  new EmbedBuilder().setTitle('Page 1').setColor(0x00ff00),
  new EmbedBuilder().setTitle('Page 2').setColor(0x0000ff),
  new EmbedBuilder().setTitle('Page 3').setColor(0xff0000),
];

// In your command handler
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  
  if (interaction.commandName === 'pages') {
    const paginator = new Paginator({
      embeds: embeds,
      authorId: interaction.user.id,
    });
    
    await paginator.start(interaction);
  }
});
```

That's it! 🎉

## Common Options

```javascript
const paginator = new Paginator({
  embeds: myEmbeds,              // Required: Array of embeds
  authorId: userId,              // Optional: Lock to specific user
  useSelectMenu: true,           // Optional: Add page dropdown
  timeout: 60000,                // Optional: Idle timeout (ms)
  deleteOnStop: false,           // Optional: Delete vs disable
  startPage: 0,                  // Optional: Starting page index
  buttonEmojis: {                // Optional: Custom emojis
    first: '⏮️',
    previous: '◀️',
    next: '▶️',
    last: '⏭️',
    stop: '🗑️',
  },
});
```

## Using Plain Objects

```javascript
const pages = [
  {
    title: 'My Page',
    description: 'Page content',
    color: 0x00ff00,
    fields: [
      { name: 'Field', value: 'Value' }
    ],
  },
];

const paginator = new Paginator({ embeds: pages });
await paginator.start(interaction);
```

## Next Steps

- Check out `examples/basic-usage.js` for more examples
- Read `README.md` for full API documentation
- See `examples/advanced-usage.js` for complex scenarios

## Need Help?

- [Full Documentation](README.md)
- [Examples](examples/)
- [TypeScript Usage](examples/typescript-usage.ts)
