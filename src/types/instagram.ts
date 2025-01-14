export interface InsightMetrics {
  followers: number;
  followersGrowth: number;
  engagement: number;
  impressions: number;
  reach: number;
}

export interface PostInsight {
  id: string;
  imageUrl: string;
  likes: number;
  comments: number;
  saves: number;
  reach: number;
  engagement: number;
  posted: string;
}

export interface Comment {
  id: string;
  username: string;
  text: string;
  timestamp: string;
  aiReply?: string;
}

export interface TimeSeriesMetric {
  date: string;
  impressions: number;
  likes: number;
  followers: number;
  saves: number;
}

export interface TimeSeriesData {
  daily: TimeSeriesMetric[];
  weekly: TimeSeriesMetric[];
  monthly: TimeSeriesMetric[];
}

export interface InsightData {
  metrics: InsightMetrics;
  recentPosts: PostInsight[];
  weeklyGrowth: { date: string; followers: number }[];
  engagementRate: { date: string; rate: number }[];
  comments: Comment[];
  timeSeriesData: TimeSeriesData;
}