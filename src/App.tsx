import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Eye, BarChart3, Activity, Share2, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { mockInsightData } from './data/mockData';
import { PostCard } from './components/PostCard';
import { CommentManager } from './components/CommentManager';
import { TimeSeriesGraph } from './components/TimeSeriesGraph';
import { PostsTable } from './components/PostsTable';
import { AuthForm } from './components/AuthForm';
import { UpdatePasswordForm } from './components/UpdatePasswordForm';
import { InstagramSettings } from './components/InstagramSettings';
import { FunStats } from './components/FunStats';
import { supabase } from './lib/supabase';
import { Comment } from './types/instagram';

function App() {
  const { metrics, recentPosts, timeSeriesData } = mockInsightData;
  const [comments, setComments] = useState<Comment[]>(mockInsightData.comments);
  const [currentPage, setCurrentPage] = useState(1);
  const [session, setSession] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const postsPerPage = 12;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      
      // Check URL hash for password reset
      const hash = window.location.hash;
      if (hash.includes('type=recovery') || hash.includes('type=signup')) {
        setIsPasswordReset(true);
      }
    });

    // Check URL hash on initial load
    const hash = window.location.hash;
    if (hash.includes('type=recovery') || hash.includes('type=signup')) {
      setIsPasswordReset(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  if (isPasswordReset) {
    return <UpdatePasswordForm onComplete={() => setIsPasswordReset(false)} />;
  }

  if (!session) {
    return <AuthForm />;
  }

  const totalPages = Math.ceil(recentPosts.length / postsPerPage);
  const paginatedPosts = recentPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Instagram Insights</h1>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
            >
              <Settings className="w-4 h-4" />
              API設定
            </button>
            <span className="text-sm text-gray-600">{session.user.email}</span>
            <button
              onClick={() => supabase.auth.signOut()}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              ログアウト
            </button>
          </div>
        </div>

        {showSettings ? (
          <InstagramSettings />
        ) : (
          <>
            <FunStats posts={recentPosts} />

            <div className="mb-8">
              <TimeSeriesGraph data={timeSeriesData} posts={recentPosts} />
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Posts Overview</h2>
              <PostsTable posts={recentPosts} />
            </div>

            <div className="mb-8">
              <CommentManager comments={comments} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;