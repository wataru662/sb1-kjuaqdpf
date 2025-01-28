import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Eye, BarChart3, Activity, Share2, ChevronLeft, ChevronRight, Settings, LayoutDashboard, Image, Film, MessageSquare, LogOut, MessageCircle, UserCircle, Link2, Phone } from 'lucide-react';
import { mockInsightData } from './data/mockData';
import { MetricCard } from './components/MetricCard';
import { PostCard } from './components/PostCard';
import { CommentManager } from './components/CommentManager';
import { TimeSeriesGraph } from './components/TimeSeriesGraph';
import { PostsTable } from './components/PostsTable';
import { StoriesTable } from './components/StoriesTable';
import { AuthForm } from './components/AuthForm';
import { UpdatePasswordForm } from './components/UpdatePasswordForm';
import { InstagramSettings } from './components/InstagramSettings';
import { FunStats } from './components/FunStats';
import { DMAutoReply } from './components/DMAutoReply';
import { TopPosts } from './components/TopPosts';
import { HourlyEngagementChart } from './components/HourlyEngagementChart';
import { AccountMetrics } from './components/AccountMetrics';
import { supabase } from './lib/supabase';

function App() {
  const { metrics, recentPosts, timeSeriesData } = mockInsightData;
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [session, setSession] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);

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

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
              <MetricCard
                title="Followers"
                value={metrics.followers.toLocaleString()}
                change={metrics.followersGrowth}
                icon={Users}
              />
              <MetricCard
                title="Engagement Rate"
                value={`${metrics.engagement}%`}
                icon={Activity}
              />
              <MetricCard
                title="Impressions"
                value={metrics.impressions.toLocaleString()}
                icon={Eye}
              />
              <MetricCard
                title="Profile Views"
                value={metrics.profileViews.toLocaleString()}
                icon={UserCircle}
              />
              <MetricCard
                title="Website Clicks"
                value={metrics.websiteClicks.toLocaleString()}
                icon={Link2}
              />
              <MetricCard
                title="Contact Clicks"
                value={metrics.contactClicks.toLocaleString()}
                icon={Phone}
              />
            </div>

            <FunStats posts={recentPosts} />

            <div className="mb-8">
              <TimeSeriesGraph data={timeSeriesData} posts={recentPosts} />
            </div>

            <div className="mb-8">
              <HourlyEngagementChart posts={recentPosts} />
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">直近1カ月の人気投稿</h2>
              <TopPosts posts={recentPosts} />
            </div>
          </>
        );
      case 'posts':
        return <PostsTable posts={recentPosts} />;
      case 'stories':
        return <StoriesTable stories={recentPosts} />;
      case 'dm':
        return <DMAutoReply />;
      case 'account':
        return <AccountMetrics data={timeSeriesData.daily} />;
      default:
        return null;
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
    { id: 'posts', label: '投稿', icon: Image },
    { id: 'stories', label: 'ストーリーズ', icon: Film },
    { id: 'dm', label: 'DM', icon: MessageCircle },
    { id: 'account', label: 'アカウント', icon: UserCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-64 min-h-screen bg-white border-r border-gray-200">
          <div className="p-4">
            <h1 className="text-xl font-bold text-gray-900">Instagram Insights</h1>
          </div>
          <nav className="mt-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium ${
                    currentTab === tab.id
                      ? 'text-indigo-600 bg-indigo-50 border-r-2 border-indigo-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
          <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
              >
                <Settings className="w-4 h-4" />
                API設定
              </button>
              <div className="px-4 py-2 text-sm text-gray-600">
                {session.user.email}
              </div>
              <button
                onClick={() => supabase.auth.signOut()}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                ログアウト
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {showSettings ? (
            <InstagramSettings />
          ) : (
            renderContent()
          )}
        </div>
      </div>
    </div>
  );
}

export default App;