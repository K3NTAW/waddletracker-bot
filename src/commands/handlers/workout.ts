import { ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { CommandHandler, createErrorEmbed, getUserId } from './index';
import { apiClient } from '../../services/api-client';
import logger from '../../utils/logger';

export class WorkoutHandler implements CommandHandler {
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    // Defer reply immediately to prevent timeout
    try {
      await interaction.deferReply({ ephemeral: true });
    } catch (deferError) {
      logger.error('Failed to defer workout command:', deferError);
      return; // Can't continue without deferring
    }

    try {
      const userId = getUserId(interaction);
      const workoutType = interaction.options.getString('type', true);
      const notes = interaction.options.getString('notes');
      const photoUrl = interaction.options.getString('photo_url');
      const now = new Date().toISOString();

      logger.info(`Logging workout for user: ${userId}, type: ${workoutType}`);

      // Validate photo URL if provided
      if (photoUrl && !this.isValidUrl(photoUrl)) {
        const embed = new EmbedBuilder()
          .setColor(0xff0000)
          .setTitle('❌ Invalid Photo URL')
          .setDescription('Please provide a valid URL for your gym photo.')
          .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });
        return;
      }

      try {
        // Log workout using the check-in endpoint with status "went"
        const embedData = await apiClient.logCheckin({
          discord_id: userId,
          username: interaction.user.username,
          avatar_url: interaction.user.displayAvatarURL(),
          status: 'went',
          workout_type: workoutType,
          notes: notes || undefined,
          photo_url: photoUrl || undefined,
          date: now
        });

        const embed = new EmbedBuilder()
          .setColor(embedData.color || 0x00ff00)
          .setTitle(embedData.title || '💪 Workout Logged!')
          .setDescription(embedData.description || `**User:** <@${userId}>\n\nGreat workout! Keep up the momentum! 🔥`)
          .setThumbnail(interaction.user.displayAvatarURL())
          .setTimestamp();

        // Add fields if they exist
        if (embedData.fields && embedData.fields.length > 0) {
          embed.addFields(embedData.fields);
        } else {
          // Fallback fields
          embed.addFields(
            {
              name: '💪 Workout Type',
              value: workoutType,
              inline: true
            },
            {
              name: '📝 Notes',
              value: notes || 'No additional notes',
              inline: true
            },
            {
              name: '🔥 Keep Going!',
              value: 'Every workout counts towards your fitness goals!',
              inline: false
            }
          );
        }

        // Add footer if it exists
        if (embedData.footer) {
          embed.setFooter(embedData.footer);
        }

        await interaction.editReply({ embeds: [embed] });

      } catch (apiError: any) {
        logger.error('Workout API error:', apiError);
        
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
              .setDescription(registerEmbedData.description || `**User:** <@${userId}>\n\nYou need to register with WaddleTracker before you can log workouts.`)
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
                `You need to register with WaddleTracker before you can log workouts.\n` +
                `Click the "Register Now!" button below to get started!`
              )
              .addFields({
                name: '🔗 What You\'ll Get',
                value: '• Track your workouts\n• Log different workout types\n• Build streaks and achievements\n• Get motivation from the community',
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
            .setTitle('❌ Workout Error')
            .setDescription(
              `**User:** <@${userId}>\n\n` +
              `Unable to log your workout. This could be due to:\n` +
              `• Network connectivity issues\n` +
              `• Server maintenance\n` +
              `• Account synchronization delay\n\n` +
              `**Error:** ${apiError.message || 'Unknown error'}\n\n` +
              `Please try again in a few moments. If the problem persists, contact support.`
            )
            .addFields({
              name: '🔧 Troubleshooting',
              value: '• Try `/workout` again in a few seconds\n• Check if other commands work\n• Contact support if the issue continues',
              inline: false
            })
            .setThumbnail(interaction.user.displayAvatarURL())
            .setTimestamp();
          
          await interaction.editReply({ embeds: [embed] });
        }
      }

    } catch (error: any) {
      logger.error('Workout command error:', error);
      
      try {
        const embed = new EmbedBuilder()
          .setColor(0xff0000)
          .setTitle('❌ Workout Error')
          .setDescription(
            `Unable to log your workout. This could be due to:\n` +
            `• Network connectivity issues\n` +
            `• Server maintenance\n` +
            `• Account synchronization delay\n\n` +
            `**Error:** ${error.message || 'Unknown error'}\n\n` +
            `Please try again in a few moments. If the problem persists, contact support.`
          )
          .addFields({
            name: '🔧 Troubleshooting',
            value: '• Try `/workout` again in a few seconds\n• Check if other commands work\n• Contact support if the issue continues',
            inline: false
          })
          .setThumbnail(interaction.user.displayAvatarURL())
          .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });
      } catch (errorHandlingError) {
        logger.error('Failed to send workout error message:', errorHandlingError);
        await createErrorEmbed('Workout Error', 'An unexpected error occurred. Please try again later.');
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
