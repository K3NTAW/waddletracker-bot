import { Collection, SlashCommandBuilder } from 'discord.js';
import { CommandHandler } from './handlers';
import { CheckinHandler } from './handlers/checkin';
import { WorkoutHandler } from './handlers/workout';
import { RestDayHandler } from './handlers/rest-day';
import { ProfileHandler } from './handlers/profile';
import { CheerHandler } from './handlers/cheer';
import { StreakHandler } from './handlers/streak';
import { LeaderboardHandler } from './handlers/leaderboard';
import { ScheduleHandler } from './handlers/schedule';
import { GalleryHandler } from './handlers/gallery';
import { NotificationsHandler } from './handlers/notifications';
import { AnalyticsHandler } from './handlers/analytics';
import { HelpHandler } from './handlers/help';
import { commands } from './slash-commands';

// Command registry
export const commandHandlers = new Collection<string, CommandHandler>();

// Register command handlers
commandHandlers.set('checkin', new CheckinHandler());
commandHandlers.set('workout', new WorkoutHandler());
commandHandlers.set('rest-day', new RestDayHandler());
commandHandlers.set('profile', new ProfileHandler());
commandHandlers.set('cheer', new CheerHandler());
commandHandlers.set('streak', new StreakHandler());
commandHandlers.set('leaderboard', new LeaderboardHandler());
commandHandlers.set('schedule', new ScheduleHandler());
commandHandlers.set('gallery', new GalleryHandler());
commandHandlers.set('notifications', new NotificationsHandler());
commandHandlers.set('analytics', new AnalyticsHandler());
commandHandlers.set('help', new HelpHandler());

// Export commands for registration
export { commands };
