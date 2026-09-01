/**
 * TypeScript usage — @amatiscorp/pagincord
 */

import { Client, GatewayIntentBits, ChatInputCommandInteraction } from 'discord.js';
import {
  Paginator,
  paginate,
  paginateList,
  createPages,
  configure,
  type PaginationOptions,
  type EmbedData,
} from '@amatiscorp/pagincord';

configure({ locale: 'en', timeout: 90_000 });

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

  if (interaction.commandName === 'ayuda') {
    await sendAyuda(interaction);
  }
});

async function sendHelp(interaction: ChatInputCommandInteraction) {
  const pages: EmbedData[] = [
    { title: 'Help — 1', description: 'Welcome.', color: 0x5865f2 },
    { title: 'Help — 2', description: 'Commands.', color: 0x57f287 },
  ];

  const options: PaginationOptions = {
    embeds: pages,
    authorId: interaction.user.id,
    locale: 'en',
    showButtonLabels: true,
    useSelectMenu: true,
    jumpModal: true,
  };

  await new Paginator(options).start(interaction);
}

async function sendAyuda(interaction: ChatInputCommandInteraction) {
  await paginateList(
    interaction,
    ['`/ping` — latencia', '`/info` — información', '`/stats` — estadísticas'],
    {
      itemsPerPage: 2,
      embed: { title: 'Comandos', color: 0x57f287 },
      locale: 'es',
      authorId: interaction.user.id,
      showButtonLabels: true,
      preset: 'compact',
      searchable: true,
    }
  );
}

// client.login('YOUR_BOT_TOKEN');
