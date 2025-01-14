import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { TimeSeriesMetric, PostInsight } from '../types/instagram';
import { TrendingUp, Heart, Bookmark, Eye, Activity, Users } from 'lucide-react';
import { GrowthBarGraph } from './GrowthBarGraph';

type Period = 'daily' | 'weekly' | 'monthly';

interface TimeSeriesGraphProps {
  data: TimeSeriesMetric[];
  posts: PostInsight[];
}

export function TimeSeriesGraph({ data, posts }: TimeSeriesGraphProps) {
  const [period, setPeriod] = useState<Period>('daily');
  const [selectedMetrics, setSelectedMetrics] = useState({
    impressions: true,
    likes: true,
    followers: true,
    engagement: true
  });

  // Define consistent colors for metrics
  const metricColors = {
    impressions: '#3B82F6', // blue-500
    likes: '#EC4899',      // pink-500
    followers: '#10B981',  // emerald-500
    engagement: '#8B5CF6'  // purple-500
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) {
        throw new Error('Invalid date');
      }
      
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Tokyo'
      };

      switch (period) {
        case 'daily':
          options.month = 'numeric';
          options.day = 'numeric';
          break;
        case 'weekly':
          options.month = 'numeric';
          options.day = 'numeric';
          break;
        case 'monthly':
          options.year = 'numeric';
          options.month = 'numeric';
          break;
      }
      
      return d.toLocaleDateString('ja-JP', options);
    } catch (e) {
      console.error('Error formatting date:', dateStr);
      return 'Invalid date';
    }
  };

  const formatValue = (value: number, metric?: string) => {
    if (metric === 'followers') {
      return value.toLocaleString();
    }
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;

    const matchingPost = posts.find(post => {
      const postDate = new Date(post.posted).toISOString().split('T')[0];
      return postDate === label;
    });

    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-medium text-gray-900 mb-2">{formatDate(label)}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {formatValue(entry.value, entry.name.toLowerCase())}
          </p>
        ))}
        {matchingPost && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <img
                src={matchingPost.imageUrl}
                alt="Post"
                className="w-12 h-12 rounded object-cover"
              />
              <div>
                <p className="text-xs font-medium text-gray-900">Post published</p>
                <p className="text-xs text-gray-500">
                  {formatValue(matchingPost.likes)} likes
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const metrics = [
    { key: 'impressions', name: 'Impressions', color: metricColors.impressions, icon: Eye },
    { key: 'likes', name: 'Likes', color: metricColors.likes, icon: Heart },
    { key: 'followers', name: 'Followers', color: metricColors.followers, icon: Users },
    { key: 'engagement', name: 'Engagement', color: metricColors.engagement, icon: Activity }
  ];

  const toggleMetric = (metric: keyof typeof selectedMetrics) => {
    setSelectedMetrics(prev => ({
      ...prev,
      [metric]: !prev[metric]
    }));
  };

  const MetricToggle = ({ metric, name, color, icon: Icon }: { 
    metric: keyof typeof selectedMetrics;
    name: string;
    color: string;
    icon: typeof Eye;
  }) => {
    const isSelected = selectedMetrics[metric];
    return (
      <button
        onClick={() => toggleMetric(metric)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors`}
        style={{ 
          backgroundColor: isSelected ? `${color}1a` : '#f3f4f6',
          color: isSelected ? color : '#6b7280'
        }}
      >
        <Icon className="w-4 h-4" />
        {name}
      </button>
    );
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Metrics Over Time</h2>
        <div className="flex flex-wrap gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="daily">Daily (30 days)</option>
            <option value="weekly">Weekly (6 months)</option>
            <option value="monthly">Monthly (2 years)</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        {metrics.map(metric => (
          <MetricToggle
            key={metric.key}
            metric={metric.key as keyof typeof selectedMetrics}
            name={metric.name}
            color={metric.color}
            icon={metric.icon}
          />
        ))}
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data[period]} margin={{ top: 20, right: 60, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickFormatter={formatDate}
            />
            <YAxis
              yAxisId="metrics"
              orientation="left"
              tickFormatter={formatValue}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <Tooltip content={<CustomTooltip />} />
            {selectedMetrics.impressions && (
              <Line
                type="monotone"
                dataKey="impressions"
                stroke={metricColors.impressions}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2 }}
                name="Impressions"
                yAxisId="metrics"
              />
            )}
            {selectedMetrics.likes && (
              <Line
                type="monotone"
                dataKey="likes"
                stroke={metricColors.likes}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2 }}
                name="Likes"
                yAxisId="metrics"
              />
            )}
            {selectedMetrics.followers && (
              <Line
                type="monotone"
                dataKey="followers"
                stroke={metricColors.followers}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2 }}
                name="Followers"
                yAxisId="metrics"
              />
            )}
            {selectedMetrics.engagement && (
              <Line
                type="monotone"
                dataKey="engagement"
                stroke={metricColors.engagement}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2 }}
                name="Engagement"
                yAxisId="metrics"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <GrowthBarGraph data={data[period]} period={period} />
    </div>
  );
}