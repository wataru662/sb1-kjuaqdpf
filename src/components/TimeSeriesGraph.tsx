import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TimeSeriesMetric, PostInsight } from '../types/instagram';
import { TrendingUp } from 'lucide-react';
import { GrowthBarGraph } from './GrowthBarGraph';

type Period = 'daily' | 'weekly' | 'monthly';

interface TimeSeriesGraphProps {
  data: TimeSeriesMetric[];
  posts: PostInsight[];
}

export function TimeSeriesGraph({ data, posts }: TimeSeriesGraphProps) {
  const [period, setPeriod] = useState<Period>('daily');

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

  const formatValue = (value: number) => {
    return value.toLocaleString();
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
        <p className="text-sm text-purple-600">
          フォロワー数: {formatValue(payload[0]?.value)}
        </p>
        {matchingPost && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <img
                src={matchingPost.imageUrl}
                alt="Post"
                className="w-36 h-36 rounded object-cover"
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

  const CustomLegend = () => (
    <div className="flex flex-wrap items-center gap-4 justify-center mb-4">
      <div className="flex items-center gap-1">
        <div
          className="w-3 h-3"
          style={{ backgroundColor: '#8B5CF6' }}
        />
        <span className="text-sm">フォロワー数</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 flex items-center justify-center">
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[12px] border-transparent border-t-pink-500" />
        </div>
        <span className="text-sm">投稿</span>
      </div>
    </div>
  );

  const CustomDot = (props: any) => {
    const { cx, cy, stroke, payload } = props;
    const hasPost = posts.some(post => {
      const postDate = new Date(post.posted).toISOString().split('T')[0];
      return postDate === payload.date;
    });

    return (
      <g>
        <circle 
          cx={cx} 
          cy={cy} 
          r={6} 
          stroke={stroke} 
          fill="white" 
          strokeWidth={3}
        />
        {hasPost && (
          <path
            d={`M ${cx - 12} ${cy + 24} L ${cx + 12} ${cy + 24} L ${cx} ${cy + 36} Z`}
            fill="#EC4899"
          />
        )}
      </g>
    );
  };

  const CustomXAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const date = payload.value;
    const hasPost = posts.some(post => {
      const postDate = new Date(post.posted).toISOString().split('T')[0];
      return postDate === date;
    });

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="middle"
          fill="#666"
          fontSize={12}
        >
          {formatDate(date)}
        </text>
        {hasPost && (
          <path
            d="M -12 20 L 12 20 L 0 32 Z"
            fill="#EC4899"
            transform="translate(0,2)"
          />
        )}
      </g>
    );
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-900">フォロワー数推移</h2>
          <TrendingUp className="w-5 h-5 text-purple-500" />
        </div>
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

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data[period]} margin={{ top: 20, right: 60, left: 20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={<CustomXAxisTick />}
              height={80}
            />
            <YAxis
              tickFormatter={formatValue}
              domain={['auto', 'auto']}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} verticalAlign="top" height={36} />
            <Line
              type="monotone"
              dataKey="followers"
              stroke="#8B5CF6"
              strokeWidth={3}
              dot={<CustomDot />}
              activeDot={{ r: 8, strokeWidth: 3 }}
              name="フォロワー数"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <GrowthBarGraph data={data[period]} period={period} />
    </div>
  );
}