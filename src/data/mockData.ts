import { InsightData } from '../types/instagram';

// Helper function to generate time series data that includes post dates
function generateTimeSeriesData(days: number, startDate: Date, posts: any[]) {
  const data = [];
  const postDates = new Set(posts.map(post => new Date(post.posted).toISOString().split('T')[0]));
  
  // Initialize cumulative totals
  let totalFollowers = 20000; // Starting point
  let totalLikes = 0;
  let totalSaves = 0;
  let totalImpressions = 0;
  let totalProfileViews = 0;
  let totalWebsiteClicks = 0;
  let totalContactClicks = 0;
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() - (days - i - 1));
    const dateStr = date.toISOString().split('T')[0];
    
    // その日の投稿を取得
    const dayPosts = posts.filter(post => 
      new Date(post.posted).toISOString().split('T')[0] === dateStr
    );
    
    // If this date has a post, add its metrics to totals
    const hasPost = postDates.has(dateStr);
    const dailyFollowerGrowth = Math.floor(35 + (Math.random() * 20) - 10); // 35 ±10
    
    // Update cumulative totals
    totalFollowers += dailyFollowerGrowth;
    
    // Daily metrics (non-cumulative for the bottom graph)
    const dailyImpressions = Math.floor((12000 + Math.random() * 2000) * (hasPost ? 1.5 : 1));
    const dailyLikes = Math.floor((800 + Math.random() * 200) * (hasPost ? 1.5 : 1));
    const dailySaves = Math.floor((50 + Math.random() * 10) * (hasPost ? 1.5 : 1));
    const dailyProfileViews = Math.floor((200 + Math.random() * 50) * (hasPost ? 1.5 : 1));
    const dailyWebsiteClicks = Math.floor((30 + Math.random() * 10) * (hasPost ? 1.5 : 1));
    const dailyContactClicks = Math.floor((5 + Math.random() * 3) * (hasPost ? 1.5 : 1));
    
    // Update running totals
    totalImpressions += dailyImpressions;
    totalLikes += dailyLikes;
    totalSaves += dailySaves;
    totalProfileViews += dailyProfileViews;
    totalWebsiteClicks += dailyWebsiteClicks;
    totalContactClicks += dailyContactClicks;

    // Add both cumulative and daily data
    data.push({
      date: dateStr,
      // Cumulative totals for the top graph
      followers: totalFollowers,
      impressions: totalImpressions,
      likes: totalLikes,
      saves: totalSaves,
      profileViews: totalProfileViews,
      websiteClicks: totalWebsiteClicks,
      contactClicks: totalContactClicks,
      // Daily values for the bottom graph
      dailyImpressions,
      dailyLikes,
      dailyFollowers: dailyFollowerGrowth,
      dailySaves,
      dailyProfileViews,
      dailyWebsiteClicks,
      dailyContactClicks,
      // その日の投稿一覧を追加
      posts: dayPosts
    });
  }
  return data;
}

// Rest of the file remains unchanged
const today = new Date();

// Function to generate post dates starting from today and going backwards
function generatePostDates(count: number, startDate: Date) {
  const dates = [];
  let currentDate = new Date(startDate);
  
  for (let i = 0; i < count; i++) {
    dates.push(new Date(currentDate));
    // Posts every 2-3 days
    currentDate.setDate(currentDate.getDate() - (2 + Math.floor(Math.random() * 2)));
  }
  
  return dates;
}

// Collection of valid Unsplash photo URLs
const photoUrls = [
  'https://images.unsplash.com/photo-1516245834210-c4c142787335',
  'https://images.unsplash.com/photo-1519058082700-08a0b56da9b4',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f',
  'https://images.unsplash.com/photo-1523381294911-8d3cead13475',
  'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e',
  'https://images.unsplash.com/photo-1496747611176-843222e1e57c',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6'
];

// Generate post dates
const postDates = generatePostDates(30, today);

// Define posts with correct dates and valid photo URLs
const recentPosts = postDates.map((date, index) => ({
  id: (index + 1).toString(),
  imageUrl: photoUrls[index % photoUrls.length],
  likes: Math.floor(800 + Math.random() * 2500),
  comments: Math.floor(30 + Math.random() * 200),
  saves: Math.floor(20 + Math.random() * 150),
  reach: Math.floor(3000 + Math.random() * 7000),
  engagement: Number((4 + Math.random() * 6).toFixed(1)),
  posted: date.toISOString()
}));

export const mockInsightData: InsightData = {
  metrics: {
    followers: 24892,
    followersGrowth: 5.2,
    engagement: 4.8,
    impressions: 128750,
    reach: 98234,
    profileViews: 3456,
    websiteClicks: 234,
    contactClicks: 89
  },
  recentPosts,
  weeklyGrowth: [
    { date: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], followers: 24200 },
    { date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], followers: 24350 },
    { date: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], followers: 24500 },
    { date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], followers: 24600 },
    { date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], followers: 24700 },
    { date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], followers: 24800 },
    { date: today.toISOString().split('T')[0], followers: 24892 }
  ],
  engagementRate: [
    { date: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], rate: 4.2 },
    { date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], rate: 4.5 },
    { date: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], rate: 4.8 },
    { date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], rate: 4.6 },
    { date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], rate: 4.9 },
    { date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], rate: 5.1 },
    { date: today.toISOString().split('T')[0], rate: 4.8 }
  ],
  comments: [
    {
      id: '1',
      username: 'photography_lover',
      text: 'Amazing composition! What camera did you use for this shot?',
      timestamp: new Date(today.getTime() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      username: 'travel_enthusiast',
      text: 'This location looks incredible! Where was this taken?',
      timestamp: new Date(today.getTime() - 1 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      username: 'creative_soul',
      text: 'The lighting in this photo is perfect! Do you edit your photos?',
      timestamp: today.toISOString()
    }
  ],
  timeSeriesData: {
    daily: generateTimeSeriesData(30, today, recentPosts),
    weekly: generateTimeSeriesData(26 * 7, today, recentPosts), // 6 months (26 weeks)
    monthly: generateTimeSeriesData(24 * 30, today, recentPosts) // 24 months
  }
};