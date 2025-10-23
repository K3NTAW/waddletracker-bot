import { ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { apiClient } from '../../services/api-client';
import logger from '../../utils/logger';
import { ApiError, ValidationError } from '../../types';

// Base command handler interface
export interface CommandHandler {
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

// Helper function to create error embeds
export function createErrorEmbed(title: string, description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0xff0000)
    .setTitle(`❌ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

// Helper function to create success embeds
export function createSuccessEmbed(title: string, description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0x00ff00)
    .setTitle(`✅ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

// Helper function to create info embeds
export function createInfoEmbed(title: string, description: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(`ℹ️ ${title}`)
    .setDescription(description)
    .setTimestamp();
}

// Helper function to handle API errors
export async function handleApiError(interaction: ChatInputCommandInteraction, error: unknown): Promise<void> {
  logger.error('Command error:', error);

  if (error instanceof ApiError) {
    const embed = createErrorEmbed(
      'API Error',
      `Failed to complete request: ${error.message}`
    );
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ embeds: [embed], ephemeral: true });
    } else {
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  } else if (error instanceof ValidationError) {
    const embed = createErrorEmbed(
      'Validation Error',
      error.message
    );
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ embeds: [embed], ephemeral: true });
    } else {
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  } else {
    const embed = createErrorEmbed(
      'Unexpected Error',
      'An unexpected error occurred. Please try again later.'
    );
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ embeds: [embed], ephemeral: true });
    } else {
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
}

// Helper function to get user ID from interaction
export function getUserId(interaction: ChatInputCommandInteraction): string {
  return interaction.user.id;
}

// Helper function to get target user ID from interaction
export function getTargetUserId(interaction: ChatInputCommandInteraction): string {
  const targetUser = interaction.options.getUser('user');
  return targetUser ? targetUser.id : interaction.user.id;
}

// Helper function to create confirmation buttons
export function createConfirmationButtons(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('confirm_yes')
        .setLabel('Yes')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('confirm_no')
        .setLabel('No')
        .setStyle(ButtonStyle.Danger)
    );
}

// Helper function to create pagination buttons
export function createPaginationButtons(currentPage: number, totalPages: number): ActionRowBuilder<ButtonBuilder>[] {
  const rows: ActionRowBuilder<ButtonBuilder>[] = [];
  
  if (totalPages <= 1) return rows;

  const row = new ActionRowBuilder<ButtonBuilder>();
  
  // Previous button
  if (currentPage > 1) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`page_${currentPage - 1}`)
        .setLabel('◀️ Previous')
        .setStyle(ButtonStyle.Primary)
    );
  }
  
  // Page info
  row.addComponents(
    new ButtonBuilder()
      .setCustomId('page_info')
      .setLabel(`${currentPage} / ${totalPages}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true)
  );
  
  // Next button
  if (currentPage < totalPages) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`page_${currentPage + 1}`)
        .setLabel('Next ▶️')
        .setStyle(ButtonStyle.Primary)
    );
  }
  
  rows.push(row);
  return rows;
}

// Helper function to create schedule modal
export function createScheduleModal(): ModalBuilder {
  const modal = new ModalBuilder()
    .setCustomId('schedule_modal')
    .setTitle('Set Gym Schedule');

  const daysInput = new TextInputBuilder()
    .setCustomId('schedule_days')
    .setLabel('Days of the week')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Monday,Wednesday,Friday')
    .setRequired(true)
    .setMaxLength(100);

  const timeInput = new TextInputBuilder()
    .setCustomId('schedule_time')
    .setLabel('Time (24-hour format)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('18:00')
    .setRequired(true)
    .setMaxLength(5);

  const actionRow1 = new ActionRowBuilder<TextInputBuilder>().addComponents(daysInput);
  const actionRow2 = new ActionRowBuilder<TextInputBuilder>().addComponents(timeInput);

  modal.addComponents(actionRow1, actionRow2);
  return modal;
}

// Helper function to format date
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Helper function to format streak
export function formatStreak(streak: number): string {
  if (streak === 0) return 'No streak';
  if (streak === 1) return '1 day';
  return `${streak} days`;
}

// Helper function to get status emoji
export function getStatusEmoji(status: 'went' | 'missed'): string {
  return status === 'went' ? '💪' : '😔';
}

// Helper function to get status color
export function getStatusColor(status: 'went' | 'missed'): number {
  return status === 'went' ? 0x00ff00 : 0xff0000;
}
