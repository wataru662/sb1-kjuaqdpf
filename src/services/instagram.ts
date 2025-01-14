import { supabase } from '../lib/supabase';

export async function fetchInstagramMetrics() {
  try {
    // Replace this with your actual Instagram API call
    const response = await fetch('YOUR_INSTAGRAM_API_ENDPOINT', {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_INSTAGRAM_ACCESS_TOKEN}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch Instagram metrics');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Instagram metrics:', error);
    throw error;
  }
}

export async function storeMetrics(metrics: any) {
  const { data: posts, error: postsError } = await supabase
    .from('instagram_posts')
    .upsert(
      metrics.posts.map((post: any) => ({
        instagram_id: post.id,
        image_url: post.image_url,
        posted_at: post.timestamp,
      })),
      { onConflict: 'instagram_id' }
    );

  if (postsError) throw postsError;

  // Store post metrics
  const { error: metricsError } = await supabase
    .from('post_metrics')
    .insert(
      metrics.posts.map((post: any) => ({
        post_id: posts?.find(p => p.instagram_id === post.id)?.id,
        likes: post.likes_count,
        comments: post.comments_count,
        saves: post.saves_count,
        reach: post.reach_count,
        engagement_rate: post.engagement_rate,
        recorded_at: new Date().toISOString(),
      }))
    );

  if (metricsError) throw metricsError;

  // Store account metrics
  const { error: accountError } = await supabase
    .from('account_metrics')
    .insert({
      followers: metrics.account.followers_count,
      following: metrics.account.following_count,
      total_posts: metrics.account.media_count,
      recorded_at: new Date().toISOString(),
    });

  if (accountError) throw accountError;
}

export async function getPostTimeSeriesData(postId: string, period: 'hour' | 'day' | 'week' = 'day') {
  const { data, error } = await supabase
    .from('post_metrics')
    .select(`
      likes,
      comments,
      saves,
      reach,
      engagement_rate,
      recorded_at
    `)
    .eq('post_id', postId)
    .order('recorded_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getAccountTimeSeriesData(period: 'hour' | 'day' | 'week' = 'day') {
  const { data, error } = await supabase
    .from('account_metrics')
    .select('*')
    .order('recorded_at', { ascending: true });

  if (error) throw error;
  return data;
}