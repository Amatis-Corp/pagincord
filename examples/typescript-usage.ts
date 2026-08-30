/**
 * TypeScript usage example for pagincord
 * This example shows type-safe usage with full IntelliSense support
 */

import {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  CommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';
import { Paginator, PaginationOptions, EmbedData } from 'pagincord';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user?.tag}`);
});

client.on('interactionCreate', async (interaction: CommandInteraction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'help') {
    // Type-safe embed data
    const embedPages: EmbedData[] = [
      {
        title: '📖 Help Menu - Page 1',
        description: 'Welcome to the help menu!',
        color: 0x5865f2,
        fields: [
          { name: 'Command', value: '`/help`', inline: true },
          { name: 'Description', value: 'Shows this menu', inline: true },
        ],
        footer: { text: 'Page 1 of 3' },
        timestamp: true,
      },
      {
        title: '📖 Help Menu - Page 2',
        description: 'Available commands',
        color: 0x57f287,
        fields: [
          { name: '`/ping`', value: 'Check bot latency' },
          { name: '`/info`', value: 'Get bot information' },
          { name: '`/stats`', value: 'View statistics' },
        ],
        footer: { text: 'Page 2 of 3' },
      },
      {
        title: '📖 Help Menu - Page 3',
        description: 'Need more help?',
        color: 0xfee75c,
        fields: [
          { name: 'Support Server', value: '[Join here](https://discord.gg/example)' },
          { name: 'Documentation', value: '[Read docs](https://example.com/docs)' },
        ],
        footer: { text: 'Page 3 of 3' },
      },
    ];

    // Type-safe pagination options
    const options: PaginationOptions = {
      embeds: embedPages,
      authorId: interaction.user.id,
      useSelectMenu: true,
      timeout: 120000, // 2 minutes
      buttonEmojis: {
        first: '⏪',
        previous: '⬅️',
        next: '➡️',
        last: '⏩',
        stop: '❌',
      },
    };

    const paginator = new Paginator(options);
    await paginator.start(interaction);

    // Access paginator methods with full type safety
    console.log(`Total pages: ${paginator.getTotalPages()}`);
    console.log(`Current page: ${paginator.getCurrentPage()}`);
  }

  if (interaction.commandName === 'leaderboard') {
    // Example with EmbedBuilder
    const users = [
      { name: 'User1', score: 1000 },
      { name: 'User2', score: 950 },
      { name: 'User3', score: 900 },
      { name: 'User4', score: 850 },
      { name: 'User5', score: 800 },
      { name: 'User6', score: 750 },
    ];

    // Split users into pages of 2 users each
    const embeds: EmbedBuilder[] = [];
    const usersPerPage = 2;

    for (let i = 0; i < users.length; i += usersPerPage) {
      const pageUsers = users.slice(i, i + usersPerPage);
      const embed = new EmbedBuilder()
        .setTitle('🏆 Leaderboard')
        .setColor(0xffd700)
        .setDescription(
          pageUsers
            .map((user, idx) => `**${i + idx + 1}.** ${user.name} - ${user.score} points`)
            .join('\n')
        )
        .setFooter({ text: `Page ${Math.floor(i / usersPerPage) + 1} of ${Math.ceil(users.length / usersPerPage)}` });

      embeds.push(embed);
    }

    const paginator = new Paginator({
      embeds,
      authorId: interaction.user.id,
      timeout: 180000, // 3 minutes
      deleteOnStop: false,
    });

    await paginator.start(interaction);
  }
});

// Type-safe configuration
interface BotConfig {
  token: string;
  guildId: string;
}

// const config: BotConfig = {
//   token: 'YOUR_BOT_TOKEN',
//   guildId: 'YOUR_GUILD_ID',
// };

// client.login(config.token);
