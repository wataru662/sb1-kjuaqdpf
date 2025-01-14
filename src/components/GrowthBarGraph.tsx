import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { TimeSeriesMetric } from '../types/instagram';
import { Eye, Heart, Users, Activity } from 'lucide-react';

interface GrowthBarGraphProps {
  data: TimeSeriesMetric[];
  period: 'daily' | 'weekly' | 'monthly';
}

export function GrowthBarGraph({ data, period }: GrowthBarGraphProps) {
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

  const calculateGrowthData = () => {
    const growthData = [];
    const metrics = ['impressions', 'likes', 'followers', 'engagement'] as const;
    
    const dataPoints = period === 'daily' ? 30 : period === 'weekly' ? 26 : 24;
    const slicedData = data.slice(-dataPoints);
    
    for (let i = 0; i < slicedData.length; i++) {
      const current = slicedData[i];
      const growth: Record<string, number | string> = {
        date: current.date
      };

      metrics.forEach(metric => {
        const dailyMetric = `daily${metric.charAt(0).toUpperCase() + metric.slice(1)}`;
        growth[`${metric}Growth`] = current[dailyMetric];
      });

      growthData.push(growth);
    }

    return growthData;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    switch (period) {
      case 'daily':
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      case 'weekly':
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      case 'monthly':
        return date.toLocaleDateString(undefined, { month: 'short' });
    }
  };

  const formatValue = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;

    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-medium text-gray-900 mb-2">{formatDate(label)}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.fill }} />
            <p className="text-sm">
              <span className="font-medium" style={{ color: entry.fill }}>
                {entry.name.replace('Growth', '')}:
              </span>{' '}
              {formatValue(entry.value)}
            </p>
          </div>
        ))}
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

  const activeMetrics = metrics.filter(m => selectedMetrics[m.key as keyof typeof selectedMetrics]);
  const growthData = calculateGrowthData();

  return (
    <div className="mt-6 space-y-6">
      <div className="flex justify-start">
        <div className="flex flex-wrap gap-2">
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
      </div>

      {activeMetrics.length > 0 ? (
        <div className="bg-white rounded-lg p-4">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fontSize: 10, fill: '#6B7280' }}
                  stroke="#E5E7EB"
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickFormatter={formatValue}
                  tick={{ fontSize: 10, fill: '#6B7280' }}
                  stroke="#E5E7EB"
                />
                <Tooltip content={<CustomTooltip />} />
                {activeMetrics.map(metric => (
                  <Bar
                    key={metric.key}
                    dataKey={`${metric.key}Growth`}
                    name={metric.name}
                    fill={metric.color}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-gray-500">Select at least one metric to display the graph</p>
        </div>
      )}
    </div>
  );
}