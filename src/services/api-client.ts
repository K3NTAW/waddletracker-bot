import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { config } from '../config';
import logger from '../utils/logger';
import {
  ApiResponse,
  User,
  UserProfile,
  CheckIn,
  StreakData,
  Schedule,
  Cheer,
  LeaderboardData,
  DiscordEmbed,
  Notification,
  AnalyticsData,
  ApiError
} from '../types';

export class ApiClient {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.apiBaseUrl;
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'WaddleTracker-Discord-Bot/1.0.0'
      }
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        logger.debug(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        const status = error.response?.status || 500;
        const message = error.response?.data?.error || error.message || 'Unknown API error';
        logger.error(`API Error: ${status} - ${message}`, {
          url: error.config?.url,
          method: error.config?.method,
          status,
          message
        });
        throw new ApiError(message, status, error.config?.url);
      }
    );
  }

  // Generic API call method
  private async apiCall<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<T> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.request({
        method,
        url: endpoint,
        data,
        headers
      });

      if (!response.data.success) {
        throw new ApiError(
          response.data.error || 'API request failed',
          response.data.statusCode || 500,
          endpoint
        );
      }

      return response.data.data as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        `Failed to ${method} ${endpoint}`,
        500,
        endpoint
      );
    }
  }

  // Authentication endpoints
  async getAuthUrl(): Promise<string> {
    const response = await this.client.get('/auth/discord', {
      maxRedirects: 0,
      validateStatus: (status) => status === 302
    });
    return response.headers.location;
  }

  async getCurrentUser(token: string): Promise<User> {
    return this.apiCall<User>('GET', '/auth/me', undefined, {
      'Authorization': `Bearer ${token}`
    });
  }

  // User management endpoints
  async getUserProfile(userId: string): Promise<UserProfile> {
    return this.apiCall<UserProfile>('GET', `/users/${userId}`);
  }

  async updateUserProfile(userId: string, data: Partial<User>, token: string): Promise<User> {
    return this.apiCall<User>('PATCH', `/users/${userId}`, data, {
      'Authorization': `Bearer ${token}`
    });
  }

  async getUserPhotos(userId: string): Promise<CheckIn[]> {
    return this.apiCall<CheckIn[]>('GET', `/users/${userId}/photos`);
  }

  // Check-in endpoints
  async createCheckIn(data: {
    date: string;
    status: 'went' | 'missed';
    photo_url?: string;
    discord_message_id?: string;
  }, token: string): Promise<CheckIn & { streak: StreakData }> {
    return this.apiCall<CheckIn & { streak: StreakData }>('POST', '/checkins', data, {
      'Authorization': `Bearer ${token}`
    });
  }

  async getUserCheckIns(userId: string): Promise<CheckIn[]> {
    return this.apiCall<CheckIn[]>('GET', `/checkins/${userId}`);
  }

  async getRecentCheckIns(userId: string): Promise<CheckIn[]> {
    return this.apiCall<CheckIn[]>('GET', `/checkins/${userId}/recent`);
  }

  async getCheckInPhotos(userId: string): Promise<CheckIn[]> {
    return this.apiCall<CheckIn[]>('GET', `/checkins/${userId}/photos`);
  }

  // Streak endpoints
  async getUserStreak(userId: string): Promise<StreakData> {
    return this.apiCall<StreakData>('GET', `/streak/${userId}`);
  }

  // Schedule endpoints
  async createSchedule(data: {
    days_of_week: string[];
    time: string;
  }, token: string): Promise<Schedule> {
    return this.apiCall<Schedule>('POST', '/schedules', data, {
      'Authorization': `Bearer ${token}`
    });
  }

  async getUserSchedule(userId: string): Promise<Schedule> {
    return this.apiCall<Schedule>('GET', `/schedules/${userId}`);
  }

  // Cheer endpoints
  async sendCheer(data: {
    to_user_id: string;
    message: string;
  }, token: string): Promise<Cheer> {
    return this.apiCall<Cheer>('POST', '/cheers', data, {
      'Authorization': `Bearer ${token}`
    });
  }

  async getUserCheers(userId: string): Promise<Cheer[]> {
    return this.apiCall<Cheer[]>('GET', `/cheers/${userId}`);
  }

  // Discord integration endpoints
  async getCheckInEmbed(data: {
    user_id: string;
    checkin_id: string;
  }): Promise<DiscordEmbed> {
    return this.apiCall<DiscordEmbed>('POST', '/discord/checkin-embed', data);
  }

  async getProfileEmbed(discordId: string): Promise<DiscordEmbed> {
    return this.apiCall<DiscordEmbed>('GET', `/discord/profile-embed?discord_id=${discordId}`);
  }

  async getCheerEmbed(data: {
    from_discord_id: string;
    to_discord_id: string;
    message: string;
  }): Promise<{ embed: DiscordEmbed; cheer_id: string }> {
    return this.apiCall<{ embed: DiscordEmbed; cheer_id: string }>('POST', '/discord/cheer-embed', data);
  }

  async sendWebhook(data: {
    type: 'checkin' | 'cheer' | 'reminder' | 'achievement';
    user_id: string;
    checkin_id?: string;
    webhook_url: string;
    channel_id: string;
  }): Promise<void> {
    return this.apiCall<void>('POST', '/discord/webhook', data);
  }

  // Leaderboard endpoints
  async getStreakLeaderboard(limit: number = 10, type: 'current' | 'longest' = 'current'): Promise<LeaderboardData> {
    return this.apiCall<LeaderboardData>('GET', `/leaderboard/streaks?limit=${limit}&type=${type}`);
  }

  async getCheckInLeaderboard(limit: number = 10, period: 'all' | 'week' | 'month' | 'year' = 'all'): Promise<LeaderboardData> {
    return this.apiCall<LeaderboardData>('GET', `/leaderboard/checkins?limit=${limit}&period=${period}`);
  }

  // Gallery endpoints
  async getGallery(userId: string, options: {
    page?: number;
    limit?: number;
    status?: 'all' | 'went' | 'missed';
    year?: string;
    month?: string;
  } = {}): Promise<{
    photos: CheckIn[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    return this.apiCall<{
      photos: CheckIn[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>('GET', `/gallery/${userId}?${params.toString()}`);
  }

  // Notification endpoints
  async getUserNotifications(userId: string, options: {
    page?: number;
    limit?: number;
    type?: 'all' | 'cheer' | 'reminder' | 'achievement' | 'system';
    unread_only?: boolean;
  } = {}): Promise<{
    notifications: Notification[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    return this.apiCall<{
      notifications: Notification[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>('GET', `/notifications/${userId}?${params.toString()}`);
  }

  async markNotificationsAsRead(userId: string, notificationIds: string[], token: string): Promise<void> {
    return this.apiCall<void>('POST', `/notifications/${userId}`, { notification_ids: notificationIds }, {
      'Authorization': `Bearer ${token}`
    });
  }

  async markAllNotificationsAsRead(userId: string, token: string): Promise<void> {
    return this.apiCall<void>('PUT', `/notifications/${userId}`, undefined, {
      'Authorization': `Bearer ${token}`
    });
  }

  // Analytics endpoints
  async getUserAnalytics(userId: string, period: number = 30): Promise<AnalyticsData> {
    return this.apiCall<AnalyticsData>('GET', `/analytics/${userId}?period=${period}`);
  }
}

export const apiClient = new ApiClient();
