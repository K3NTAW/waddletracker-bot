import { ChatInputCommandInteraction, EmbedBuilder, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle } from 'discord.js';
import { CommandHandler, createErrorEmbed, createSuccessEmbed, handleApiError, getUserId, createScheduleModal } from './index';
import { apiClient } from '../../services/api-client';
import { ValidationError } from '../../types';
import logger from '../../utils/logger';

export class ScheduleHandler implements CommandHandler {
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      const subcommand = interaction.options.getSubcommand();
      const userId = getUserId(interaction);

      if (subcommand === 'rotation') {
        await this.handleRotationSchedule(interaction, userId);
      } else if (subcommand === 'weekly') {
        await this.handleWeeklySchedule(interaction, userId);
      } else if (subcommand === 'today') {
        await this.handleTodaySchedule(interaction, userId);
      } else if (subcommand === 'view') {
        await this.handleViewSchedule(interaction, userId);
      } else if (subcommand === 'delete') {
        await this.handleDeleteSchedule(interaction, userId);
      } else if (subcommand === 'set') {
        // Show modal for setting schedule
        const modal = createScheduleModal();
        await interaction.showModal(modal);

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

  private async handleRotationSchedule(interaction: ChatInputCommandInteraction, userId: string): Promise<void> {
    const pattern = interaction.options.getString('pattern', true);
    const time = interaction.options.getString('time') || '09:00';
    const timezone = interaction.options.getString('timezone') || 'UTC';

    try {
      const result = await apiClient.createFlexibleSchedule({
        discord_id: userId,
        schedule_type: 'rotating',
        rotation_pattern: pattern,
        timezone,
        reminder_time: time,
        rest_days_allowed: true
      });

      const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle('✅ Rotation Schedule Created!')
        .setDescription(result.message)
        .addFields(
          {
            name: '🔄 Pattern',
            value: pattern,
            inline: true
          },
          {
            name: '⏰ Reminder Time',
            value: time,
            inline: true
          },
          {
            name: '🌍 Timezone',
            value: timezone,
            inline: true
          },
          {
            name: '📅 Today\'s Activity',
            value: result.today_scheduled_type === 'workout' ? 'Workout Day 💪' : 
                   result.today_scheduled_type === 'rest' ? 'Rest Day 😴' : 'No activity scheduled',
            inline: false
          }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      logger.error('Rotation schedule error:', error);
      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('❌ Schedule Creation Failed')
        .setDescription('Unable to create your rotation schedule. Please try again later.')
        .setTimestamp();
      
      await interaction.editReply({ embeds: [embed] });
    }
  }

  private async handleWeeklySchedule(interaction: ChatInputCommandInteraction, userId: string): Promise<void> {
    const days = interaction.options.getString('days', true);
    const time = interaction.options.getString('time') || '09:00';
    const timezone = interaction.options.getString('timezone') || 'UTC';

    try {
      const workoutDays = days.split(',').map(day => day.trim());
      
      const result = await apiClient.createFlexibleSchedule({
        discord_id: userId,
        schedule_type: 'weekly',
        workout_days: workoutDays,
        timezone,
        reminder_time: time,
        rest_days_allowed: true
      });

      const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle('✅ Weekly Schedule Created!')
        .setDescription(result.message)
        .addFields(
          {
            name: '📅 Workout Days',
            value: workoutDays.join(', '),
            inline: true
          },
          {
            name: '⏰ Reminder Time',
            value: time,
            inline: true
          },
          {
            name: '🌍 Timezone',
            value: timezone,
            inline: true
          },
          {
            name: '📅 Today\'s Activity',
            value: result.today_scheduled_type === 'workout' ? 'Workout Day 💪' : 
                   result.today_scheduled_type === 'rest' ? 'Rest Day 😴' : 'No activity scheduled',
            inline: false
          }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      logger.error('Weekly schedule error:', error);
      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('❌ Schedule Creation Failed')
        .setDescription('Unable to create your weekly schedule. Please try again later.')
        .setTimestamp();
      
      await interaction.editReply({ embeds: [embed] });
    }
  }

  private async handleTodaySchedule(interaction: ChatInputCommandInteraction, userId: string): Promise<void> {
    try {
      const result = await apiClient.getTodaySchedule(userId);

      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle('📅 Today\'s Schedule')
        .setDescription(result.message || 'Here\'s what\'s scheduled for today:')
        .addFields(
          {
            name: '🎯 Activity Type',
            value: result.today_scheduled_type === 'workout' ? 'Workout Day 💪' : 
                   result.today_scheduled_type === 'rest' ? 'Rest Day 😴' : 'No activity scheduled',
            inline: true
          },
          {
            name: '💡 What This Means',
            value: result.today_scheduled_type === 'workout' ? 
                   'Time to hit the gym! Use `/workout` or `/checkin` to log your session.' :
                   result.today_scheduled_type === 'rest' ? 
                   'Enjoy your recovery day! Rest is part of the journey. Use `/rest-day` to log it.' :
                   'No specific activity scheduled. You can still log workouts or rest days!',
            inline: false
          }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      logger.error('Today schedule error:', error);
      const embed = new EmbedBuilder()
        .setColor(0xffa500)
        .setTitle('📅 No Schedule Set')
        .setDescription('You don\'t have a schedule set up yet. Create one to get smart reminders!')
        .addFields({
          name: '🔗 Quick Setup',
          value: '• `/schedule rotation` - Create a rotation pattern\n• `/schedule weekly` - Set specific days\n• `/schedule view` - See your current schedule',
          inline: false
        })
        .setTimestamp();
      
      await interaction.editReply({ embeds: [embed] });
    }
  }

  private async handleViewSchedule(interaction: ChatInputCommandInteraction, userId: string): Promise<void> {
    try {
      const schedule = await apiClient.getSchedule(userId);

      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle('📅 Your Current Schedule')
        .setDescription('Here\'s your current gym schedule:')
        .addFields(
          {
            name: '🔄 Schedule Type',
            value: schedule.schedule_type || 'Not set',
            inline: true
          },
          {
            name: '📅 Pattern/Days',
            value: schedule.rotation_pattern || schedule.workout_days?.join(', ') || 'Not set',
            inline: true
          },
          {
            name: '⏰ Reminder Time',
            value: schedule.reminder_time || 'Not set',
            inline: true
          },
          {
            name: '🌍 Timezone',
            value: schedule.timezone || 'UTC',
            inline: true
          },
          {
            name: '😴 Rest Days Allowed',
            value: schedule.rest_days_allowed ? 'Yes ✅' : 'No ❌',
            inline: true
          }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      logger.error('View schedule error:', error);
      const embed = new EmbedBuilder()
        .setColor(0xffa500)
        .setTitle('📅 No Schedule Set')
        .setDescription('You don\'t have a schedule set up yet. Create one to get smart reminders!')
        .addFields({
          name: '🔗 Quick Setup',
          value: '• `/schedule rotation` - Create a rotation pattern\n• `/schedule weekly` - Set specific days\n• `/schedule today` - Check today\'s activity',
          inline: false
        })
        .setTimestamp();
      
      await interaction.editReply({ embeds: [embed] });
    }
  }

  private async handleDeleteSchedule(interaction: ChatInputCommandInteraction, userId: string): Promise<void> {
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
}
