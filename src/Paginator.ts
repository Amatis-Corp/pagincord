import { EventEmitter } from 'node:events';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  EmbedBuilder,
  Message,
  MessageComponentInteraction,
  ModalBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import type {
  AutoFooterOptions,
  EmbedData,
  EmbedResolvable,
  EndBehavior,
  EndReason,
  JumpModalOptions,
  PageContext,
  PaginationButtonEmojis,
  PaginationButtonLabels,
  PaginationButtonStyles,
  PaginationButtons,
  PaginationFilter,
  PaginationInteraction,
  PaginationOptions,
  PaginationState,
  PaginationTarget,
  PaginatorEvents,
  ReplyAs,
} from './types';

const DEFAULT_EMOJIS: Required<PaginationButtonEmojis> = {
  first: '⏮️',
  previous: '◀️',
  next: '▶️',
  last: '⏭️',
  stop: '🗑️',
};

const DEFAULT_BUTTONS: Required<PaginationButtons> = {
  first: true,
  previous: true,
  next: true,
  last: true,
  stop: true,
  pageIndicator: false,
};

const MAX_SELECT_OPTIONS = 25;
const CUSTOM_ID_PREFIX = 'pgc';

/**
 * Smart embed paginator for Discord.js v14+.
 *
 * @example
 * const paginator = new Paginator({ embeds, authorId: interaction.user.id });
 * await paginator.start(interaction);
 */
export class Paginator extends EventEmitter {
  private embeds: EmbedBuilder[];
  private currentPage: number;
  private allowedUsers: string[];
  private filterFn?: PaginationFilter;
  private useSelectMenu: boolean;
  private selectPlaceholder?: string | ((page: number, total: number) => string);
  private timeout: number;
  private buttonEmojis: Required<PaginationButtonEmojis>;
  private buttonLabels: PaginationButtonLabels;
  private buttonStyles: Required<PaginationButtonStyles>;
  private buttons: Required<PaginationButtons>;
  private jumpModal: false | JumpModalOptions;
  private endBehavior: EndBehavior;
  private loop: boolean;
  private ephemeral: boolean;
  private content?: string | ((ctx: PageContext) => string);
  private autoFooter: false | AutoFooterOptions;
  private unauthorizedMessage: NonNullable<PaginationOptions['unauthorizedMessage']>;
  private hideButtonsIfSinglePage: boolean;
  private replyAs?: ReplyAs;
  private onPageChangeCb?: PaginationOptions['onPageChange'];
  private onEndCb?: PaginationOptions['onEnd'];
  private onCollectCb?: PaginationOptions['onCollect'];

  private readonly instanceId: string;
  private collector?: ReturnType<Message['createMessageComponentCollector']>;
  private message?: Message;
  private ended = false;
  private started = false;

  constructor(options: PaginationOptions) {
    super();

    if (!options.embeds || options.embeds.length === 0) {
      throw new Error('At least one embed is required for pagination');
    }

    this.embeds = options.embeds.map((embed) => this.normalizeEmbed(embed));
    this.currentPage = clamp(options.startPage ?? 0, 0, this.embeds.length - 1);
    this.allowedUsers = unique([
      ...(options.authorId ? [options.authorId] : []),
      ...(options.allowedUsers ?? []),
    ]);
    this.filterFn = options.filter;
    this.useSelectMenu = options.useSelectMenu ?? false;
    this.selectPlaceholder = options.selectPlaceholder;
    this.timeout = options.timeout ?? 60_000;
    this.buttonEmojis = { ...DEFAULT_EMOJIS, ...options.buttonEmojis };
    this.buttonLabels = options.buttonLabels ?? {};
    this.buttonStyles = {
      first: options.buttonStyles?.first ?? ButtonStyle.Primary,
      previous: options.buttonStyles?.previous ?? ButtonStyle.Primary,
      next: options.buttonStyles?.next ?? ButtonStyle.Primary,
      last: options.buttonStyles?.last ?? ButtonStyle.Primary,
      stop: options.buttonStyles?.stop ?? ButtonStyle.Danger,
    };
    this.buttons = { ...DEFAULT_BUTTONS, ...options.buttons };
    this.jumpModal = resolveJumpModal(options.jumpModal);
    if (this.jumpModal) this.buttons.pageIndicator = true;
    this.endBehavior = options.endBehavior ?? (options.deleteOnStop ? 'delete' : 'disable');
    this.loop = options.loop ?? false;
    this.ephemeral = options.ephemeral ?? false;
    this.content = options.content;
    this.autoFooter =
      options.autoFooter === true
        ? { format: 'Page {page} of {total}', append: false }
        : options.autoFooter || false;
    this.unauthorizedMessage =
      options.unauthorizedMessage ?? 'You are not allowed to control this pagination.';
    this.hideButtonsIfSinglePage = options.hideButtonsIfSinglePage ?? false;
    this.replyAs = options.replyAs;
    this.onPageChangeCb = options.onPageChange;
    this.onEndCb = options.onEnd;
    this.onCollectCb = options.onCollect;
    this.instanceId = Math.random().toString(36).slice(2, 10);
  }

  override emit<K extends keyof PaginatorEvents>(event: K, ...args: PaginatorEvents[K]): boolean {
    return super.emit(event, ...args);
  }

  override on<K extends keyof PaginatorEvents>(
    event: K,
    listener: (...args: PaginatorEvents[K]) => void
  ): this {
    return super.on(event, listener);
  }

  override once<K extends keyof PaginatorEvents>(
    event: K,
    listener: (...args: PaginatorEvents[K]) => void
  ): this {
    return super.once(event, listener);
  }

  override off<K extends keyof PaginatorEvents>(
    event: K,
    listener: (...args: PaginatorEvents[K]) => void
  ): this {
    return super.off(event, listener);
  }

  /**
   * Start pagination on a message or interaction.
   */
  async start(target: PaginationTarget): Promise<Message> {
    if (this.started) {
      throw new Error('This paginator has already been started. Create a new instance.');
    }
    this.started = true;

    const payload = this.getPayload();

    if (target instanceof Message) {
      if (!target.channel || !('send' in target.channel)) {
        throw new Error('Cannot send messages to this channel type');
      }
      this.message = await target.channel.send(payload);
    } else {
      this.message = await this.sendViaInteraction(target, payload);
    }

    if (!this.message) {
      throw new Error('Failed to create pagination message');
    }

    this.attachCollector();
    return this.message;
  }

  /**
   * Stop pagination and apply the configured end behavior.
   */
  async stop(): Promise<void> {
    await this.endPagination('manual');
  }

  /**
   * Jump to a specific page (0-based). Clamped to a valid range.
   */
  async goToPage(page: number, interaction?: PaginationInteraction): Promise<void> {
    if (this.ended) return;
    const next = clamp(page, 0, this.embeds.length - 1);
    this.currentPage = next;
    await this.updateMessage();
    await this.emitPageChange(interaction);
  }

  /** Go to the next page (wraps if `loop` is enabled). */
  async next(interaction?: PaginationInteraction): Promise<void> {
    if (this.ended) return;
    if (this.currentPage < this.embeds.length - 1) {
      await this.goToPage(this.currentPage + 1, interaction);
    } else if (this.loop && this.embeds.length > 1) {
      await this.goToPage(0, interaction);
    }
  }

  /** Go to the previous page (wraps if `loop` is enabled). */
  async previous(interaction?: PaginationInteraction): Promise<void> {
    if (this.ended) return;
    if (this.currentPage > 0) {
      await this.goToPage(this.currentPage - 1, interaction);
    } else if (this.loop && this.embeds.length > 1) {
      await this.goToPage(this.embeds.length - 1, interaction);
    }
  }

  /**
   * Replace every page. The current index is clamped to the new length.
   */
  async setEmbeds(embeds: EmbedResolvable[]): Promise<void> {
    if (!embeds.length) {
      throw new Error('At least one embed is required for pagination');
    }
    this.embeds = embeds.map((embed) => this.normalizeEmbed(embed));
    this.currentPage = clamp(this.currentPage, 0, this.embeds.length - 1);
    if (this.message && !this.ended) {
      await this.updateMessage();
    }
  }

  /**
   * Append pages at the end.
   */
  async addEmbeds(embeds: EmbedResolvable[]): Promise<void> {
    if (!embeds.length) return;
    this.embeds.push(...embeds.map((embed) => this.normalizeEmbed(embed)));
    if (this.message && !this.ended) {
      await this.updateMessage();
    }
  }

  getTotalPages(): number {
    return this.embeds.length;
  }

  /** Current page index (0-based). */
  getCurrentPage(): number {
    return this.currentPage;
  }

  getMessage(): Message | undefined {
    return this.message;
  }

  isActive(): boolean {
    return this.started && !this.ended;
  }

  getState(): PaginationState {
    return {
      currentPage: this.currentPage,
      totalPages: this.embeds.length,
      authorId: this.allowedUsers[0],
      ended: this.ended,
      loop: this.loop,
    };
  }

  private cid(action: string): string {
    return `${CUSTOM_ID_PREFIX}:${this.instanceId}:${action}`;
  }

  private parseAction(customId: string): string | null {
    const prefix = `${CUSTOM_ID_PREFIX}:${this.instanceId}:`;
    if (!customId.startsWith(prefix)) return null;
    return customId.slice(prefix.length);
  }

  private normalizeEmbed(embed: EmbedResolvable): EmbedBuilder {
    if (embed instanceof EmbedBuilder) {
      return EmbedBuilder.from(embed.data);
    }
    return this.buildEmbed(embed);
  }

  private buildEmbed(data: EmbedData): EmbedBuilder {
    const embed = new EmbedBuilder();

    if (data.title) embed.setTitle(data.title);
    if (data.description) {
      embed.setDescription(data.description);
    } else if (!data.fields || data.fields.length === 0) {
      embed.setDescription('\u200B');
    }
    if (data.color !== undefined) embed.setColor(data.color);
    if (data.fields) embed.addFields(data.fields);
    if (data.footer) embed.setFooter(data.footer);
    if (data.thumbnail) embed.setThumbnail(data.thumbnail);
    if (data.image) embed.setImage(data.image);
    if (data.author) embed.setAuthor(data.author);
    if (data.url) embed.setURL(data.url);
    if (data.timestamp) {
      embed.setTimestamp(data.timestamp instanceof Date ? data.timestamp : new Date());
    }

    return embed;
  }

  private pageContext(): PageContext {
    return { page: this.currentPage, total: this.embeds.length };
  }

  private applyFooter(embed: EmbedBuilder): EmbedBuilder {
    if (!this.autoFooter) return embed;
    const clone = EmbedBuilder.from(embed.data);
    const format = this.autoFooter.format ?? 'Page {page} of {total}';
    const pageText = format
      .replace(/\{page\}/g, String(this.currentPage + 1))
      .replace(/\{total\}/g, String(this.embeds.length));
    const previous = clone.data.footer;
    clone.setFooter({
      text:
        this.autoFooter.append && previous?.text
          ? `${previous.text} • ${pageText}`
          : pageText,
      iconURL: previous?.icon_url,
    });
    return clone;
  }

  private resolveContent(): string | undefined {
    if (this.content === undefined) return undefined;
    if (typeof this.content === 'function') return this.content(this.pageContext());
    return this.content;
  }

  private getPayload(disabled = false): {
    embeds: EmbedBuilder[];
    components: ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[];
    content?: string;
  } {
    const content = this.resolveContent();
    return {
      embeds: [this.applyFooter(this.embeds[this.currentPage])],
      components: disabled ? this.getDisabledComponents() : this.getComponents(),
      ...(content !== undefined ? { content } : {}),
    };
  }

  private decorateButton(
    button: ButtonBuilder,
    kind: keyof PaginationButtonEmojis
  ): ButtonBuilder {
    const emoji = this.buttonEmojis[kind];
    const label = this.buttonLabels[kind];
    if (emoji) button.setEmoji(emoji);
    if (label) button.setLabel(label);
    button.setStyle(this.buttonStyles[kind]);
    return button;
  }

  private createButtons(disabled: boolean): ButtonBuilder[] {
    const single = this.embeds.length === 1;
    const isFirst = this.currentPage === 0;
    const isLast = this.currentPage === this.embeds.length - 1;
    const loop = this.loop && !single;
    const result: ButtonBuilder[] = [];

    if (this.buttons.first) {
      result.push(
        this.decorateButton(
          new ButtonBuilder()
            .setCustomId(this.cid('first'))
            .setDisabled(disabled || single || (isFirst && !loop)),
          'first'
        )
      );
    }

    if (this.buttons.previous) {
      result.push(
        this.decorateButton(
          new ButtonBuilder()
            .setCustomId(this.cid('previous'))
            .setDisabled(disabled || single || (isFirst && !loop)),
          'previous'
        )
      );
    }

    if (this.buttons.pageIndicator) {
      result.push(
        new ButtonBuilder()
          .setCustomId(this.cid('indicator'))
          .setLabel(`${this.currentPage + 1} / ${this.embeds.length}`)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(disabled || !this.jumpModal || single)
      );
    }

    if (this.buttons.next) {
      result.push(
        this.decorateButton(
          new ButtonBuilder()
            .setCustomId(this.cid('next'))
            .setDisabled(disabled || single || (isLast && !loop)),
          'next'
        )
      );
    }

    if (this.buttons.last) {
      result.push(
        this.decorateButton(
          new ButtonBuilder()
            .setCustomId(this.cid('last'))
            .setDisabled(disabled || single || (isLast && !loop)),
          'last'
        )
      );
    }

    if (this.buttons.stop) {
      result.push(
        this.decorateButton(
          new ButtonBuilder().setCustomId(this.cid('stop')).setDisabled(disabled),
          'stop'
        )
      );
    }

    return result;
  }

  private rowsFromButtons(buttons: ButtonBuilder[]): ActionRowBuilder<ButtonBuilder>[] {
    const rows: ActionRowBuilder<ButtonBuilder>[] = [];
    for (let i = 0; i < buttons.length; i += 5) {
      rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons.slice(i, i + 5)));
    }
    return rows;
  }

  private createSelectMenu(disabled: boolean): ActionRowBuilder<StringSelectMenuBuilder> {
    const total = this.embeds.length;
    let start = 0;
    let end = total;

    if (total > MAX_SELECT_OPTIONS) {
      start = Math.max(0, this.currentPage - Math.floor(MAX_SELECT_OPTIONS / 2));
      end = Math.min(total, start + MAX_SELECT_OPTIONS);
      start = Math.max(0, end - MAX_SELECT_OPTIONS);
    }

    const options = [];
    for (let i = start; i < end; i++) {
      const title = this.embeds[i].data.title ?? `Page ${i + 1}`;
      options.push(
        new StringSelectMenuOptionBuilder()
          .setLabel(`${i + 1}. ${title}`.slice(0, 100))
          .setValue(String(i))
          .setDefault(i === this.currentPage)
      );
    }

    const placeholderRaw =
      typeof this.selectPlaceholder === 'function'
        ? this.selectPlaceholder(this.currentPage + 1, total)
        : this.selectPlaceholder ?? `Page ${this.currentPage + 1} of ${total}`;

    return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(this.cid('select'))
        .setPlaceholder(placeholderRaw.slice(0, 150))
        .setDisabled(disabled)
        .addOptions(
          disabled
            ? [new StringSelectMenuOptionBuilder().setLabel('Pagination ended').setValue('ended')]
            : options
        )
    );
  }

  private getComponents(): ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[] {
    const single = this.embeds.length === 1;
    const components: ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[] = [];

    if (!(this.hideButtonsIfSinglePage && single)) {
      components.push(...this.rowsFromButtons(this.createButtons(false)));
    }

    if (this.useSelectMenu && !single) {
      components.push(this.createSelectMenu(false));
    }

    return components;
  }

  private getDisabledComponents(): ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[] {
    const single = this.embeds.length === 1;
    const components: ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[] = [];

    if (!(this.hideButtonsIfSinglePage && single)) {
      components.push(...this.rowsFromButtons(this.createButtons(true)));
    }

    if (this.useSelectMenu && !single) {
      components.push(this.createSelectMenu(true));
    }

    return components;
  }

  private async sendViaInteraction(
    interaction: CommandInteraction | MessageComponentInteraction,
    payload: ReturnType<Paginator['getPayload']>
  ): Promise<Message> {
    const mode = this.resolveReplyMode(interaction);

    if (mode === 'update' && 'update' in interaction) {
      await interaction.update(payload);
      return interaction.message as Message;
    }

    if (mode === 'followUp') {
      const result = await interaction.followUp({
        ...payload,
        ephemeral: this.ephemeral,
        fetchReply: true,
      });
      return this.asMessage(result, interaction);
    }

    if (mode === 'editReply' || interaction.deferred || interaction.replied) {
      const result = await interaction.editReply(payload);
      return this.asMessage(result, interaction);
    }

    const result = await interaction.reply({
      ...payload,
      ephemeral: this.ephemeral,
      fetchReply: true,
    });
    return this.asMessage(result, interaction);
  }

  private resolveReplyMode(
    interaction: CommandInteraction | MessageComponentInteraction
  ): ReplyAs {
    if (this.replyAs) return this.replyAs;
    if (interaction.replied || interaction.deferred) return 'editReply';
    return 'reply';
  }

  private async asMessage(
    result: unknown,
    interaction: CommandInteraction | MessageComponentInteraction
  ): Promise<Message> {
    if (result instanceof Message) return result;
    return (await interaction.fetchReply()) as Message;
  }

  private attachCollector(): void {
    if (!this.message) return;

    const options: {
      idle?: number;
      filter: (i: MessageComponentInteraction) => boolean;
    } = {
      filter: (i) => i.customId.startsWith(`${CUSTOM_ID_PREFIX}:${this.instanceId}:`),
    };

    if (this.timeout > 0 && Number.isFinite(this.timeout)) {
      options.idle = this.timeout;
    }

    const collector = this.message.createMessageComponentCollector(options);
    this.collector = collector;

    collector.on('collect', async (interaction) => {
      try {
        await this.handleInteraction(interaction as PaginationInteraction);
      } catch (error) {
        this.reportError(error);
      }
    });

    collector.on('end', async (_collected, reason) => {
      if (this.ended) return;
      const mapped: EndReason =
        reason === 'idle' || reason === 'time'
          ? 'timeout'
          : reason === 'messageDelete'
            ? 'messageDelete'
            : 'idle';
      await this.endPagination(mapped);
    });
  }

  private isAllowed(interaction: PaginationInteraction): boolean {
    if (this.filterFn && !this.filterFn(interaction)) return false;
    if (this.allowedUsers.length === 0) return true;
    return this.allowedUsers.includes(interaction.user.id);
  }

  private async rejectUnauthorized(interaction: PaginationInteraction): Promise<void> {
    this.emit('unauthorized', interaction);
    const text =
      typeof this.unauthorizedMessage === 'function'
        ? this.unauthorizedMessage(interaction.user)
        : this.unauthorizedMessage;

    try {
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp({ content: text, ephemeral: true });
      } else {
        await interaction.reply({ content: text, ephemeral: true });
      }
    } catch (error) {
      this.reportError(error);
    }
  }

  private async handleInteraction(interaction: PaginationInteraction): Promise<void> {
    if (this.ended) return;

    if (!this.isAllowed(interaction)) {
      await this.rejectUnauthorized(interaction);
      return;
    }

    this.emit('collect', interaction);
    await this.onCollectCb?.(interaction);

    if (interaction.isStringSelectMenu() && this.parseAction(interaction.customId) === 'select') {
      const selected = Number.parseInt(interaction.values[0], 10);
      await interaction.deferUpdate();
      if (!Number.isNaN(selected)) {
        await this.goToPage(selected, interaction);
      }
      return;
    }

    if (!interaction.isButton()) return;

    const action = this.parseAction(interaction.customId);
    if (!action) return;

    switch (action) {
      case 'first':
        await interaction.deferUpdate();
        await this.goToPage(0, interaction);
        break;
      case 'previous':
        await interaction.deferUpdate();
        await this.previous(interaction);
        break;
      case 'next':
        await interaction.deferUpdate();
        await this.next(interaction);
        break;
      case 'last':
        await interaction.deferUpdate();
        await this.goToPage(this.embeds.length - 1, interaction);
        break;
      case 'stop':
        await interaction.deferUpdate();
        await this.endPagination('stop');
        break;
      case 'indicator':
        await this.openJumpModal(interaction);
        break;
      default:
        break;
    }
  }

  private async openJumpModal(interaction: PaginationInteraction): Promise<void> {
    if (!this.jumpModal || !interaction.isButton()) return;

    const total = this.embeds.length;
    const title = (this.jumpModal.title ?? 'Go to page').slice(0, 45);
    const label = (this.jumpModal.label ?? `Page number (1-${total})`).slice(0, 45);
    const placeholder = (
      this.jumpModal.placeholder ?? `Currently ${this.currentPage + 1} of ${total}`
    ).slice(0, 100);

    const modal = new ModalBuilder()
      .setCustomId(this.cid('jump-modal'))
      .setTitle(title)
      .addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId('page-number')
            .setLabel(label)
            .setStyle(TextInputStyle.Short)
            .setPlaceholder(placeholder)
            .setRequired(true)
            .setMaxLength(4)
        )
      );

    await interaction.showModal(modal);

    try {
      const submitted = await interaction.awaitModalSubmit({
        time: Math.min(this.timeout > 0 ? this.timeout : 30_000, 60_000),
        filter: (i) =>
          i.customId === this.cid('jump-modal') && i.user.id === interaction.user.id,
      });

      const raw = submitted.fields.getTextInputValue('page-number').trim();
      const page = Number.parseInt(raw, 10);

      if (Number.isNaN(page) || page < 1 || page > total) {
        await submitted.reply({
          content: `Please enter a number between 1 and ${total}.`,
          ephemeral: true,
        });
        return;
      }

      await submitted.deferUpdate();
      await this.goToPage(page - 1, interaction);
    } catch {
      // User closed the modal or it timed out.
    }
  }

  private async updateMessage(): Promise<void> {
    if (!this.message || this.ended) return;
    try {
      await this.message.edit(this.getPayload());
    } catch (error) {
      this.reportError(error);
    }
  }

  private async emitPageChange(interaction?: PaginationInteraction): Promise<void> {
    const ctx = {
      ...this.pageContext(),
      embed: this.embeds[this.currentPage],
      interaction,
    };
    this.emit('pageChange', ctx);
    await this.onPageChangeCb?.(ctx);
  }

  private async endPagination(reason: EndReason): Promise<void> {
    if (this.ended) return;
    this.ended = true;

    if (this.collector && !this.collector.ended) {
      this.collector.stop(reason);
    }

    if (this.message && reason !== 'messageDelete') {
      try {
        if (this.endBehavior === 'delete') {
          if (this.message.deletable) {
            await this.message.delete();
          }
        } else if (this.endBehavior === 'clear') {
          await this.message.edit({
            embeds: [this.applyFooter(this.embeds[this.currentPage])],
            components: [],
            content: this.resolveContent() ?? null,
          });
        } else {
          await this.message.edit(this.getPayload(true));
        }
      } catch (error) {
        this.reportError(error);
      }
    }

    this.emit('end', reason);
    await this.onEndCb?.(reason);
  }

  private reportError(error: unknown): void {
    if (this.listenerCount('error') > 0) {
      this.emit('error', error);
    }
  }
}

/**
 * Create a paginator and start it in one call.
 *
 * @example
 * await paginate(interaction, { embeds, authorId: interaction.user.id });
 */
export async function paginate(
  target: PaginationTarget,
  options: PaginationOptions
): Promise<Paginator> {
  const paginator = new Paginator(options);
  await paginator.start(target);
  return paginator;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function resolveJumpModal(value: PaginationOptions['jumpModal']): false | JumpModalOptions {
  if (!value) return false;
  if (value === true) return {};
  return value;
}
