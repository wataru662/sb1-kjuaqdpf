import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Eye, Heart, Bookmark } from 'lucide-react';

interface PostMetricsGraphProps {
  data: {
    timestamp: string;
    impressions: number;
    likes: number;
    saves: number;
  }[];
}

type MetricType = 'impressions' | 'likes' | 'saves';

export function PostMetricsGraph({ data }: PostMetricsGraphProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('impressions');

  const formatValue = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    });
  };

  const getMetricColor = (metric: MetricType) => {
    switch (metric) {
      case 'impressions': return '#3B82F6';
      case 'likes': return '#EC4899';
      case 'saves': return '#10B981';
    }
  };

  const getMetricIcon = (metric: MetricType) => {
    switch (metric) {
      case 'impressions': return Eye;
      case 'likes': return Heart;
      case 'saves': return Bookmark;
    }
  };

  const MetricButton = ({ metric, label }: { metric: MetricType; label: string }) => {
    const Icon = getMetricIcon(metric);
    const isSelected = selectedMetric === metric;
    const baseClasses = "flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors";
    const colorClasses = isSelected
      ? `bg-${metric === 'impressions' ? 'blue' : metric === 'likes' ? 'pink' : 'green'}-100 text-${metric === 'impressions' ? 'blue' : metric === 'likes' ? 'pink' : 'green'}-700`
      : "bg-gray-100 text-gray-500";

    return (
      <button
        onClick={() => setSelectedMetric(metric)}
        className={`${baseClasses} ${colorClasses}`}
      >
        <Icon className="w-3 h-3" />
        {label}
      </button>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;

    return (
      <div className="bg-white p-2 rounded-lg shadow-lg border border-gray-200 text-xs">
        <p className="font-medium text-gray-900">{formatDate(label)}</p>
        <p className="text-gray-600">
          {formatValue(payload[0]?.value)}
        </p>
      </div>
    );
  };

  return (
    <div className="p-3 bg-white rounded-lg">
      <div className="flex gap-2 mb-3">
        <MetricButton metric="impressions" label="Impressions" />
        <MetricButton metric="likes" label="Likes" />
        <MetricButton metric="saves" label="Saves" />
      </div>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatDate}
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={formatValue}
              tick={{ fontSize: 10 }}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey={selectedMetric}
              stroke={getMetricColor(selectedMetric)}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}