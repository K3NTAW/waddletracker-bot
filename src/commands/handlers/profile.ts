import { ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { CommandHandler, createErrorEmbed, handleApiError, getTargetUserId } from './index';
import { apiClient } from '../../services/api-client';
import logger from '../../utils/logger';

export class ProfileHandler implements CommandHandler {
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    // Defer reply immediately to prevent timeout
    await interaction.deferReply();
    logger.info('Profile command deferred successfully');
    
    try {
      const targetUserId = getTargetUserId(interaction);
      const isSelf = targetUserId === interaction.user.id;
      logger.info(`Target user ID: ${targetUserId}, isSelf: ${isSelf}`);

      try {
        // Get profile embed from API
        logger.info(`Fetching profile for Discord ID: ${targetUserId}`);
        const embedData = await apiClient.getProfileEmbed(targetUserId);
        logger.info(`Profile API response:`, JSON.stringify(embedData, null, 2));
        
        const embed = new EmbedBuilder()
          .setColor(embedData.color || 0x0099ff)
          .setTitle(embedData.title || `🏋️ ${isSelf ? 'Your' : 'User'} Profile`)
          .setDescription(embedData.description || `**User:** <@${targetUserId}>`)
          .setThumbnail(interaction.client.users.cache.get(targetUserId)?.displayAvatarURL() || interaction.user.displayAvatarURL())
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
        logger.error('Profile API error:', apiError);
        
        // Check if it's a user not found error (404 or 400 with specific messages)
        if (apiError.statusCode === 404 || (apiError.statusCode === 400 && (apiError.message?.includes('User ID is required') || apiError.message?.includes('User not found')))) {
          // If user doesn't exist, show registration embed with button
          try {
            const registerEmbedData = await apiClient.getRegisterEmbed({
              discord_id: targetUserId,
              username: interaction.user.username,
              avatar_url: interaction.user.displayAvatarURL()
            });

          const embed = new EmbedBuilder()
            .setColor(registerEmbedData.color || 0xffa500)
            .setTitle(registerEmbedData.title || '👤 Registration Required')
            .setDescription(registerEmbedData.description || `**User:** <@${targetUserId}>\n\nThis user needs to register with WaddleTracker to use the bot features.`)
            .setThumbnail(interaction.client.users.cache.get(targetUserId)?.displayAvatarURL() || interaction.user.displayAvatarURL())
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
                  .setCustomId(`register_${targetUserId}`)
                  .setLabel('Register Now!')
                  .setStyle(ButtonStyle.Success)
                  .setEmoji('🚀'),
                new ButtonBuilder()
                  .setCustomId(`learn_more_${targetUserId}`)
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
            .setTitle('👤 Registration Required')
            .setDescription(
              `**User:** <@${targetUserId}>\n\n` +
              `This user needs to register with WaddleTracker to use the bot features.\n` +
              `Click the "Register Now!" button below to get started!`
            )
            .addFields({
              name: '🔗 What You\'ll Get',
              value: '• Track your gym sessions\n• Build streaks and achievements\n• Get motivation from the community\n• View your progress analytics',
              inline: false
            })
            .setThumbnail(interaction.client.users.cache.get(targetUserId)?.displayAvatarURL() || interaction.user.displayAvatarURL())
            .setTimestamp();

            // Add registration buttons
            const row = new ActionRowBuilder<ButtonBuilder>()
              .addComponents(
                new ButtonBuilder()
                  .setCustomId(`register_${targetUserId}`)
                  .setLabel('Register Now!')
                  .setStyle(ButtonStyle.Success)
                  .setEmoji('🚀'),
                new ButtonBuilder()
                  .setCustomId(`learn_more_${targetUserId}`)
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
            .setTitle('❌ Profile Error')
            .setDescription(
              `**User:** <@${targetUserId}>\n\n` +
              `Unable to load profile: ${apiError.message || 'Unknown error'}\n` +
              `Please try again later.`
            )
            .setTimestamp();

          await interaction.editReply({ embeds: [embed] });
        }
      }

    } catch (error: any) {
      logger.error('Profile command error:', error);
      
      const targetUserId = getTargetUserId(interaction);
      
      // Since we already deferred, use editReply instead of reply
      try {
        const embed = new EmbedBuilder()
          .setColor(0xff0000)
          .setTitle('❌ Profile Error')
          .setDescription(
            `**User:** <@${targetUserId}>\n\n` +
            `Unable to load profile data. This could be due to:\n` +
            `• Network connectivity issues\n` +
            `• Server maintenance\n` +
            `• Account synchronization delay\n\n` +
            `**Error:** ${error.message || 'Unknown error'}\n\n` +
            `Please try again in a few moments. If the problem persists, contact support.`
          )
          .addFields({
            name: '🔧 Troubleshooting',
            value: '• Try `/profile` again in a few seconds\n• Check if other commands work\n• Contact support if the issue continues',
            inline: false
          })
          .setThumbnail(interaction.client.users.cache.get(targetUserId)?.displayAvatarURL() || interaction.user.displayAvatarURL())
          .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });
      } catch (finalError) {
        logger.error('Failed to send error message:', finalError);
        
        // Last resort - try to send a simple error
        try {
          const embed = new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle('❌ Error')
            .setDescription('An unexpected error occurred. Please try again later.')
            .setTimestamp();
          
          await interaction.editReply({ embeds: [embed] });
        } catch (lastError) {
          logger.error('Complete failure to send error message:', lastError);
        }
      }
    }
  }
}
