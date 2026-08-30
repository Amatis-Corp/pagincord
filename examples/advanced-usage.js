/**
 * Advanced usage examples for pagincord
 * Demonstrates more complex scenarios and features
 */

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { Paginator } = require('pagincord');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // Example 1: Dynamic content generation
  if (interaction.commandName === 'generate') {
    const count = interaction.options.getInteger('pages') || 5;
    
    // Generate embeds dynamically
    const embeds = Array.from({ length: count }, (_, i) => ({
      title: `Generated Page ${i + 1}`,
      description: `This is page ${i + 1} of ${count}`,
      color: Math.floor(Math.random() * 0xffffff),
      fields: [
        { name: 'Page Number', value: `${i + 1}`, inline: true },
        { name: 'Total Pages', value: `${count}`, inline: true },
        { name: 'Random Value', value: `${Math.random().toFixed(4)}`, inline: true },
      ],
      footer: { text: `Generated on ${new Date().toLocaleString()}` },
      timestamp: true,
    }));

    const paginator = new Paginator({
      embeds,
      authorId: interaction.user.id,
      useSelectMenu: true,
      timeout: 300000, // 5 minutes
    });

    await paginator.start(interaction);
  }

  // Example 2: Starting on a specific page
  if (interaction.commandName === 'jump') {
    const startPage = interaction.options.getInteger('page') || 1;
    
    const embeds = Array.from({ length: 10 }, (_, i) => 
      new EmbedBuilder()
        .setTitle(`Page ${i + 1} of 10`)
        .setDescription(`You can start on any page you want!`)
        .setColor(0x00ffff)
    );

    const paginator = new Paginator({
      embeds,
      authorId: interaction.user.id,
      startPage: Math.max(0, Math.min(startPage - 1, embeds.length - 1)), // Convert 1-indexed to 0-indexed
      useSelectMenu: true,
    });

    await paginator.start(interaction);
    await interaction.followUp({
      content: `Started pagination on page ${startPage}!`,
      ephemeral: true,
    });
  }

  // Example 3: Custom timeout handling
  if (interaction.commandName === 'timed') {
    const seconds = interaction.options.getInteger('timeout') || 30;
    
    const embeds = [
      new EmbedBuilder()
        .setTitle('⏰ Timed Pagination')
        .setDescription(`This pagination will expire in ${seconds} seconds`)
        .setColor(0xff6b6b),
      new EmbedBuilder()
        .setTitle('Page 2')
        .setDescription('Keep navigating before time runs out!')
        .setColor(0x4ecdc4),
    ];

    const paginator = new Paginator({
      embeds,
      authorId: interaction.user.id,
      timeout: seconds * 1000,
      deleteOnStop: false, // Keep the message but disable buttons
    });

    const message = await paginator.start(interaction);
    
    // You can manually stop pagination after some condition
    // setTimeout(() => {
    //   paginator.stop();
    // }, (seconds * 1000) / 2);
  }

  // Example 4: Large dataset pagination
  if (interaction.commandName === 'database') {
    // Simulate a database query result
    const databaseResults = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
      value: Math.floor(Math.random() * 1000),
      timestamp: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    }));

    // Split into pages of 5 items each
    const itemsPerPage = 5;
    const embeds = [];

    for (let i = 0; i < databaseResults.length; i += itemsPerPage) {
      const pageItems = databaseResults.slice(i, i + itemsPerPage);
      const embed = new EmbedBuilder()
        .setTitle('📊 Database Results')
        .setColor(0x3498db)
        .setDescription(
          pageItems.map(item => 
            `**ID:** ${item.id} | **Name:** ${item.name} | **Value:** ${item.value}`
          ).join('\n')
        )
        .setFooter({ 
          text: `Page ${Math.floor(i / itemsPerPage) + 1} of ${Math.ceil(databaseResults.length / itemsPerPage)} • Total: ${databaseResults.length} items` 
        });

      embeds.push(embed);
    }

    const paginator = new Paginator({
      embeds,
      authorId: interaction.user.id,
      useSelectMenu: true, // Helpful for large datasets
      timeout: 600000, // 10 minutes for large datasets
    });

    await paginator.start(interaction);
  }

  // Example 5: Mixed content types
  if (interaction.commandName === 'showcase') {
    const embeds = [
      {
        title: '🎨 Text Content',
        description: 'This page has only text content',
        color: 0xe74c3c,
        fields: [
          { name: 'Feature 1', value: 'Description 1', inline: true },
          { name: 'Feature 2', value: 'Description 2', inline: true },
        ],
      },
      {
        title: '🖼️ Image Content',
        description: 'This page includes an image',
        color: 0x3498db,
        image: 'https://i.imgur.com/AfFp7pu.png',
      },
      {
        title: '👤 Author Content',
        description: 'This page has author information',
        color: 0x2ecc71,
        author: {
          name: 'Pagincord',
          iconURL: 'https://i.imgur.com/AfFp7pu.png',
        },
        thumbnail: 'https://i.imgur.com/AfFp7pu.png',
      },
      {
        title: '🔗 Link Content',
        description: 'Click the title to visit a link',
        color: 0xf39c12,
        url: 'https://discord.js.org',
        footer: { text: 'Opens discord.js documentation' },
      },
    ];

    const paginator = new Paginator({
      embeds,
      authorId: interaction.user.id,
      useSelectMenu: true,
      buttonEmojis: {
        first: '⏮️',
        previous: '◀️',
        stop: '⏹️',
        next: '▶️',
        last: '⏭️',
      },
    });

    await paginator.start(interaction);
  }

  // Example 6: Manual control
  if (interaction.commandName === 'manual') {
    const embeds = [
      new EmbedBuilder().setTitle('Page 1').setColor(0xff0000),
      new EmbedBuilder().setTitle('Page 2').setColor(0x00ff00),
      new EmbedBuilder().setTitle('Page 3').setColor(0x0000ff),
    ];

    const paginator = new Paginator({
      embeds,
      authorId: interaction.user.id,
      timeout: 60000,
    });

    const message = await paginator.start(interaction);

    // You can access paginator methods after starting
    console.log(`Started pagination with ${paginator.getTotalPages()} pages`);
    console.log(`Currently on page ${paginator.getCurrentPage() + 1}`);

    // Example: Stop pagination programmatically after 30 seconds
    setTimeout(() => {
      console.log('Stopping pagination manually');
      paginator.stop();
    }, 30000);
  }
});

client.once('ready', () => {
  console.log('Bot is ready!');
});

// client.login('YOUR_BOT_TOKEN');
