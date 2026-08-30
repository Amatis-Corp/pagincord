/**
 * TypeScript usage — type-safe Pagincord
 */

import {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ChatInputCommandInteraction,
} from 'discord.js';
import {
  Paginator,
  paginate,
  createPages,
  type PaginationOptions,
  type EmbedData,
} from 'pagincord';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user?.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'help') {
    await sendHelp(interaction);
  }

  if (interaction.commandName === 'leaderboard') {
    await sendLeaderboard(interaction);
  }
});

async function sendHelp(interaction: ChatInputCommandInteraction) {
  const pages: EmbedData[] = [
    {
      title: 'Help — 1',
      description: 'Welcome to the help menu.',
      color: 0x5865f2,
      fields: [
        { name: 'Command', value: '`/help`', inline: true },
        { name: 'Description', value: 'Shows this menu', inline: true },
      ],
    },
    {
      title: 'Help — 2',
      description: 'Available commands',
      color: 0x57f287,
      fields: [
        { name: '`/ping`', value: 'Check bot latency' },
        { name: '`/info`', value: 'Get bot information' },
      ],
    },
  ];

  const options: PaginationOptions = {
    embeds: pages,
    authorId: interaction.user.id,
    useSelectMenu: true,
    jumpModal: true,
    timeout: 120_000,
    autoFooter: { format: 'Page {page} of {total}', append: false },
  };

  const paginator = new Paginator(options);
  await paginator.start(interaction);
}

async function sendLeaderboard(interaction: ChatInputCommandInteraction) {
  const users = [
    { name: 'User1', score: 1000 },
    { name: 'User2', score: 950 },
    { name: 'User3', score: 900 },
    { name: 'User4', score: 850 },
  ];

  const pages = createPages({
    items: users,
    itemsPerPage: 2,
    mapItem: (user, index) => `**${index + 1}.** ${user.name} — ${user.score} points`,
    embed: { title: '🏆 Leaderboard', color: 0xffd700 },
  });

  await paginate(interaction, {
    embeds: pages,
    authorId: interaction.user.id,
    timeout: 180_000,
  });
}

// client.login('YOUR_BOT_TOKEN');
