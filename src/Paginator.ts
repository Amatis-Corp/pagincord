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
import type { MessageActionRowComponentBuilder, MessageMentionOptions } from 'discord.js';
import { configure, getConfig, getLocale, resetConfig, setLocale } from './defaults';
import { buildEmbedFromData, createPages, type CreatePagesOptions } from './helpers';
import { resolveTheme, type PaginationTheme } from './themes';
import {
  interpolate,
  resolveLocaleStrings,
  type LocaleCode,
  type LocaleStrings,
} from './locales';
import type {
  AutoFooterOptions,
  ButtonKey,
  EmbedResolvable,
  EndBehavior,
  EndReason,
  ExtraRows,
  JumpModalOptions,
  PageContext,
  PaginationButtonEmojis,
  PaginationButtonLabels,
  PaginationButtonStyles,
  PaginationButtons,
  PaginationFilter,
  PaginationInteraction,
  PaginationOptions,
  PaginationPreset,
  PaginationState,
  PaginationTarget,
  PaginationTexts,
  PaginatorEvents,
  ReplyAs,
} from './types';

const DEFAULT_EMOJIS: Required<PaginationButtonEmojis> = {
  first: '⏮️',
  previous: '◀️',
  next: '▶️',
  last: '⏭️',
  stop: '🗑️',
  search: '🔍',
};

const DEFAULT_BUTTONS: Required<PaginationButtons> = {
  first: true,
  previous: true,
  next: true,
  last: true,
  stop: true,
  pageIndicator: false,
  search: false,
};

const DEFAULT_ORDER: ButtonKey[] = [
  'first',
  'previous',
  'pageIndicator',
  'next',
  'last',
  'stop',
  'search',
];

const MAX_SELECT_OPTIONS = 25;
const MAX_ROWS = 5;

/**
 * Smart embed paginator for Discord.js v14+.
 *
 * @example
 * const paginator = new Paginator({ embeds, authorId: interaction.user.id, locale: 'es' });
 * await paginator.start(interaction);
 */
export class Paginator extends EventEmitter {
  static configure = configure;
  static setLocale = setLocale;
  static getLocale = getLocale;
  static getConfig = getConfig;
  static resetConfig = resetConfig;
  static themes = { classic: 'classic', arrows: 'arrows', round: 'round', discord: 'discord' } as const;

  private embeds: EmbedBuilder[];
  private currentPage: number;
  private allowedUsers: string[];
  private filterFn?: PaginationFilter;
  private useSelectMenu: boolean;
  private selectPlaceholder?: string | ((page: number, total: number) => string);
  private selectOptionFn?: PaginationOptions['selectOption'];
  private timeout: number;
  private maxDuration?: number;
  private buttonEmojis: Required<PaginationButtonEmojis>;
  private buttonLabels: PaginationButtonLabels;
  private buttonStyles: Required<PaginationButtonStyles>;
  private buttons: Required<PaginationButtons>;
  private buttonOrder: ButtonKey[];
  private hideEmojis: boolean;
  private jumpModal: false | JumpModalOptions;
  private endBehavior: EndBehavior;
  private loop: boolean;
  private ephemeral: boolean;
  private content?: string | ((ctx: PageContext) => string);
  private autoFooter: false | AutoFooterOptions;
  private unauthorizedOverride?: PaginationOptions['unauthorizedMessage'];
  private hideButtonsIfSinglePage: boolean;
  private replyAs?: ReplyAs;
  private indicatorFormat?: string;
  private extraRows?: ExtraRows;
  private allowedMentions?: MessageMentionOptions;
  private onPageChangeCb?: PaginationOptions['onPageChange'];
  private onEndCb?: PaginationOptions['onEnd'];
  private onCollectCb?: PaginationOptions['onCollect'];
  private onStartCb?: PaginationOptions['onStart'];
  private onUnauthorizedCb?: PaginationOptions['onUnauthorized'];
  private transformFn?: PaginationOptions['transform'];
  private beforePageChangeCb?: PaginationOptions['beforePageChange'];
  private autoTitle: false | string;
  private numberedButtons: number;
  private searchable: boolean;
  private confirmStop: boolean;
  private silentUnauthorized: boolean;
  private editMessage: boolean;
  private autoDefer: boolean;
  private stopArmedUntil = 0;
  private paused = false;

  private localeCode: string;
  private strings: LocaleStrings;
  private readonly instanceId: string;
  private readonly idPrefix: string;
  private collector?: ReturnType<Message['createMessageComponentCollector']>;
  private message?: Message;
  private ended = false;
  private started = false;

  constructor(options: PaginationOptions) {
    super();

    if (!options.embeds || options.embeds.length === 0) {
      throw new Error('At least one embed is required for pagination');
    }

    const cfg = getConfig();
    const preset = applyPreset(options.preset ?? cfg.preset);

    this.localeCode = options.locale ?? cfg.locale ?? 'en';
    this.strings = resolveLocaleStrings(this.localeCode, options.texts);
    this.embeds = options.embeds.map((embed) => this.normalizeEmbed(embed));
    this.currentPage = clamp(options.startPage ?? 0, 0, this.embeds.length - 1);
    this.allowedUsers = unique([
      ...(options.authorId ? [options.authorId] : []),
      ...(options.allowedUsers ?? []),
    ]);
    this.filterFn = options.filter;
    this.useSelectMenu = options.useSelectMenu ?? preset.useSelectMenu ?? cfg.useSelectMenu ?? false;
    this.selectPlaceholder = options.selectPlaceholder;
    this.selectOptionFn = options.selectOption;
    this.timeout = options.timeout ?? cfg.timeout ?? 60_000;
    this.maxDuration = options.maxDuration;
    const themeEmojis = resolveTheme((options.theme ?? cfg.theme) as PaginationTheme | undefined);
    this.buttonEmojis = { ...DEFAULT_EMOJIS, ...themeEmojis, ...cfg.buttonEmojis, ...options.buttonEmojis };
    this.hideEmojis = options.hideEmojis ?? cfg.hideEmojis ?? false;

    const showLabels = options.showButtonLabels ?? cfg.showButtonLabels ?? this.hideEmojis;
    this.buttonLabels = showLabels
      ? { ...this.strings.buttons, ...options.buttonLabels }
      : { ...(options.buttonLabels ?? {}) };

    this.buttonStyles = {
      first: options.buttonStyles?.first ?? ButtonStyle.Primary,
      previous: options.buttonStyles?.previous ?? ButtonStyle.Primary,
      next: options.buttonStyles?.next ?? ButtonStyle.Primary,
      last: options.buttonStyles?.last ?? ButtonStyle.Primary,
      stop: options.buttonStyles?.stop ?? ButtonStyle.Danger,
      pageIndicator: options.buttonStyles?.pageIndicator ?? ButtonStyle.Secondary,
      search: options.buttonStyles?.search ?? ButtonStyle.Secondary,
    };
    this.buttons = {
      ...DEFAULT_BUTTONS,
      ...cfg.buttons,
      ...preset.buttons,
      ...options.buttons,
    };
    this.buttonOrder = options.buttonOrder ?? preset.buttonOrder ?? DEFAULT_ORDER;
    this.jumpModal = resolveJumpModal(options.jumpModal);
    if (this.jumpModal) this.buttons.pageIndicator = true;
    this.searchable = options.searchable ?? cfg.searchable ?? false;
    if (this.searchable) this.buttons.search = true;
    this.numberedButtons = resolveNumbered(options.numberedButtons ?? cfg.numberedButtons);
    this.confirmStop = options.confirmStop ?? cfg.confirmStop ?? false;
    this.silentUnauthorized = options.silentUnauthorized ?? cfg.silentUnauthorized ?? false;
    this.editMessage = options.editMessage ?? false;
    this.autoDefer = options.autoDefer ?? cfg.autoDefer ?? false;
    this.autoTitle = resolveAutoTitle(options.autoTitle ?? cfg.autoTitle);
    this.transformFn = options.transform;
    this.beforePageChangeCb = options.beforePageChange;
    this.endBehavior =
      options.endBehavior ??
      (options.deleteOnStop ? 'delete' : undefined) ??
      cfg.endBehavior ??
      'disable';
    this.loop = options.loop ?? cfg.loop ?? false;
    this.ephemeral = options.ephemeral ?? cfg.ephemeral ?? false;
    this.content = options.content;
    this.autoFooter = resolveAutoFooter(options.autoFooter ?? cfg.autoFooter, this.strings);
    this.unauthorizedOverride = options.unauthorizedMessage;
    this.hideButtonsIfSinglePage =
      options.hideButtonsIfSinglePage ??
      preset.hideButtonsIfSinglePage ??
      cfg.hideButtonsIfSinglePage ??
      false;
    this.replyAs = options.replyAs;
    this.indicatorFormat = options.indicatorFormat;
    this.extraRows = options.extraRows;
    this.allowedMentions = options.allowedMentions;
    this.onPageChangeCb = options.onPageChange;
    this.onEndCb = options.onEnd;
    this.onCollectCb = options.onCollect;
    this.onStartCb = options.onStart;
    this.onUnauthorizedCb = options.onUnauthorized;
    this.instanceId = Math.random().toString(36).slice(2, 10);
    this.idPrefix = options.customIdPrefix ?? 'pgc';
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

  async start(target: PaginationTarget): Promise<Message> {
    if (this.started) {
      throw new Error('This paginator has already been started. Create a new instance.');
    }
    this.started = true;

    const payload = await this.getPayload();

    if (target instanceof Message) {
      if (this.editMessage) {
        this.message = await target.edit(payload);
      } else {
        if (!target.channel || !('send' in target.channel)) {
          throw new Error('Cannot send messages to this channel type');
        }
        this.message = await target.channel.send(payload);
      }
    } else {
      if (this.autoDefer && !target.replied && !target.deferred) {
        await target.deferReply({ ephemeral: this.ephemeral });
      }
      this.message = await this.sendViaInteraction(target, payload);
    }

    if (!this.message) {
      throw new Error('Failed to create pagination message');
    }

    this.attachCollector();
    this.emit('start', this.message);
    await this.onStartCb?.(this.message);
    return this.message;
  }

  async stop(): Promise<void> {
    await this.endPagination('manual');
  }

  /**
   * Bind pagination to an existing message (edits it).
   */
  async attach(message: Message): Promise<Message> {
    this.editMessage = true;
    return this.start(message);
  }

  async pause(): Promise<void> {
    if (this.ended || this.paused) return;
    this.paused = true;
    await this.updateMessage();
    this.emit('pause');
  }

  async resume(): Promise<void> {
    if (this.ended || !this.paused) return;
    this.paused = false;
    await this.updateMessage();
    this.emit('resume');
  }

  isPaused(): boolean {
    return this.paused;
  }

  async goToPage(page: number, interaction?: PaginationInteraction): Promise<void> {
    if (this.ended || this.paused) return;
    const next = clamp(page, 0, this.embeds.length - 1);
    if (this.beforePageChangeCb) {
      const allowed = await this.beforePageChangeCb(this.currentPage, next, interaction);
      if (allowed === false) return;
    }
    this.currentPage = next;
    await this.updateMessage();
    await this.emitPageChange(interaction);
  }

  async next(interaction?: PaginationInteraction): Promise<void> {
    if (this.ended) return;
    if (this.currentPage < this.embeds.length - 1) {
      await this.goToPage(this.currentPage + 1, interaction);
    } else if (this.loop && this.embeds.length > 1) {
      await this.goToPage(0, interaction);
    }
  }

  async previous(interaction?: PaginationInteraction): Promise<void> {
    if (this.ended) return;
    if (this.currentPage > 0) {
      await this.goToPage(this.currentPage - 1, interaction);
    } else if (this.loop && this.embeds.length > 1) {
      await this.goToPage(this.embeds.length - 1, interaction);
    }
  }

  async first(interaction?: PaginationInteraction): Promise<void> {
    await this.goToPage(0, interaction);
  }

  async last(interaction?: PaginationInteraction): Promise<void> {
    await this.goToPage(this.embeds.length - 1, interaction);
  }

  async setEmbeds(embeds: EmbedResolvable[]): Promise<void> {
    if (!embeds.length) {
      throw new Error('At least one embed is required for pagination');
    }
    this.embeds = embeds.map((embed) => this.normalizeEmbed(embed));
    this.currentPage = clamp(this.currentPage, 0, this.embeds.length - 1);
    await this.refresh();
  }

  async addEmbeds(embeds: EmbedResolvable[]): Promise<void> {
    if (!embeds.length) return;
    this.embeds.push(...embeds.map((embed) => this.normalizeEmbed(embed)));
    await this.refresh();
  }

  async insertEmbeds(index: number, embeds: EmbedResolvable[]): Promise<void> {
    if (!embeds.length) return;
    const at = clamp(index, 0, this.embeds.length);
    this.embeds.splice(at, 0, ...embeds.map((embed) => this.normalizeEmbed(embed)));
    if (at <= this.currentPage) {
      this.currentPage += embeds.length;
    }
    await this.refresh();
  }

  async removePage(index: number): Promise<void> {
    if (this.embeds.length <= 1) {
      throw new Error('Cannot remove the last page');
    }
    const at = clamp(index, 0, this.embeds.length - 1);
    this.embeds.splice(at, 1);
    if (this.currentPage >= this.embeds.length) {
      this.currentPage = this.embeds.length - 1;
    } else if (this.currentPage > at) {
      this.currentPage -= 1;
    }
    await this.refresh();
  }

  async refresh(): Promise<void> {
    if (this.message && !this.ended) {
      await this.updateMessage();
    }
  }

  setAllowedUsers(userIds: string[]): void {
    this.allowedUsers = unique(userIds);
  }

  setLocale(locale: LocaleCode, texts?: PaginationTexts): void {
    this.localeCode = locale;
    this.strings = resolveLocaleStrings(locale, texts);
    if (this.autoFooter && !this.autoFooter.format) {
      this.autoFooter = { ...this.autoFooter, format: this.strings.pageLabel };
    }
  }

  getLocale(): string {
    return this.localeCode;
  }

  getEmbeds(): EmbedBuilder[] {
    return this.embeds.map((embed) => EmbedBuilder.from(embed.data));
  }

  getTotalPages(): number {
    return this.embeds.length;
  }

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
      locale: this.localeCode,
      active: this.isActive(),
      paused: this.paused,
    };
  }

  private cid(action: string): string {
    return `${this.idPrefix}:${this.instanceId}:${action}`;
  }

  private parseAction(customId: string): string | null {
    const prefix = `${this.idPrefix}:${this.instanceId}:`;
    if (!customId.startsWith(prefix)) return null;
    return customId.slice(prefix.length);
  }

  private normalizeEmbed(embed: EmbedResolvable): EmbedBuilder {
    if (embed instanceof EmbedBuilder) {
      return EmbedBuilder.from(embed.data);
    }
    return buildEmbedFromData(embed);
  }

  private pageContext(): PageContext {
    return { page: this.currentPage, total: this.embeds.length };
  }

  private tokens(): Record<string, string | number> {
    return { page: this.currentPage + 1, total: this.embeds.length };
  }

  private applyFooter(embed: EmbedBuilder): EmbedBuilder {
    if (!this.autoFooter) return embed;
    const clone = EmbedBuilder.from(embed.data);
    const format = this.autoFooter.format ?? this.strings.pageLabel;
    const pageText = interpolate(format, this.tokens());
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

  private applyTitle(embed: EmbedBuilder): EmbedBuilder {
    if (!this.autoTitle) return embed;
    const clone = EmbedBuilder.from(embed.data);
    const title = clone.data.title ?? '';
    const next = interpolate(this.autoTitle, { ...this.tokens(), title }).slice(0, 256);
    if (next) clone.setTitle(next);
    return clone;
  }

  private async resolveCurrentEmbed(): Promise<EmbedBuilder> {
    let embed = this.applyTitle(this.applyFooter(this.embeds[this.currentPage]));
    if (this.transformFn) {
      const result = await this.transformFn(EmbedBuilder.from(embed.data), this.pageContext());
      if (result instanceof EmbedBuilder) embed = result;
      else if (result) embed = buildEmbedFromData(result);
    }
    return embed;
  }

  private resolveContent(): string | undefined {
    if (this.content === undefined) return undefined;
    if (typeof this.content === 'function') return this.content(this.pageContext());
    return this.content;
  }

  private async getPayload(disabled = false) {
    const content = this.resolveContent();
    return {
      embeds: [await this.resolveCurrentEmbed()],
      components: disabled || this.paused ? this.getDisabledComponents() : this.getComponents(),
      ...(content !== undefined ? { content } : {}),
      ...(this.allowedMentions ? { allowedMentions: this.allowedMentions } : {}),
    };
  }

  private decorateNavButton(button: ButtonBuilder, kind: keyof PaginationButtonEmojis): ButtonBuilder {
    const emoji = this.buttonEmojis[kind];
    const label = this.buttonLabels[kind];
    const usedEmoji = !this.hideEmojis && Boolean(emoji);
    if (usedEmoji) button.setEmoji(emoji!);
    if (label) button.setLabel(label);
    if (!usedEmoji && !label) {
      button.setEmoji(DEFAULT_EMOJIS[kind]!);
    }
    button.setStyle(this.buttonStyles[kind]);
    return button;
  }

  private buildButton(key: ButtonKey, disabled: boolean): ButtonBuilder | null {
    const single = this.embeds.length === 1;
    const isFirst = this.currentPage === 0;
    const isLast = this.currentPage === this.embeds.length - 1;
    const loop = this.loop && !single;

    if (key !== 'pageIndicator' && !this.buttons[key]) return null;

    switch (key) {
      case 'first':
        return this.decorateNavButton(
          new ButtonBuilder()
            .setCustomId(this.cid('first'))
            .setDisabled(disabled || single || (isFirst && !loop)),
          'first'
        );
      case 'previous':
        return this.decorateNavButton(
          new ButtonBuilder()
            .setCustomId(this.cid('previous'))
            .setDisabled(disabled || single || (isFirst && !loop)),
          'previous'
        );
      case 'next':
        return this.decorateNavButton(
          new ButtonBuilder()
            .setCustomId(this.cid('next'))
            .setDisabled(disabled || single || (isLast && !loop)),
          'next'
        );
      case 'last':
        return this.decorateNavButton(
          new ButtonBuilder()
            .setCustomId(this.cid('last'))
            .setDisabled(disabled || single || (isLast && !loop)),
          'last'
        );
      case 'stop':
        return this.decorateNavButton(
          new ButtonBuilder().setCustomId(this.cid('stop')).setDisabled(disabled),
          'stop'
        );
      case 'search':
        return this.decorateNavButton(
          new ButtonBuilder()
            .setCustomId(this.cid('search'))
            .setDisabled(disabled || this.embeds.length <= 1),
          'search'
        );
      case 'pageIndicator':
        if (!this.buttons.pageIndicator) return null;
        return new ButtonBuilder()
          .setCustomId(this.cid('indicator'))
          .setLabel(
            interpolate(this.indicatorFormat ?? this.strings.indicator, this.tokens()).slice(0, 80)
          )
          .setStyle(this.buttonStyles.pageIndicator)
          .setDisabled(disabled || !this.jumpModal || single);
      default:
        return null;
    }
  }

  private createButtons(disabled: boolean): ButtonBuilder[] {
    const seen = new Set<ButtonKey>();
    const result: ButtonBuilder[] = [];
    for (const key of this.buttonOrder) {
      if (seen.has(key)) continue;
      seen.add(key);
      const button = this.buildButton(key, disabled);
      if (button) result.push(button);
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
    const ctx = this.pageContext();
    let start = 0;
    let end = total;

    if (total > MAX_SELECT_OPTIONS) {
      start = Math.max(0, this.currentPage - Math.floor(MAX_SELECT_OPTIONS / 2));
      end = Math.min(total, start + MAX_SELECT_OPTIONS);
      start = Math.max(0, end - MAX_SELECT_OPTIONS);
    }

    const options = [];
    for (let i = start; i < end; i++) {
      const title = this.embeds[i].data.title ?? interpolate(this.strings.fallbackTitle, { page: i + 1 });
      const custom = this.selectOptionFn?.(this.embeds[i], i, ctx);
      const info =
        typeof custom === 'string'
          ? { label: custom }
          : custom ?? {
              label: interpolate(this.strings.selectOption, { page: i + 1, title }).slice(0, 100),
            };

      const option = new StringSelectMenuOptionBuilder()
        .setLabel(info.label.slice(0, 100))
        .setValue(String(i))
        .setDefault(i === this.currentPage);

      if (info.description) option.setDescription(info.description.slice(0, 100));
      if (info.emoji) option.setEmoji(info.emoji);
      options.push(option);
    }

    const placeholderRaw =
      typeof this.selectPlaceholder === 'function'
        ? this.selectPlaceholder(this.currentPage + 1, total)
        : this.selectPlaceholder ?? interpolate(this.strings.selectPlaceholder, this.tokens());

    return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(this.cid('select'))
        .setPlaceholder(placeholderRaw.slice(0, 150))
        .setDisabled(disabled)
        .addOptions(
          disabled
            ? [
                new StringSelectMenuOptionBuilder()
                  .setLabel(this.strings.selectEnded.slice(0, 100))
                  .setValue('ended'),
              ]
            : options
        )
    );
  }

  private resolveExtraRows(): ActionRowBuilder<MessageActionRowComponentBuilder>[] {
    if (!this.extraRows) return [];
    return typeof this.extraRows === 'function' ? this.extraRows(this.pageContext()) : this.extraRows;
  }

  private assembleRows(
    disabled: boolean
  ): ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder | MessageActionRowComponentBuilder>[] {
    const single = this.embeds.length === 1;
    const rows: ActionRowBuilder<
      ButtonBuilder | StringSelectMenuBuilder | MessageActionRowComponentBuilder
    >[] = [];

    if (!(this.hideButtonsIfSinglePage && single)) {
      rows.push(...this.rowsFromButtons(this.createButtons(disabled)));
    }

    if (this.useSelectMenu && !single) {
      rows.push(this.createSelectMenu(disabled));
    }

    if (this.numberedButtons > 0 && !single && rows.length < MAX_ROWS) {
      rows.push(this.createNumberedRow(disabled));
    }

    const remaining = MAX_ROWS - rows.length;
    if (remaining > 0) {
      rows.push(...this.resolveExtraRows().slice(0, remaining));
    }

    return rows;
  }

  private createNumberedRow(disabled: boolean): ActionRowBuilder<ButtonBuilder> {
    const total = this.embeds.length;
    const max = Math.min(5, this.numberedButtons);
    let start = Math.max(0, this.currentPage - Math.floor(max / 2));
    let end = Math.min(total, start + max);
    start = Math.max(0, end - max);

    const buttons = [];
    for (let i = start; i < end; i++) {
      buttons.push(
        new ButtonBuilder()
          .setCustomId(this.cid(`num:${i}`))
          .setLabel(String(i + 1))
          .setStyle(i === this.currentPage ? ButtonStyle.Primary : ButtonStyle.Secondary)
          .setDisabled(disabled || i === this.currentPage)
      );
    }
    return new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons);
  }

  private getComponents() {
    return this.assembleRows(false);
  }

  private getDisabledComponents() {
    return this.assembleRows(true);
  }

  private async sendViaInteraction(
    interaction: CommandInteraction | MessageComponentInteraction,
    payload: Awaited<ReturnType<Paginator['getPayload']>>
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
      time?: number;
      filter: (i: MessageComponentInteraction) => boolean;
    } = {
      filter: (i) => i.customId.startsWith(`${this.idPrefix}:${this.instanceId}:`),
    };

    if (this.timeout > 0 && Number.isFinite(this.timeout)) {
      options.idle = this.timeout;
    }
    if (this.maxDuration && this.maxDuration > 0) {
      options.time = this.maxDuration;
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
    await this.onUnauthorizedCb?.(interaction);
    if (this.silentUnauthorized) {
      try {
        if (!interaction.deferred && !interaction.replied) {
          await interaction.deferUpdate();
        }
      } catch (error) {
        this.reportError(error);
      }
      return;
    }
    const text =
      typeof this.unauthorizedOverride === 'function'
        ? this.unauthorizedOverride(interaction.user)
        : this.unauthorizedOverride ?? this.strings.unauthorized;

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

    if (this.paused) {
      if (interaction.deferred || interaction.replied) return;
      await interaction.reply({ content: this.strings.paused, ephemeral: true });
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

    if (action.startsWith('num:')) {
      await interaction.deferUpdate();
      await this.goToPage(Number.parseInt(action.slice(4), 10), interaction);
      return;
    }

    switch (action) {
      case 'first':
        await interaction.deferUpdate();
        await this.first(interaction);
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
        await this.last(interaction);
        break;
      case 'stop':
        if (this.confirmStop && Date.now() > this.stopArmedUntil) {
          this.stopArmedUntil = Date.now() + 10_000;
          await interaction.reply({ content: this.strings.confirmStop, ephemeral: true });
          return;
        }
        await interaction.deferUpdate();
        await this.endPagination('stop');
        break;
      case 'indicator':
        await this.openJumpModal(interaction);
        break;
      case 'search':
        await this.openSearchModal(interaction);
        break;
      default:
        break;
    }
  }

  private async openJumpModal(interaction: PaginationInteraction): Promise<void> {
    if (!this.jumpModal || !interaction.isButton()) return;

    const total = this.embeds.length;
    const vars = this.tokens();
    const title = (this.jumpModal.title ?? this.strings.jumpModalTitle).slice(0, 45);
    const label = (this.jumpModal.label ?? interpolate(this.strings.jumpModalLabel, vars)).slice(0, 45);
    const placeholder = (
      this.jumpModal.placeholder ?? interpolate(this.strings.jumpModalPlaceholder, vars)
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
          content: interpolate(this.jumpModal.invalid ?? this.strings.jumpModalInvalid, {
            total,
          }),
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

  private async openSearchModal(interaction: PaginationInteraction): Promise<void> {
    if (!interaction.isButton()) return;

    const modal = new ModalBuilder()
      .setCustomId(this.cid('search-modal'))
      .setTitle(this.strings.searchModalTitle.slice(0, 45))
      .addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId('query')
            .setLabel(this.strings.searchModalLabel.slice(0, 45))
            .setStyle(TextInputStyle.Short)
            .setPlaceholder(this.strings.searchModalPlaceholder.slice(0, 100))
            .setRequired(true)
            .setMaxLength(80)
        )
      );

    await interaction.showModal(modal);

    try {
      const submitted = await interaction.awaitModalSubmit({
        time: Math.min(this.timeout > 0 ? this.timeout : 30_000, 60_000),
        filter: (i) =>
          i.customId === this.cid('search-modal') && i.user.id === interaction.user.id,
      });

      const query = submitted.fields.getTextInputValue('query').trim().toLowerCase();
      const index = this.embeds.findIndex((embed) => {
        const title = embed.data.title?.toLowerCase() ?? '';
        const description = embed.data.description?.toLowerCase() ?? '';
        return title.includes(query) || description.includes(query);
      });

      if (index < 0) {
        await submitted.reply({
          content: interpolate(this.strings.searchNoResults, { query }),
          ephemeral: true,
        });
        return;
      }

      await submitted.deferUpdate();
      await this.goToPage(index, interaction);
    } catch {
      // User closed the modal or it timed out.
    }
  }

  private async updateMessage(): Promise<void> {
    if (!this.message || this.ended) return;
    try {
      await this.message.edit(await this.getPayload());
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
          await this.message.edit(await this.getPayload(true));
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

export async function paginate(
  target: PaginationTarget,
  options: PaginationOptions
): Promise<Paginator> {
  const paginator = new Paginator(options);
  await paginator.start(target);
  return paginator;
}

interface PresetResult {
  buttons?: Partial<PaginationButtons>;
  useSelectMenu?: boolean;
  buttonOrder?: ButtonKey[];
  hideButtonsIfSinglePage?: boolean;
}

function applyPreset(preset?: PaginationPreset): PresetResult {
  switch (preset) {
    case 'compact':
      return {
        buttons: {
          first: false,
          last: false,
          previous: true,
          next: true,
          stop: true,
          pageIndicator: true,
        },
        buttonOrder: ['previous', 'pageIndicator', 'next', 'stop'],
      };
    case 'minimal':
      return {
        buttons: {
          first: false,
          last: false,
          stop: false,
          previous: true,
          next: true,
          pageIndicator: false,
        },
        buttonOrder: ['previous', 'next'],
      };
    case 'select':
      return {
        useSelectMenu: true,
        buttons: {
          first: false,
          last: false,
          previous: false,
          next: false,
          stop: true,
          pageIndicator: false,
        },
        hideButtonsIfSinglePage: true,
      };
    default:
      return {};
  }
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

function resolveAutoFooter(
  value: PaginationOptions['autoFooter'],
  strings: LocaleStrings
): false | AutoFooterOptions {
  if (!value) return false;
  if (value === true) return { format: strings.pageLabel, append: false };
  return { format: value.format ?? strings.pageLabel, append: value.append ?? false };
}

function resolveNumbered(value: PaginationOptions['numberedButtons']): number {
  if (value === true) return 5;
  if (typeof value === 'number' && value > 0) return Math.min(5, Math.floor(value));
  return 0;
}

function resolveAutoTitle(value: PaginationOptions['autoTitle']): false | string {
  if (!value) return false;
  if (value === true) return '{title} ({page}/{total})';
  return value;
}

/**
 * Build pages from a list and start pagination in one call.
 *
 * @example
 * await paginateList(interaction, users, {
 *   itemsPerPage: 5,
 *   mapItem: (u, i) => `**${i + 1}.** ${u.name}`,
 *   embed: { title: 'Leaderboard' },
 *   authorId: interaction.user.id,
 * });
 */
export async function paginateList<T>(
  target: PaginationTarget,
  items: readonly T[],
  options: Omit<PaginationOptions, 'embeds'> & Omit<CreatePagesOptions<T>, 'items'> = {}
): Promise<Paginator> {
  const {
    itemsPerPage,
    mapItem,
    mapPage,
    separator,
    embed,
    emptyText,
    pageFooter,
    locale,
    ...pagination
  } = options;

  const pages = createPages({
    items,
    itemsPerPage,
    mapItem,
    mapPage,
    separator,
    embed,
    emptyText,
    pageFooter,
    locale,
  });

  return paginate(target, { ...pagination, embeds: pages, locale });
}
