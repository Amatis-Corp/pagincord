import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  Message,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  InteractionCollector,
  CommandInteraction,
  ButtonInteraction,
  StringSelectMenuInteraction,
  MessageComponentInteraction,
} from 'discord.js';
import {
  PaginationOptions,
  PaginationState,
  PaginationTarget,
  PaginationInteraction,
  EmbedData,
} from './types';

/**
 * Main Paginator class for handling Discord.js embed pagination
 */
export class Paginator {
  private embeds: EmbedBuilder[];
  private currentPage: number;
  private authorId?: string;
  private useSelectMenu: boolean;
  private timeout: number;
  private buttonEmojis: Required<NonNullable<PaginationOptions['buttonEmojis']>>;
  private deleteOnStop: boolean;
  private collector?: InteractionCollector<PaginationInteraction>;
  private message?: Message;
  private timeoutHandle?: NodeJS.Timeout;

  constructor(options: PaginationOptions) {
    // Convert EmbedData to EmbedBuilder if needed
    this.embeds = options.embeds.map((embed) => {
      if (embed instanceof EmbedBuilder) {
        return embed;
      }
      return this.buildEmbed(embed);
    });

    if (this.embeds.length === 0) {
      throw new Error('At least one embed is required for pagination');
    }

    this.currentPage = Math.max(0, Math.min(options.startPage ?? 0, this.embeds.length - 1));
    this.authorId = options.authorId;
    this.useSelectMenu = options.useSelectMenu ?? false;
    this.timeout = options.timeout ?? 60000;
    this.deleteOnStop = options.deleteOnStop ?? false;

    // Default button emojis
    this.buttonEmojis = {
      first: options.buttonEmojis?.first ?? '⏮️',
      previous: options.buttonEmojis?.previous ?? '◀️',
      next: options.buttonEmojis?.next ?? '▶️',
      last: options.buttonEmojis?.last ?? '⏭️',
      stop: options.buttonEmojis?.stop ?? '🗑️',
    };
  }

  /**
   * Build an EmbedBuilder from EmbedData
   */
  private buildEmbed(data: EmbedData): EmbedBuilder {
    const embed = new EmbedBuilder();

    if (data.title) embed.setTitle(data.title);
    // Description is required by Discord API - provide a default if missing
    if (data.description) {
      embed.setDescription(data.description);
    } else if (!data.fields || data.fields.length === 0) {
      // Only set default description if there are no fields either
      embed.setDescription('\u200B'); // Zero-width space
    }
    if (data.color !== undefined) embed.setColor(data.color);
    if (data.fields) embed.addFields(data.fields);
    if (data.footer) embed.setFooter(data.footer);
    if (data.thumbnail) embed.setThumbnail(data.thumbnail);
    if (data.image) embed.setImage(data.image);
    if (data.author) embed.setAuthor(data.author);
    if (data.url) embed.setURL(data.url);
    if (data.timestamp) {
      embed.setTimestamp(data.timestamp instanceof Date ? data.timestamp : undefined);
    }

    return embed;
  }

  /**
   * Create button components with proper disabled states
   */
  private createButtons(): ActionRowBuilder<ButtonBuilder> {
    const isFirstPage = this.currentPage === 0;
    const isLastPage = this.currentPage === this.embeds.length - 1;
    const isSinglePage = this.embeds.length === 1;

    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('first')
        .setEmoji(this.buttonEmojis.first)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(isFirstPage || isSinglePage),
      new ButtonBuilder()
        .setCustomId('previous')
        .setEmoji(this.buttonEmojis.previous)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(isFirstPage || isSinglePage),
      new ButtonBuilder()
        .setCustomId('stop')
        .setEmoji(this.buttonEmojis.stop)
        .setStyle(ButtonStyle.Danger)
        .setDisabled(false),
      new ButtonBuilder()
        .setCustomId('next')
        .setEmoji(this.buttonEmojis.next)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(isLastPage || isSinglePage),
      new ButtonBuilder()
        .setCustomId('last')
        .setEmoji(this.buttonEmojis.last)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(isLastPage || isSinglePage)
    );
  }

  /**
   * Create select menu for page jumping
   */
  private createSelectMenu(): ActionRowBuilder<StringSelectMenuBuilder> {
    const options = this.embeds.map((embed, index) => {
      const embedTitle = embed.data.title ?? `Page ${index + 1}`;
      return new StringSelectMenuOptionBuilder()
        .setLabel(`${index + 1}. ${embedTitle.substring(0, 90)}`)
        .setValue(index.toString())
        .setDefault(index === this.currentPage);
    });

    return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('page-select')
        .setPlaceholder(`Page ${this.currentPage + 1} of ${this.embeds.length}`)
        .addOptions(options)
    );
  }

  /**
   * Get current page components
   */
  private getComponents(): ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[] {
    const components: ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[] = [
      this.createButtons(),
    ];

    if (this.useSelectMenu && this.embeds.length > 1) {
      components.push(this.createSelectMenu());
    }

    return components;
  }

  /**
   * Disable all components when pagination ends
   */
  private getDisabledComponents(): ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[] {
    const disabledButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('first-disabled')
        .setEmoji(this.buttonEmojis.first)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId('previous-disabled')
        .setEmoji(this.buttonEmojis.previous)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId('stop-disabled')
        .setEmoji(this.buttonEmojis.stop)
        .setStyle(ButtonStyle.Danger)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId('next-disabled')
        .setEmoji(this.buttonEmojis.next)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId('last-disabled')
        .setEmoji(this.buttonEmojis.last)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true)
    );

    const components: ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[] = [
      disabledButtons,
    ];

    if (this.useSelectMenu && this.embeds.length > 1) {
      const disabledSelect = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('page-select-disabled')
          .setPlaceholder(`Page ${this.currentPage + 1} of ${this.embeds.length}`)
          .setDisabled(true)
          .addOptions(
            new StringSelectMenuOptionBuilder()
              .setLabel('Pagination ended')
              .setValue('disabled')
          )
      );
      components.push(disabledSelect);
    }

    return components;
  }

  /**
   * Update the message with the current page
   */
  private async updateMessage(): Promise<void> {
    if (!this.message) return;

    try {
      await this.message.edit({
        embeds: [this.embeds[this.currentPage]],
        components: this.getComponents(),
      });
    } catch (error) {
      console.error('Failed to update pagination message:', error);
    }
  }

  /**
   * End pagination and clean up
   */
  private async endPagination(): Promise<void> {
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
      this.timeoutHandle = undefined;
    }

    if (this.collector) {
      this.collector.stop();
    }

    if (!this.message) return;

    try {
      if (this.deleteOnStop) {
        if (this.message.deletable) {
          await this.message.delete();
        }
      } else {
        await this.message.edit({
          embeds: [this.embeds[this.currentPage]],
          components: this.getDisabledComponents(),
        });
      }
    } catch (error) {
      console.error('Failed to end pagination:', error);
    }
  }

  /**
   * Reset the idle timeout
   */
  private resetTimeout(): void {
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
    }

    this.timeoutHandle = setTimeout(() => {
      this.endPagination();
    }, this.timeout);
  }

  /**
   * Handle button interactions
   */
  private async handleInteraction(interaction: PaginationInteraction): Promise<void> {
    // Check if user is authorized
    if (this.authorId && interaction.user.id !== this.authorId) {
      await interaction.reply({
        content: 'You are not allowed to control this pagination.',
        ephemeral: true,
      });
      return;
    }

    // Handle button interactions
    if (interaction.isButton()) {
      switch (interaction.customId) {
        case 'first':
          this.currentPage = 0;
          break;
        case 'previous':
          this.currentPage = Math.max(0, this.currentPage - 1);
          break;
        case 'next':
          this.currentPage = Math.min(this.embeds.length - 1, this.currentPage + 1);
          break;
        case 'last':
          this.currentPage = this.embeds.length - 1;
          break;
        case 'stop':
          await interaction.deferUpdate();
          await this.endPagination();
          return;
      }

      await interaction.deferUpdate();
      await this.updateMessage();
      this.resetTimeout();
    }

    // Handle select menu interactions
    if (interaction.isStringSelectMenu() && interaction.customId === 'page-select') {
      const selectedPage = parseInt(interaction.values[0], 10);
      if (!isNaN(selectedPage) && selectedPage >= 0 && selectedPage < this.embeds.length) {
        this.currentPage = selectedPage;
        await interaction.deferUpdate();
        await this.updateMessage();
        this.resetTimeout();
      }
    }
  }

  /**
   * Start pagination on a message or interaction
   */
  async start(target: PaginationTarget): Promise<Message> {
    const payload = {
      embeds: [this.embeds[this.currentPage]],
      components: this.getComponents(),
    };

    // Send or reply with the pagination message
    if (target instanceof Message) {
      if (!('send' in target.channel)) {
        throw new Error('Cannot send messages to this channel type');
      }
      this.message = await target.channel.send(payload);
    } else {
      // CommandInteraction
      if (target.replied || target.deferred) {
        this.message = await target.editReply(payload) as Message;
      } else {
        // Use withResponse flag for v14+
        const reply = await target.reply({ ...payload, fetchReply: true }) as Message;
        this.message = reply;
      }
    }

    if (!this.message) {
      throw new Error('Failed to create pagination message');
    }

    // Set up interaction collector for all component types
    const collector = this.message.createMessageComponentCollector<ComponentType.Button | ComponentType.StringSelect>({
      time: this.timeout,
    });

    this.collector = collector as InteractionCollector<PaginationInteraction>;

    this.collector.on('collect', async (interaction: MessageComponentInteraction) => {
      await this.handleInteraction(interaction as PaginationInteraction);
    });

    this.collector.on('end', () => {
      this.endPagination();
    });

    // Start initial timeout
    this.resetTimeout();

    return this.message;
  }

  /**
   * Get the total number of pages
   */
  getTotalPages(): number {
    return this.embeds.length;
  }

  /**
   * Get the current page index (0-based)
   */
  getCurrentPage(): number {
    return this.currentPage;
  }

  /**
   * Stop pagination manually
   */
  async stop(): Promise<void> {
    await this.endPagination();
  }
}
