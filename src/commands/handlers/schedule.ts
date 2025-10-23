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

        try {
          // Get real schedule data from API
          const schedule = await apiClient.getUserSchedule(userId);

          const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('📅 Your Gym Schedule')
            .setDescription('Here\'s your current gym schedule:')
            .addFields(
              {
                name: '📆 Days',
                value: schedule.days_of_week.join(', '),
                inline: true
              },
              {
                name: '⏰ Time',
                value: schedule.time,
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

        } catch (apiError) {
          // If user doesn't have a schedule, show setup prompt
          const embed = new EmbedBuilder()
            .setColor(0xffa500)
            .setTitle('📅 No Schedule Set')
            .setDescription(
              `**User:** <@${userId}>\n\n` +
              `You haven't set up your gym schedule yet.\n` +
              `Use \`/schedule set\` to create your workout schedule and get automated reminders!`
            )
            .addFields({
              name: '🔗 How to Set Up',
              value: '1. Use `/schedule set` command\n2. Choose your workout days\n3. Set your preferred time\n4. Get automated reminders!',
              inline: false
            })
            .setThumbnail(interaction.user.displayAvatarURL())
            .setTimestamp();

          await interaction.editReply({ embeds: [embed] });
        }

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
