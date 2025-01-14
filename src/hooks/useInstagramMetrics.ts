import { useState, useEffect } from 'react';
import { getPostTimeSeriesData, getAccountTimeSeriesData } from '../services/instagram';

export function usePostMetrics(postId: string, period: 'hour' | 'day' | 'week' = 'day') {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const metrics = await getPostTimeSeriesData(postId, period);
        setData(metrics);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [postId, period]);

  return { data, loading, error };
}

export function useAccountMetrics(period: 'hour' | 'day' | 'week' = 'day') {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const metrics = await getAccountTimeSeriesData(period);
        setData(metrics);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [period]);

  return { data, loading, error };
}