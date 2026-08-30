/**
 * Basic usage — @amatiscorp/pagincord
 */

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { Paginator, paginate, createPages, configure } = require('@amatiscorp/pagincord');

configure({ locale: 'en', timeout: 60_000 });

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
        new EmbedBuilder().setTitle('Page 1').setDescription('Welcome').setColor(0x00ff00),
        new EmbedBuilder().setTitle('Page 2').setDescription('Features').setColor(0x0000ff),
        new EmbedBuilder().setTitle('Page 3').setDescription('Done').setColor(0xff0000),
      ],
      authorId: interaction.user.id,
      locale: 'en',
    });

    await paginator.start(interaction);
  }

  if (interaction.commandName === 'paginas') {
    await paginate(interaction, {
      embeds: [
        { title: 'Página 1', description: 'Bienvenido', color: 0x5865f2 },
        { title: 'Página 2', description: 'Comandos', color: 0x57f287 },
      ],
      authorId: interaction.user.id,
      locale: 'es',
      showButtonLabels: true,
      preset: 'compact',
      jumpModal: true,
    });
  }

  if (interaction.commandName === 'leaderboard') {
    const pages = createPages({
      items: [
        { name: 'Alex', score: 1200 },
        { name: 'Sam', score: 980 },
        { name: 'Riley', score: 875 },
      ],
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
});

// client.login('YOUR_BOT_TOKEN');
