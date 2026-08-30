/**
 * Advanced usage — locales, presets, helpers, events
 */

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const {
  Paginator,
  paginate,
  createPages,
  createTextPages,
  createFieldPages,
  splitText,
  configure,
} = require('@amatiscorp/pagincord');

configure({
  locale: 'es',
  showButtonLabels: true,
  timeout: 120_000,
  autoFooter: true,
});

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'rules') {
    const pages = createTextPages(longRulesText, {
      title: (page, total) => `Server rules (${page}/${total})`,
      color: 0xe74c3c,
      locale: 'en',
    });

    await paginate(interaction, {
      embeds: pages,
      authorId: interaction.user.id,
      locale: 'en',
      preset: 'compact',
      jumpModal: true,
    });
  }

  if (interaction.commandName === 'shop') {
    const fields = [
      { name: 'Sword', value: '120 coins', inline: true },
      { name: 'Shield', value: '90 coins', inline: true },
      { name: 'Potion', value: '25 coins', inline: true },
      { name: 'Bow', value: '150 coins', inline: true },
    ];

    await paginate(interaction, {
      embeds: createFieldPages(fields, {
        fieldsPerPage: 2,
        embed: { title: 'Shop', color: 0x3498db },
        locale: 'en',
      }),
      authorId: interaction.user.id,
      preset: 'select',
    });
  }

  if (interaction.commandName === 'manual') {
    const paginator = new Paginator({
      embeds: [
        new EmbedBuilder().setTitle('Red').setColor(0xff0000),
        new EmbedBuilder().setTitle('Green').setColor(0x00ff00),
      ],
      authorId: interaction.user.id,
      locale: 'es',
      texts: { unauthorized: 'Solo el autor del comando puede usar esto.' },
      onEnd: (reason) => console.log('Ended:', reason),
    });

    await paginator.start(interaction);
    paginator.on('pageChange', ({ page, total }) => {
      console.log(`${page + 1}/${total}`);
    });
  }
});

client.once('ready', () => console.log('Ready'));

const longRulesText = splitText(
  'Be respectful.\n\nNo spam.\n\nFollow Discord TOS.',
  4000
).join('\n\n');

// client.login('YOUR_BOT_TOKEN');
