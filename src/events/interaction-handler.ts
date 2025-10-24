import { 
  Interaction, 
  ButtonInteraction, 
  ModalSubmitInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js';
import { commandHandlers } from '../commands/registry';
import logger from '../utils/logger';
import { createErrorEmbed } from '../commands/handlers';
import { apiClient } from '../services/api-client';

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
      
      // Only try to reply if the interaction hasn't been handled yet
      if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
        try {
          const embed = createErrorEmbed(
            'Interaction Error',
            'An error occurred while processing your interaction. Please try again.'
          );
          
          await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (replyError) {
          logger.error('Failed to send interaction error reply:', replyError);
        }
      } else {
        logger.warn('Cannot reply to interaction - already handled or not repliable');
      }
    }
  }

  private async handleSlashCommand(interaction: any): Promise<void> {
    const startTime = Date.now();
    const commandName = interaction.commandName;
    const handler = commandHandlers.get(commandName);

    if (!handler) {
      logger.warn(`Unknown command: ${commandName}`);
      return;
    }

    logger.info(`Executing command: ${commandName} by ${interaction.user.tag} at ${new Date().toISOString()}`);
    
    try {
      await handler.execute(interaction);
      const duration = Date.now() - startTime;
      logger.info(`Command ${commandName} completed in ${duration}ms`);
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`Command ${commandName} failed after ${duration}ms:`, error);
      throw error;
    }
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
    } else if (customId.startsWith('register_')) {
      await this.handleRegistration(interaction);
    } else if (customId.startsWith('learn_more_')) {
      await this.handleLearnMore(interaction);
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
    try {
      await interaction.deferUpdate();
      
      const userId = interaction.user.id;
      
      // Call the real API to delete the schedule
      const result = await apiClient.deleteSchedule(userId);
      
      const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle('✅ Schedule Deleted')
        .setDescription(
          `**User:** <@${userId}>\n\n` +
          `${result.message}\n` +
          `You can create a new schedule anytime using \`/schedule rotation\` or \`/schedule weekly\`.`
        )
        .addFields({
          name: '🔗 Create New Schedule',
          value: '• `/schedule rotation` - Create a rotation pattern\n• `/schedule weekly` - Set specific days\n• `/schedule view` - View your current schedule',
          inline: false
        })
        .setThumbnail(interaction.user.displayAvatarURL())
        .setTimestamp();

      await interaction.editReply({
        embeds: [embed],
        components: []
      });
      
      logger.info(`Schedule deleted for user: ${userId}`);
      
    } catch (error) {
      logger.error('Schedule delete confirmation error:', error);
      const embed = createErrorEmbed(
        'Delete Error',
        'An error occurred while deleting your schedule. Please try again.'
      );
      await interaction.editReply({ embeds: [embed], components: [] });
    }
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
    try {
      await interaction.deferUpdate();
      
      const customId = interaction.customId;
      const page = parseInt(customId.replace('page_', ''));
      
      if (isNaN(page)) {
        logger.warn(`Invalid page number in pagination: ${customId}`);
        return;
      }

      // Extract context from the original message to determine what we're paginating
      const originalEmbed = interaction.message.embeds[0];
      if (!originalEmbed) {
        logger.warn('No original embed found for pagination');
        return;
      }

      // Determine the command type based on embed title
      const title = originalEmbed.title || '';
      let commandType = '';
      let targetUserId = '';

      if (title.includes('Photo Gallery')) {
        commandType = 'gallery';
        // Extract user ID from description
        const description = originalEmbed.description || '';
        const userMatch = description.match(/<@(\d+)>/);
        targetUserId = userMatch ? userMatch[1] : interaction.user.id;
      } else if (title.includes('Notifications')) {
        commandType = 'notifications';
        targetUserId = interaction.user.id;
      } else if (title.includes('Leaderboard')) {
        commandType = 'leaderboard';
      }

      // Handle pagination based on command type
      if (commandType === 'gallery') {
        await this.handleGalleryPagination(interaction, targetUserId, page);
      } else if (commandType === 'notifications') {
        await this.handleNotificationsPagination(interaction, targetUserId, page);
      } else if (commandType === 'leaderboard') {
        await this.handleLeaderboardPagination(interaction, page);
      } else {
        logger.warn(`Unknown pagination context: ${title}`);
      }

    } catch (error) {
      logger.error('Pagination error:', error);
      const embed = createErrorEmbed(
        'Pagination Error',
        'An error occurred while loading the page. Please try again.'
      );
      await interaction.editReply({ embeds: [embed], components: [] });
    }
  }

  private async handleRegistration(interaction: ButtonInteraction): Promise<void> {
    try {
      await interaction.deferUpdate();

      const customId = interaction.customId;
      const userId = customId.replace('register_', '');

      // Register the user
      try {
        const registrationData = {
          discord_id: userId,
          username: interaction.user.username,
          avatar_url: interaction.user.displayAvatarURL()
        };
        
        logger.info('Registration data:', registrationData);
        const result = await apiClient.registerUser(registrationData);
        logger.info('Registration result:', result);

        if (result.success) {
        const embed = new EmbedBuilder()
          .setColor(0x00ff00)
          .setTitle('🎉 Welcome to WaddleTracker!')
          .setDescription(
            `**User:** <@${userId}>\n\n` +
            `Congratulations! You've been successfully registered with WaddleTracker.\n` +
            `You can now use all bot features!`
          )
          .addFields({
            name: '🚀 What\'s Next?',
            value: '• Use `/checkin` to log your gym sessions\n• Try `/profile` to see your stats\n• Use `/streak` to track your progress\n• Send `/cheer` to motivate friends!',
            inline: false
          })
          .setThumbnail(interaction.user.displayAvatarURL())
          .setTimestamp();

        await interaction.editReply({
          embeds: [embed],
          components: []
        });
      } else {
        const embed = new EmbedBuilder()
          .setColor(0xff0000)
          .setTitle('❌ Registration Failed')
          .setDescription(
            `**User:** <@${userId}>\n\n` +
            `Registration failed: ${result.message}\n` +
            `Please try again or contact support if the issue persists.`
          )
          .setTimestamp();

        await interaction.editReply({
          embeds: [embed],
          components: []
        });
      }
      } catch (apiError: any) {
        // Handle case where API returns 400 but user is actually registered
        if (apiError.statusCode === 400 && apiError.message?.includes('registered successfully')) {
          const embed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('🎉 Welcome to WaddleTracker!')
            .setDescription(
              `**User:** <@${userId}>\n\n` +
              `Congratulations! You've been successfully registered with WaddleTracker.\n` +
              `You can now use all bot features!`
            )
            .addFields({
              name: '🚀 What\'s Next?',
              value: '• Use `/checkin` to log your gym sessions\n• Try `/profile` to see your stats\n• Use `/streak` to track your progress\n• Send `/cheer` to motivate friends!',
              inline: false
            })
            .setThumbnail(interaction.user.displayAvatarURL())
            .setTimestamp();

          await interaction.editReply({
            embeds: [embed],
            components: []
          });
        } else {
          // Handle other errors
          const embed = new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle('❌ Registration Error')
            .setDescription(
              `**User:** <@${userId}>\n\n` +
              `Registration failed: ${apiError.message || 'Unknown error'}\n` +
              `Please try again or contact support if the issue persists.`
            )
            .setTimestamp();

          await interaction.editReply({
            embeds: [embed],
            components: []
          });
        }
      }
    } catch (error: any) {
      logger.error('Registration error:', error);
      
      const customId = interaction.customId;
      const userId = customId.replace('register_', '');
      
      // Handle specific error cases
      if (error.statusCode === 400 && error.message?.includes('already registered')) {
        const embed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setTitle('✅ Already Registered!')
          .setDescription(
            `**User:** <@${userId}>\n\n` +
            `You're already registered with WaddleTracker!\n` +
            `You can now use all bot features.`
          )
          .addFields({
            name: '🚀 Ready to Go!',
            value: '• Use `/checkin` to log your gym sessions\n• Try `/profile` to see your stats\n• Use `/streak` to track your progress\n• Send `/cheer` to motivate friends!',
            inline: false
          })
          .setThumbnail(interaction.user.displayAvatarURL())
          .setTimestamp();

        await interaction.editReply({
          embeds: [embed],
          components: []
        });
      } else {
        const embed = new EmbedBuilder()
          .setColor(0xff0000)
          .setTitle('❌ Registration Error')
          .setDescription(
            `An error occurred during registration: ${error.message || 'Unknown error'}\n\n` +
            `Please try again later or contact support if the problem persists.`
          )
          .setTimestamp();

        await interaction.editReply({
          embeds: [embed],
          components: []
        });
      }
    }
  }

  private async handleLearnMore(interaction: ButtonInteraction): Promise<void> {
    await interaction.deferUpdate();
    
    const customId = interaction.customId;
    const userId = customId.replace('learn_more_', '');

    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('ℹ️ About WaddleTracker')
      .setDescription(
        `**User:** <@${userId}>\n\n` +
        `WaddleTracker is a fitness accountability platform that helps you stay motivated and track your gym progress.`
      )
      .addFields(
        {
          name: '🏋️ Features',
          value: '• Log gym check-ins with photos\n• Track streaks and achievements\n• Get motivation from the community\n• View detailed analytics',
          inline: false
        },
        {
          name: '🎯 Benefits',
          value: '• Stay accountable to your fitness goals\n• Build consistent workout habits\n• Connect with like-minded people\n• Celebrate your progress',
          inline: false
        },
        {
          name: '🚀 Ready to Start?',
          value: 'Click "Register Now!" to join the WaddleTracker community!',
          inline: false
        }
      )
      .setThumbnail(interaction.user.displayAvatarURL())
      .setTimestamp();

    // Add registration buttons
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`register_${userId}`)
          .setLabel('Register Now!')
          .setStyle(ButtonStyle.Success)
          .setEmoji('🚀')
      );

    await interaction.editReply({
      embeds: [embed],
      components: [row]
    });
  }

  // Modal handlers
  private async handleScheduleModal(interaction: ModalSubmitInteraction): Promise<void> {
    try {
      const days = interaction.fields.getTextInputValue('schedule_days');
      const time = interaction.fields.getTextInputValue('schedule_time');
      const timezone = interaction.fields.getTextInputValue('schedule_timezone') || 'UTC';

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

      const userId = interaction.user.id;
      const workoutDays = days.split(',').map(day => day.trim());

      // Create weekly schedule using the API
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
        .setTitle('✅ Schedule Created!')
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
        .setThumbnail(interaction.user.displayAvatarURL())
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
      
      logger.info(`Schedule created for user: ${userId}`);

    } catch (error) {
      logger.error('Schedule modal error:', error);
      const embed = createErrorEmbed(
        'Schedule Creation Failed',
        'Unable to create your schedule. Please try again later.'
      );
      await interaction.editReply({ embeds: [embed] });
    }
  }

  // Pagination handlers
  private async handleGalleryPagination(interaction: ButtonInteraction, targetUserId: string, page: number): Promise<void> {
    try {
      // Get gallery data for the requested page
      const galleryData = await apiClient.getGallery(targetUserId, { page, limit: 10, status: 'all' });
      
      const isSelf = targetUserId === interaction.user.id;
      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(`📸 ${isSelf ? 'Your' : 'User'} Photo Gallery`)
        .setDescription(`**User:** <@${targetUserId}>\n**Total Photos:** ${galleryData.pagination.total}`)
        .setTimestamp();

      if (galleryData.photos.length === 0) {
        embed.addFields({
          name: '📷 No Photos Found',
          value: 'No photos have been uploaded yet.',
          inline: false
        });
      } else {
        // Add photo information
        const photoInfo = galleryData.photos.map((photo, index) => {
          const photoNumber = (galleryData.pagination.page - 1) * galleryData.pagination.limit + index + 1;
          const statusEmoji = photo.status === 'went' ? '✅' : '❌';
          const date = new Date(photo.date).toLocaleDateString();
          return `**${photoNumber}.** ${statusEmoji} ${date}`;
        }).join('\n');

        embed.addFields({
          name: `📷 Photos (${galleryData.pagination.page} of ${galleryData.pagination.pages})`,
          value: photoInfo,
          inline: false
        });

        // Set the first photo as the embed image
        if (galleryData.photos[0]?.photo_url) {
          embed.setImage(galleryData.photos[0].photo_url);
        }
      }

      // Add pagination buttons if there are multiple pages
      const components = galleryData.pagination.pages > 1 ? this.createPaginationButtons(page, galleryData.pagination.pages) : [];

      await interaction.editReply({
        embeds: [embed],
        components
      });

    } catch (error) {
      logger.error('Gallery pagination error:', error);
      const embed = createErrorEmbed(
        'Gallery Error',
        'Unable to load gallery page. Please try again.'
      );
      await interaction.editReply({ embeds: [embed], components: [] });
    }
  }

  private async handleNotificationsPagination(interaction: ButtonInteraction, userId: string, page: number): Promise<void> {
    try {
      // Get notifications data for the requested page
      const notificationsData = await apiClient.getUserNotifications(userId, { page, limit: 10, type: 'all', unread_only: false });
      
      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle('🔔 Your Notifications')
        .setDescription(`**Total:** ${notificationsData.pagination.total} notifications`)
        .setTimestamp();

      if (notificationsData.notifications.length === 0) {
        embed.addFields({
          name: '📭 No Notifications',
          value: 'No notifications found.',
          inline: false
        });
      } else {
        const notificationList = notificationsData.notifications.map((notification, index) => {
          const notificationNumber = (notificationsData.pagination.page - 1) * notificationsData.pagination.limit + index + 1;
          const readStatus = notification.read ? '✅' : '🔴';
          const typeEmoji = {
            'cheer': '🎉',
            'achievement': '🏆',
            'reminder': '⏰',
            'system': '⚙️'
          }[notification.type] || '📢';
          
          const date = new Date(notification.created_at).toLocaleDateString();
          return `**${notificationNumber}.** ${readStatus} ${typeEmoji} ${notification.title}\n   ${notification.message}\n   *${date}*`;
        }).join('\n\n');

        embed.addFields({
          name: `📋 Notifications (${notificationsData.pagination.page} of ${notificationsData.pagination.pages})`,
          value: notificationList,
          inline: false
        });
      }

      // Add pagination buttons if there are multiple pages
      const components = notificationsData.pagination.pages > 1 ? this.createPaginationButtons(page, notificationsData.pagination.pages) : [];

      await interaction.editReply({
        embeds: [embed],
        components
      });

    } catch (error) {
      logger.error('Notifications pagination error:', error);
      const embed = createErrorEmbed(
        'Notifications Error',
        'Unable to load notifications page. Please try again.'
      );
      await interaction.editReply({ embeds: [embed], components: [] });
    }
  }

  private async handleLeaderboardPagination(interaction: ButtonInteraction, page: number): Promise<void> {
    try {
      // For leaderboard pagination, we need to determine the type from the original embed
      const originalEmbed = interaction.message.embeds[0];
      const description = originalEmbed?.description || '';
      
      let leaderboardData;
      let title;
      
      if (description.includes('Streak')) {
        leaderboardData = await apiClient.getStreakLeaderboard(10, 'current');
        title = '🔥 Current Streak Leaderboard';
      } else {
        leaderboardData = await apiClient.getCheckInLeaderboard(10, 'all');
        title = '📊 Check-in Leaderboard';
      }

      const embed = new EmbedBuilder()
        .setColor(leaderboardData.embed.color || 0xff6b35)
        .setTitle(leaderboardData.embed.title || title)
        .setDescription(leaderboardData.embed.description || 'No data available')
        .setFooter(leaderboardData.embed.footer || { text: `Page ${page}` })
        .setTimestamp();

      // Add fields if they exist
      if (leaderboardData.embed.fields) {
        embed.addFields(leaderboardData.embed.fields);
      }

      // Add pagination buttons
      const components = this.createPaginationButtons(page, Math.ceil(leaderboardData.embed.fields?.length || 0 / 10) || 1);

      await interaction.editReply({
        embeds: [embed],
        components
      });

    } catch (error) {
      logger.error('Leaderboard pagination error:', error);
      const embed = createErrorEmbed(
        'Leaderboard Error',
        'Unable to load leaderboard page. Please try again.'
      );
      await interaction.editReply({ embeds: [embed], components: [] });
    }
  }

  private createPaginationButtons(currentPage: number, totalPages: number): ActionRowBuilder<ButtonBuilder>[] {
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
}
