/**
 * Basic usage example for pagincord (JavaScript/CommonJS)
 * This is a minimal example showing how to set up pagination
 */

const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { Paginator } = require('pagincord');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'pages') {
    // Example 1: Using EmbedBuilder objects
    const embeds = [
      new EmbedBuilder()
        .setTitle('📚 Page 1: Welcome')
        .setDescription('Welcome to the pagination example!')
        .setColor(0x00ff00)
        .addFields({ name: 'Info', value: 'Use the buttons below to navigate' }),
      
      new EmbedBuilder()
        .setTitle('⚙️ Page 2: Features')
        .setDescription('Check out these amazing features:')
        .setColor(0x0000ff)
        .addFields(
          { name: 'Smart Buttons', value: 'Automatically disabled when needed', inline: true },
          { name: 'User Lock', value: 'Only you can control this', inline: true },
          { name: 'Timeout', value: 'Auto-cleanup after 60s', inline: true }
        ),
      
      new EmbedBuilder()
        .setTitle('🎉 Page 3: Get Started')
        .setDescription('Start using pagincord in your projects!')
        .setColor(0xff0000)
        .addFields({ name: 'GitHub', value: 'Check out the repository' })
        .setFooter({ text: 'Made with ❤️' })
        .setTimestamp(),
    ];

    const paginator = new Paginator({
      embeds: embeds,
      authorId: interaction.user.id, // Only this user can control
      timeout: 60000, // 60 seconds
      useSelectMenu: false, // Set to true to add page selector
    });

    await paginator.start(interaction);
  }

  if (interaction.commandName === 'pages-dynamic') {
    // Example 2: Using plain objects (dynamic embed building)
    const pages = [
      {
        title: '🌟 Dynamic Page 1',
        description: 'This embed was built from a plain object!',
        color: 0xff6b6b,
        thumbnail: 'https://i.imgur.com/AfFp7pu.png',
        fields: [
          { name: 'Flexible', value: 'No need to create EmbedBuilder instances' },
        ],
      },
      {
        title: '🚀 Dynamic Page 2',
        description: 'Just pass an array of objects',
        color: 0x4ecdc4,
        fields: [
          { name: 'Easy', value: 'Simple object syntax', inline: true },
          { name: 'Clean', value: 'Less boilerplate', inline: true },
        ],
        footer: { text: 'Pagincord handles the rest!' },
      },
      {
        title: '✨ Dynamic Page 3',
        description: 'Mix and match as needed',
        color: 0xffe66d,
        image: 'https://i.imgur.com/AfFp7pu.png',
        timestamp: true,
      },
    ];

    const paginator = new Paginator({
      embeds: pages,
      authorId: interaction.user.id,
      useSelectMenu: true, // Enable select menu for this example
      deleteOnStop: false,
    });

    await paginator.start(interaction);
  }

  if (interaction.commandName === 'pages-public') {
    // Example 3: Public pagination (anyone can control)
    const embeds = [
      new EmbedBuilder()
        .setTitle('Public Page 1')
        .setDescription('Anyone can control this pagination')
        .setColor(0xffd700),
      new EmbedBuilder()
        .setTitle('Public Page 2')
        .setDescription('No authorId restriction')
        .setColor(0xff69b4),
    ];

    const paginator = new Paginator({
      embeds: embeds,
      // No authorId = public pagination
      timeout: 120000, // 2 minutes
    });

    await paginator.start(interaction);
  }
});

// Login with your bot token
// client.login('YOUR_BOT_TOKEN');

// Note: Don't forget to register these slash commands first:
// /pages - Basic pagination example
// /pages-dynamic - Dynamic embed building example
// /pages-public - Public pagination example
