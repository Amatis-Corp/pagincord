/**
 * Advanced usage — jump modal, events, loop, dynamic pages
 */

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { Paginator, paginate, createPages, chunk } = require('pagincord');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'generate') {
    const count = interaction.options.getInteger('pages') || 8;

    const embeds = Array.from({ length: count }, (_, i) => ({
      title: `Generated page ${i + 1}`,
      description: `This is page ${i + 1} of ${count}`,
      color: Math.floor(Math.random() * 0xffffff),
    }));

    await paginate(interaction, {
      embeds,
      authorId: interaction.user.id,
      useSelectMenu: true,
      jumpModal: true,
      loop: true,
      timeout: 300_000,
      autoFooter: true,
    });
  }

  if (interaction.commandName === 'database') {
    const rows = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
      value: Math.floor(Math.random() * 1000),
    }));

    const pages = createPages({
      items: rows,
      itemsPerPage: 5,
      mapItem: (item) => `**#${item.id}** ${item.name} — ${item.value}`,
      embed: { title: '📊 Database results', color: 0x3498db },
    });

    const paginator = new Paginator({
      embeds: pages,
      authorId: interaction.user.id,
      useSelectMenu: true,
      jumpModal: {
        title: 'Jump to page',
        label: 'Page number',
      },
      timeout: 600_000,
      endBehavior: 'clear',
      onPageChange: ({ page, total }) => {
        console.log(`Page ${page + 1}/${total}`);
      },
      onEnd: (reason) => {
        console.log('Pagination ended:', reason);
      },
    });

    paginator.on('unauthorized', (i) => {
      console.log(`${i.user.tag} tried to control this paginator`);
    });

    await paginator.start(interaction);
  }

  if (interaction.commandName === 'manual') {
    const paginator = new Paginator({
      embeds: chunk(['Red', 'Green', 'Blue'], 1).map(([name], i) =>
        new EmbedBuilder().setTitle(`Page ${i + 1}`).setDescription(name)
      ),
      authorId: interaction.user.id,
      buttons: { first: false, last: false, pageIndicator: true, stop: true },
      buttonLabels: { previous: 'Back', next: 'Next', stop: 'Close' },
    });

    await paginator.start(interaction);

    setTimeout(() => {
      paginator.addEmbeds([{ title: 'Bonus page', description: 'Added later' }]);
    }, 10_000);

    setTimeout(() => paginator.stop(), 30_000);
  }
});

client.once('ready', () => {
  console.log('Bot is ready!');
});

// client.login('YOUR_BOT_TOKEN');
