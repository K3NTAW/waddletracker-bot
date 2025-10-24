import { ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { CommandHandler, createErrorEmbed, createSuccessEmbed, handleApiError, getUserId, createConfirmationButtons, getStatusEmoji, getStatusColor } from './index';
import { apiClient } from '../../services/api-client';
import { ValidationError } from '../../types';
import logger from '../../utils/logger';

export class CheckinHandler implements CommandHandler {
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      const userId = getUserId(interaction);
      const now = new Date().toISOString();

      // First, check if user has a schedule and what today's type is (with timeout)
      let todaySchedule = null;
      try {
        todaySchedule = await Promise.race([
          apiClient.getTodaySchedule(userId),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Schedule API timeout')), 1000)
          )
        ]) as any;
      } catch (error: any) {
        logger.info(`No schedule found for user ${userId} or timeout, proceeding with manual check-in:`, error.message);
      }

      // Smart check-in logic based on schedule
      if (todaySchedule?.today_scheduled_type === 'rest') {
        // Today is a scheduled rest day - show rest day message
        const embed = new EmbedBuilder()
          .setColor(0xffa500) // Orange for rest days
          .setTitle('😴 Rest Day Scheduled!')
          .setDescription(
            `**User:** <@${userId}>\n\n` +
            `Today is a scheduled rest day - no check-in needed!\n` +
            `Your streak continues automatically. Enjoy your recovery! 💤`
          )
          .addFields(
            {
              name: '📅 Today\'s Schedule',
              value: 'Rest Day (automatic)',
              inline: true
            },
            {
              name: '🔥 Streak Status',
              value: 'Continues automatically with rest day',
              inline: true
            },
            {
              name: '💡 What This Means',
              value: 'Rest is part of your fitness journey! Your streak won\'t break on scheduled rest days.',
              inline: false
            }
          )
          .setThumbnail(interaction.user.displayAvatarURL())
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
        return;
      }

      // Get user input for check-in
      const status = interaction.options.getString('status', true) as 'went' | 'missed' | 'rest';
      const workoutType = interaction.options.getString('workout_type');
      const notes = interaction.options.getString('notes');
      const photoUrl = interaction.options.getString('photo_url');

      // Validate status
      if (!['went', 'missed', 'rest'].includes(status)) {
        throw new ValidationError('Status must be "went", "missed", or "rest"');
      }

      // Validate photo URL if provided
      if (photoUrl && !this.isValidUrl(photoUrl)) {
        throw new ValidationError('Invalid photo URL format');
      }

      try {
        // Log the check-in with the new rest day support
        const embedData = await apiClient.logCheckin({
          discord_id: userId,
          username: interaction.user.username,
          avatar_url: interaction.user.displayAvatarURL(),
          status,
          workout_type: workoutType || undefined,
          notes: notes || undefined,
          photo_url: photoUrl || undefined,
          date: now
        });

        const embed = new EmbedBuilder()
          .setColor(embedData.color || 0x00ff00)
          .setTitle(embedData.title || '🏋️ Check-in Logged!')
          .setDescription(embedData.description || `**User:** <@${userId}>`)
          .setThumbnail(interaction.user.displayAvatarURL())
          .setTimestamp();

        // Add fields if they exist
        if (embedData.fields) {
          embed.addFields(embedData.fields);
        }

        // Add footer if it exists
        if (embedData.footer) {
          embed.setFooter(embedData.footer);
        }

        await interaction.editReply({ embeds: [embed] });

      } catch (apiError: any) {
        logger.error('Check-in API error:', apiError);
        
        // Handle different types of API errors
        if (apiError.statusCode === 400 && apiError.message?.includes('already checked in')) {
          // User has already checked in today
          const embed = new EmbedBuilder()
            .setColor(0xffa500)
            .setTitle('⏰ Already Checked In!')
            .setDescription(`**User:** <@${userId}>\n\nYou've already logged a check-in for today. Come back tomorrow!`)
            .addFields({
              name: '💡 Tip',
              value: 'You can only check in once per day. Try again tomorrow!',
              inline: false
            })
            .setThumbnail(interaction.user.displayAvatarURL())
            .setTimestamp();
          
          await interaction.editReply({ embeds: [embed] });
          return;
        }
        
        // If user doesn't exist or other registration-related errors, show registration embed
        if (apiError.statusCode === 404 || 
            (apiError.statusCode === 400 && (apiError.message?.includes('not registered') || apiError.message?.includes('User not found')))) {
          try {
            const registerEmbedData = await apiClient.getRegisterEmbed({
              discord_id: userId,
              username: interaction.user.username,
              avatar_url: interaction.user.displayAvatarURL()
            });

          const embed = new EmbedBuilder()
            .setColor(registerEmbedData.color || 0xffa500)
            .setTitle(registerEmbedData.title || '🔐 Registration Required')
            .setDescription(registerEmbedData.description || `**User:** <@${userId}>\n\nYou need to register with WaddleTracker before you can log check-ins.`)
            .setThumbnail(interaction.user.displayAvatarURL())
            .setTimestamp();

          // Add fields if they exist
          if (registerEmbedData.fields) {
            embed.addFields(registerEmbedData.fields);
          }

          // Add footer if it exists
          if (registerEmbedData.footer) {
            embed.setFooter(registerEmbedData.footer);
          }

          // Add registration buttons
          const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
              new ButtonBuilder()
                .setCustomId(`register_${userId}`)
                .setLabel('Register Now!')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🚀'),
              new ButtonBuilder()
                .setCustomId(`learn_more_${userId}`)
                .setLabel('Learn More')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('ℹ️')
            );

          await interaction.editReply({ 
            embeds: [embed], 
            components: [row] 
          });

        } catch (registerError) {
          // Fallback if registration embed fails
          const embed = new EmbedBuilder()
            .setColor(0xffa500)
            .setTitle('🔐 Registration Required')
            .setDescription(
              `**User:** <@${userId}>\n\n` +
              `You need to register with WaddleTracker before you can log check-ins.\n` +
              `Click the "Register Now!" button below to get started!`
            )
            .addFields({
              name: '🔗 What You\'ll Get',
              value: '• Track your gym sessions\n• Build streaks and achievements\n• Get motivation from the community\n• View your progress analytics',
              inline: false
            })
            .setThumbnail(interaction.user.displayAvatarURL())
            .setTimestamp();

          // Add registration buttons
          const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
              new ButtonBuilder()
                .setCustomId(`register_${userId}`)
                .setLabel('Register Now!')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🚀'),
              new ButtonBuilder()
                .setCustomId(`learn_more_${userId}`)
                .setLabel('Learn More')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('ℹ️')
            );

          await interaction.editReply({ 
            embeds: [embed], 
            components: [row] 
          });
        }
        } else {
          // Handle other API errors
          const embed = new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle('❌ Check-in Error')
            .setDescription(
              `**User:** <@${userId}>\n\n` +
              `Unable to log your check-in. This could be due to:\n` +
              `• Network connectivity issues\n` +
              `• Server maintenance\n` +
              `• Account synchronization delay\n\n` +
              `**Error:** ${apiError.message || 'Unknown error'}\n\n` +
              `Please try again in a few moments. If the problem persists, contact support.`
            )
            .addFields({
              name: '🔧 Troubleshooting',
              value: '• Try `/checkin` again in a few seconds\n• Check if other commands work\n• Contact support if the issue continues',
              inline: false
            })
            .setThumbnail(interaction.user.displayAvatarURL())
            .setTimestamp();
          
          await interaction.editReply({ embeds: [embed] });
        }
      }

    } catch (error: any) {
      logger.error('Checkin command error:', error);
      
      try {
        const embed = new EmbedBuilder()
          .setColor(0xff0000)
          .setTitle('❌ Check-in Error')
          .setDescription(
            `Unable to log your check-in. This could be due to:\n` +
            `• Network connectivity issues\n` +
            `• Server maintenance\n` +
            `• Account synchronization delay\n\n` +
            `**Error:** ${error.message || 'Unknown error'}\n\n` +
            `Please try again in a few moments. If the problem persists, contact support.`
          )
          .addFields({
            name: '🔧 Troubleshooting',
            value: '• Try `/checkin` again in a few seconds\n• Check if other commands work\n• Contact support if the issue continues',
            inline: false
          })
          .setThumbnail(interaction.user.displayAvatarURL())
          .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });
      } catch (errorHandlingError) {
        logger.error('Failed to send checkin error message:', errorHandlingError);
        await handleApiError(interaction, error);
      }
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
