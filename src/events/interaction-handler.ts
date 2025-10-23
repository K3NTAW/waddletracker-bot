import { Interaction, ButtonInteraction, ModalSubmitInteraction } from 'discord.js';
import { commandHandlers } from '../commands/registry';
import logger from '../utils/logger';
import { createErrorEmbed } from '../commands/handlers';

export class InteractionHandler {
  async handleInteraction(interaction: Interaction): Promise<void> {
    try {
      if (interaction.isChatInputCommand()) {
        await this.handleSlashCommand(interaction);
      } else if (interaction.isButton()) {
        await this.handleButtonInteraction(interaction);
      } else if (interaction.isModalSubmit()) {
        await this.handleModalSubmit(interaction);
      }
    } catch (error) {
      logger.error('Interaction handler error:', error);
      
      const embed = createErrorEmbed(
        'Interaction Error',
        'An error occurred while processing your interaction. Please try again.'
      );

      if (interaction.isRepliable()) {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ embeds: [embed], ephemeral: true });
        } else {
          await interaction.reply({ embeds: [embed], ephemeral: true });
        }
      }
    }
  }

  private async handleSlashCommand(interaction: any): Promise<void> {
    const commandName = interaction.commandName;
    const handler = commandHandlers.get(commandName);

    if (!handler) {
      logger.warn(`Unknown command: ${commandName}`);
      return;
    }

    logger.info(`Executing command: ${commandName} by ${interaction.user.tag}`);
    await handler.execute(interaction);
  }

  private async handleButtonInteraction(interaction: ButtonInteraction): Promise<void> {
    const customId = interaction.customId;
    logger.info(`Button interaction: ${customId} by ${interaction.user.tag}`);

    // Handle different button types
    if (customId.startsWith('checkin_confirm_')) {
      await this.handleCheckinConfirm(interaction);
    } else if (customId.startsWith('checkin_cancel_')) {
      await this.handleCheckinCancel(interaction);
    } else if (customId.startsWith('cheer_send_')) {
      await this.handleCheerSend(interaction);
    } else if (customId.startsWith('cheer_cancel_')) {
      await this.handleCheerCancel(interaction);
    } else if (customId.startsWith('schedule_delete_confirm_')) {
      await this.handleScheduleDeleteConfirm(interaction);
    } else if (customId.startsWith('schedule_delete_cancel_')) {
      await this.handleScheduleDeleteCancel(interaction);
    } else if (customId.startsWith('page_')) {
      await this.handlePagination(interaction);
    } else {
      logger.warn(`Unknown button interaction: ${customId}`);
    }
  }

  private async handleModalSubmit(interaction: ModalSubmitInteraction): Promise<void> {
    const customId = interaction.customId;
    logger.info(`Modal submit: ${customId} by ${interaction.user.tag}`);

    if (customId === 'schedule_modal') {
      await this.handleScheduleModal(interaction);
    } else {
      logger.warn(`Unknown modal submit: ${customId}`);
    }
  }

  // Button handlers
  private async handleCheckinConfirm(interaction: ButtonInteraction): Promise<void> {
    await interaction.deferUpdate();
    
    const embed = createErrorEmbed(
      'Check-in Confirmed',
      'Your check-in has been recorded! (This is a demo - actual API integration needed)'
    );
    embed.setColor(0x00ff00);

    await interaction.editReply({
      embeds: [embed],
      components: []
    });
  }

  private async handleCheckinCancel(interaction: ButtonInteraction): Promise<void> {
    await interaction.deferUpdate();
    
    const embed = createErrorEmbed(
      'Check-in Cancelled',
      'Your check-in has been cancelled.'
    );

    await interaction.editReply({
      embeds: [embed],
      components: []
    });
  }

  private async handleCheerSend(interaction: ButtonInteraction): Promise<void> {
    await interaction.deferUpdate();
    
    const embed = createErrorEmbed(
      'Cheer Sent!',
      'Your cheer has been sent! (This is a demo - actual API integration needed)'
    );
    embed.setColor(0x00ff00);

    await interaction.editReply({
      embeds: [embed],
      components: []
    });
  }

  private async handleCheerCancel(interaction: ButtonInteraction): Promise<void> {
    await interaction.deferUpdate();
    
    const embed = createErrorEmbed(
      'Cheer Cancelled',
      'Your cheer has been cancelled.'
    );

    await interaction.editReply({
      embeds: [embed],
      components: []
    });
  }

  private async handleScheduleDeleteConfirm(interaction: ButtonInteraction): Promise<void> {
    await interaction.deferUpdate();
    
    const embed = createErrorEmbed(
      'Schedule Deleted',
      'Your gym schedule has been deleted. (This is a demo - actual API integration needed)'
    );
    embed.setColor(0x00ff00);

    await interaction.editReply({
      embeds: [embed],
      components: []
    });
  }

  private async handleScheduleDeleteCancel(interaction: ButtonInteraction): Promise<void> {
    await interaction.deferUpdate();
    
    const embed = createErrorEmbed(
      'Schedule Deletion Cancelled',
      'Your schedule deletion has been cancelled.'
    );

    await interaction.editReply({
      embeds: [embed],
      components: []
    });
  }

  private async handlePagination(interaction: ButtonInteraction): Promise<void> {
    await interaction.deferUpdate();
    
    const embed = createErrorEmbed(
      'Pagination',
      'Pagination feature coming soon! (This is a demo)'
    );

    await interaction.editReply({
      embeds: [embed],
      components: []
    });
  }

  // Modal handlers
  private async handleScheduleModal(interaction: ModalSubmitInteraction): Promise<void> {
    const days = interaction.fields.getTextInputValue('schedule_days');
    const time = interaction.fields.getTextInputValue('schedule_time');

    await interaction.deferReply({ ephemeral: true });

    // Validate input
    if (!days || !time) {
      const embed = createErrorEmbed(
        'Validation Error',
        'Please fill in all required fields.'
      );
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    // Validate time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      const embed = createErrorEmbed(
        'Invalid Time Format',
        'Please use 24-hour format (e.g., 18:00).'
      );
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    const embed = createErrorEmbed(
      'Schedule Set!',
      `Your gym schedule has been set!\n**Days:** ${days}\n**Time:** ${time}\n\n(This is a demo - actual API integration needed)`
    );
    embed.setColor(0x00ff00);

    await interaction.editReply({ embeds: [embed] });
  }
}
