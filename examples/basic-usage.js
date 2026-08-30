/**
 * Basic usage — slash commands with Pagincord
 */

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { Paginator, paginate, createPages } = require('pagincord');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'pages') {
    const paginator = new Paginator({
      embeds: [
        new EmbedBuilder()
          .setTitle('Page 1: Welcome')
          .setDescription('Use the buttons below to navigate.')
          .setColor(0x00ff00),
        new EmbedBuilder()
          .setTitle('Page 2: Features')
          .setDescription('Select menus, jump modal, events, and list helpers.')
          .setColor(0x0000ff),
        new EmbedBuilder()
          .setTitle('Page 3: Done')
          .setDescription('That is all for this example.')
          .setColor(0xff0000),
      ],
      authorId: interaction.user.id,
      timeout: 60_000,
    });

    await paginator.start(interaction);
  }

  if (interaction.commandName === 'leaderboard') {
    const users = [
      { name: 'Alex', score: 1200 },
      { name: 'Sam', score: 980 },
      { name: 'Riley', score: 875 },
      { name: 'Jordan', score: 640 },
      { name: 'Casey', score: 410 },
    ];

    const pages = createPages({
      items: users,
      itemsPerPage: 2,
      mapItem: (user, i) => `**${i + 1}.** ${user.name} — **${user.score}** pts`,
      embed: { title: '🏆 Leaderboard', color: 0xffd700 },
    });

    await paginate(interaction, {
      embeds: pages,
      authorId: interaction.user.id,
      useSelectMenu: true,
    });
  }

  if (interaction.commandName === 'pages-public') {
    await paginate(interaction, {
      embeds: [
        new EmbedBuilder().setTitle('Public page 1').setColor(0xffd700),
        new EmbedBuilder().setTitle('Public page 2').setColor(0xff69b4),
      ],
      timeout: 120_000,
    });
  }
});

// client.login('YOUR_BOT_TOKEN');
