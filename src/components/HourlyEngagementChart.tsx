import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { PostInsight } from '../types/instagram';
import { Clock } from 'lucide-react';

interface HourlyEngagementChartProps {
  posts: PostInsight[];
}

type Period = 'week' | 'month' | 'all';

export function HourlyEngagementChart({ posts }: HourlyEngagementChartProps) {
  const [period, setPeriod] = useState<Period>('week');

  // Generate realistic demo data for hourly engagement
  const generateHourlyData = (selectedPeriod: Period) => {
    // Pattern: Higher engagement during lunch (12-14) and evening (19-23)
    const baseEngagement = selectedPeriod === 'week' ? 1200 :
                          selectedPeriod === 'month' ? 1500 : 2000;
    
    // Engagement multiplier based on period
    const periodMultiplier = selectedPeriod === 'week' ? 1 :
                            selectedPeriod === 'month' ? 1.2 : 1.5;

    const data = Array.from({ length: 24 }, (_, hour) => {
      let multiplier = 1;
      
      // Early morning (0-6): Low engagement
      if (hour >= 0 && hour < 6) {
        multiplier = 0.3;
      }
      // Morning (6-9): Rising engagement
      else if (hour >= 6 && hour < 9) {
        multiplier = 0.8;
      }
      // Late morning (9-11): Moderate engagement
      else if (hour >= 9 && hour < 11) {
        multiplier = 1.2;
      }
      // Lunch time (12-14): High engagement
      else if (hour >= 12 && hour < 14) {
        multiplier = 1.8;
      }
      // Afternoon (14-17): Moderate engagement
      else if (hour >= 14 && hour < 17) {
        multiplier = 1.3;
      }
      // Evening rush (17-19): Rising engagement
      else if (hour >= 17 && hour < 19) {
        multiplier = 1.5;
      }
      // Prime time (19-23): Peak engagement
      else if (hour >= 19 && hour < 23) {
        multiplier = 2.0;
      }
      // Late night (23): Declining engagement
      else {
        multiplier = 0.7;
      }

      // Add some randomness with period-specific variation
      const randomVariation = selectedPeriod === 'week' ? 0.2 :
                             selectedPeriod === 'month' ? 0.3 : 0.4;
      const randomFactor = 0.8 + Math.random() * randomVariation;
      
      const engagement = Math.round(baseEngagement * multiplier * randomFactor * periodMultiplier);

      return {
        hour,
        engagement,
        posts: Math.round(engagement / (200 * periodMultiplier)) // Adjust posts count based on period
      };
    });

    return data;
  };

  const hourlyData = generateHourlyData(period);

  // Find the prime time (hour with highest engagement)
  const primeTime = hourlyData.reduce((max, current) => 
    current.engagement > max.engagement ? current : max
  ).hour;

  const formatHour = (hour: number) => {
    return `${hour}:00`;
  };

  const getPeriodLabel = (p: Period) => {
    switch (p) {
      case 'week':
        return '直近1週間';
      case 'month':
        return '直近1か月';
      case 'all':
        return '開始以来';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;

    const { engagement, posts } = payload[0].payload;

    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-medium text-gray-900">{formatHour(label)}</p>
        <div className="mt-1 space-y-1">
          <p className="text-sm text-gray-600">
            エンゲージメント: {engagement.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">
            投稿数: {posts}
          </p>
          <p className="text-sm text-gray-600">
            投稿あたり: {Math.round(engagement / posts).toLocaleString()}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-900">時間帯別エンゲージメント</h2>
          <Clock className="w-5 h-5 text-indigo-600" />
        </div>
        <div className="flex items-center gap-4">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="week">直近1週間</option>
            <option value="month">直近1か月</option>
            <option value="all">開始以来</option>
          </select>
          <span className="font-medium text-gray-900">
            ピーク時間: {formatHour(primeTime)}
          </span>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <XAxis
              dataKey="hour"
              tickFormatter={formatHour}
              interval="preserveStartEnd"
              tick={{ fontSize: 12, fill: '#6B7280' }}
              stroke="#E5E7EB"
            />
            <YAxis
              tickFormatter={(value) => value.toLocaleString()}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              stroke="#E5E7EB"
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="engagement"
              fill="#818CF8"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-600">ピーク時間帯</p>
          <p className="mt-1 text-xl font-semibold text-indigo-600">19:00 - 22:00</p>
          <p className="mt-1 text-sm text-gray-500">
            {getPeriodLabel(period)}の最高エンゲージメント
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-600">ランチタイム</p>
          <p className="mt-1 text-xl font-semibold text-green-600">12:00 - 14:00</p>
          <p className="mt-1 text-sm text-gray-500">
            {getPeriodLabel(period)}の2番目に高いエンゲージメント
          </p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-600">朝の立ち上がり</p>
          <p className="mt-1 text-xl font-semibold text-orange-600">8:00 - 10:00</p>
          <p className="mt-1 text-sm text-gray-500">
            {getPeriodLabel(period)}の安定したエンゲージメント
          </p>
        </div>
      </div>
    </div>
  );
}