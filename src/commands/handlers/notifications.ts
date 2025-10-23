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

        // For now, we'll create mock notifications
        // In a real implementation, you'd call apiClient.getUserNotifications(userId, { page, limit, type, unread_only })
        const mockNotifications = [
          {
            id: '1',
            type: 'cheer',
            title: 'Someone cheered for you!',
            message: 'Great job on your 5-day streak! 💪',
            read: false,
            created_at: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: '2',
            type: 'achievement',
            title: 'Achievement Unlocked!',
            message: 'You\'ve reached a 7-day streak! 🔥',
            read: true,
            created_at: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: '3',
            type: 'reminder',
            title: 'Workout Reminder',
            message: 'Time for your scheduled workout!',
            read: false,
            created_at: new Date(Date.now() - 7200000).toISOString()
          }
        ];

        // Filter notifications based on type and read status
        let filteredNotifications = mockNotifications;
        
        if (type !== 'all') {
          filteredNotifications = filteredNotifications.filter(n => n.type === type);
        }
        
        if (unreadOnly) {
          filteredNotifications = filteredNotifications.filter(n => !n.read);
        }

        const totalNotifications = filteredNotifications.length;
        const totalPages = Math.ceil(totalNotifications / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = Math.min(startIndex + limit, totalNotifications);
        const pageNotifications = filteredNotifications.slice(startIndex, endIndex);

        const embed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setTitle('🔔 Your Notifications')
          .setDescription(`**Total:** ${totalNotifications} notifications`)
          .setTimestamp();

        if (pageNotifications.length === 0) {
          embed.addFields({
            name: '📭 No Notifications',
            value: unreadOnly 
              ? 'No unread notifications.'
              : 'No notifications found.',
            inline: false
          });
        } else {
          const notificationList = pageNotifications.map((notification, index) => {
            const notificationNumber = startIndex + index + 1;
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
            name: `📋 Notifications (${startIndex + 1}-${endIndex} of ${totalNotifications})`,
            value: notificationList,
            inline: false
          });
        }

        // Add pagination buttons if there are multiple pages
        const components = totalPages > 1 ? createPaginationButtons(page, totalPages) : [];

        await interaction.editReply({
          embeds: [embed],
          components
        });

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
