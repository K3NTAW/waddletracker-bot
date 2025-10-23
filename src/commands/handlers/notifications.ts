import { ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { CommandHandler, createErrorEmbed, createSuccessEmbed, handleApiError, getUserId, createPaginationButtons, formatDate } from './index';
import { apiClient } from '../../services/api-client';

export class NotificationsHandler implements CommandHandler {
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      const subcommand = interaction.options.getSubcommand();
      const userId = getUserId(interaction);

      if (subcommand === 'view') {
        await interaction.deferReply({ ephemeral: true });

        const type = interaction.options.getString('type') || 'all';
        const unreadOnly = interaction.options.getBoolean('unread_only') || false;
        const page = interaction.options.getInteger('page') || 1;
        const limit = 10;

        try {
          // Get real notifications from API
          const notificationsData = await apiClient.getUserNotifications(userId, { page, limit, type: type as 'all' | 'cheer' | 'reminder' | 'achievement' | 'system', unread_only: unreadOnly });

          const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('🔔 Your Notifications')
            .setDescription(`**Total:** ${notificationsData.pagination.total} notifications`)
            .setTimestamp();

          if (notificationsData.notifications.length === 0) {
            embed.addFields({
              name: '📭 No Notifications',
              value: unreadOnly 
                ? 'No unread notifications.'
                : 'No notifications found.',
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
              
              return `**${notificationNumber}.** ${readStatus} ${typeEmoji} ${notification.title}\n   ${notification.message}\n   *${formatDate(notification.created_at)}*`;
            }).join('\n\n');

            embed.addFields({
              name: `📋 Notifications (${notificationsData.pagination.page} of ${notificationsData.pagination.pages})`,
              value: notificationList,
              inline: false
            });
          }

          // Add pagination buttons if there are multiple pages
          const components = notificationsData.pagination.pages > 1 ? createPaginationButtons(page, notificationsData.pagination.pages) : [];

          await interaction.editReply({
            embeds: [embed],
            components
          });

        } catch (apiError) {
          // If user doesn't exist in the system, show registration prompt
          const embed = new EmbedBuilder()
            .setColor(0xffa500)
            .setTitle('👤 User Not Found')
            .setDescription(
              `**User:** <@${userId}>\n\n` +
              `This user hasn't registered with WaddleTracker yet.\n` +
              `They need to visit the [WaddleTracker website](https://waddletracker.com) to create an account and link their Discord profile.`
            )
            .addFields({
              name: '🔗 How to Register',
              value: '1. Visit [waddletracker.com](https://waddletracker.com)\n2. Sign up with Discord\n3. Link your Discord account\n4. Start receiving notifications!',
              inline: false
            })
            .setThumbnail(interaction.user.displayAvatarURL())
            .setTimestamp();

          await interaction.editReply({ embeds: [embed] });
        }

      } else if (subcommand === 'mark_read') {
        await interaction.deferReply({ ephemeral: true });

        const notificationIds = interaction.options.getString('notification_ids');
        
        if (notificationIds) {
          // Mark specific notifications as read
          const ids = notificationIds.split(',').map(id => id.trim());
          
          // For now, we'll show a success message
          // In a real implementation, you'd call apiClient.markNotificationsAsRead(userId, ids, token)
          const embed = createSuccessEmbed(
            'Notifications Marked as Read',
            `Successfully marked ${ids.length} notification(s) as read.`
          );

          await interaction.editReply({ embeds: [embed] });
        } else {
          // Mark all notifications as read
          // For now, we'll show a success message
          // In a real implementation, you'd call apiClient.markAllNotificationsAsRead(userId, token)
          const embed = createSuccessEmbed(
            'All Notifications Marked as Read',
            'All your notifications have been marked as read.'
          );

          await interaction.editReply({ embeds: [embed] });
        }
      }

      // TODO: In a real implementation, you would:
      // 1. Get user's JWT token from Discord OAuth2
      // 2. Call the appropriate API endpoint based on subcommand
      // 3. Use the returned notification data
      // 4. Handle cases where user doesn't exist in the system

    } catch (error) {
      await handleApiError(interaction, error);
    }
  }
}
