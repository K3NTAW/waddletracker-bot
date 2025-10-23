import { ChatInputCommandInteraction, EmbedBuilder, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle } from 'discord.js';
import { CommandHandler, createErrorEmbed, createSuccessEmbed, handleApiError, getUserId, createScheduleModal } from './index';
import { apiClient } from '../../services/api-client';
import { ValidationError } from '../../types';

export class ScheduleHandler implements CommandHandler {
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      const subcommand = interaction.options.getSubcommand();
      const userId = getUserId(interaction);

      if (subcommand === 'set') {
        // Show modal for setting schedule
        const modal = createScheduleModal();
        await interaction.showModal(modal);

      } else if (subcommand === 'view') {
        await interaction.deferReply({ ephemeral: true });

        // For now, we'll create a mock schedule
        // In a real implementation, you'd call apiClient.getUserSchedule(userId)
        const mockSchedule = {
          days_of_week: ['Monday', 'Wednesday', 'Friday'],
          time: '18:00'
        };

        const embed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setTitle('📅 Your Gym Schedule')
          .setDescription('Here\'s your current gym schedule:')
          .addFields(
            {
              name: '📆 Days',
              value: mockSchedule.days_of_week.join(', '),
              inline: true
            },
            {
              name: '⏰ Time',
              value: mockSchedule.time,
              inline: true
            },
            {
              name: '🔔 Reminders',
              value: 'You\'ll receive reminders 30 minutes before your scheduled workout time.',
              inline: false
            }
          )
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

      } else if (subcommand === 'delete') {
        await interaction.deferReply({ ephemeral: true });

        // For now, we'll show a confirmation message
        // In a real implementation, you'd call apiClient to delete the schedule
        const embed = new EmbedBuilder()
          .setColor(0xff6b35)
          .setTitle('🗑️ Delete Schedule')
          .setDescription('Are you sure you want to delete your gym schedule?')
          .addFields(
            {
              name: '⚠️ Warning',
              value: 'This will stop all workout reminders. You can always set a new schedule later.',
              inline: false
            }
          )
          .setTimestamp();

        // Add confirmation buttons
        const row = new ActionRowBuilder<ButtonBuilder>()
          .addComponents(
            new ButtonBuilder()
              .setCustomId(`schedule_delete_confirm_${interaction.id}`)
              .setLabel('Yes, Delete')
              .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
              .setCustomId(`schedule_delete_cancel_${interaction.id}`)
              .setLabel('Cancel')
              .setStyle(ButtonStyle.Secondary)
          );

        await interaction.editReply({
          embeds: [embed],
          components: [row]
        });
      }

      // TODO: In a real implementation, you would:
      // 1. Handle the modal submission for 'set' subcommand
      // 2. Call apiClient.createSchedule() with the form data
      // 3. Call apiClient.getUserSchedule() for 'view' subcommand
      // 4. Call apiClient to delete schedule for 'delete' subcommand
      // 5. Set up automated reminders based on the schedule

    } catch (error) {
      await handleApiError(interaction, error);
    }
  }
}
