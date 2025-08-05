import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface Post {
  id: string;
  content: string;
  platforms: string[];
  scheduledTime?: Date;
  status: 'draft' | 'scheduled' | 'published';
  createdAt: Date;
  metrics?: {
    likes: number;
    comments: number;
    shares: number;
    reach: number;
  };
}

export interface ConnectedAccount {
  platform: string;
  username: string;
  connected: boolean;
  color: string;
}

interface AppState {
  posts: Post[];
  connectedAccounts: ConnectedAccount[];
  analytics: {
    totalFollowers: number;
    engagementRate: number;
    postsThisWeek: number;
    reach: number;
    weeklyEngagement: { day: string; value: number }[];
  };
  settings: {
    notifications: boolean;
    darkMode: boolean;
    autoSchedule: boolean;
  };
}

type AppAction =
  | { type: 'ADD_POST'; payload: Post }
  | { type: 'UPDATE_POST'; payload: { id: string; updates: Partial<Post> } }
  | { type: 'DELETE_POST'; payload: string }
  | { type: 'TOGGLE_ACCOUNT'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppState['settings']> }
  | { type: 'LOAD_DATA'; payload: AppState }
  | { type: 'UPDATE_ANALYTICS'; payload: Partial<AppState['analytics']> };

const initialState: AppState = {
  posts: [
    {
      id: '1',
      content: 'Excited to announce our new product launch! 🚀 #innovation #startup',
      platforms: ['twitter', 'linkedin'],
      scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      status: 'scheduled',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      metrics: { likes: 1847, comments: 324, shares: 298, reach: 45200 }
    },
    {
      id: '2',
      content: 'Behind the scenes of our creative process... ✨ #behindthescenes #creativity',
      platforms: ['instagram', 'facebook'],
      scheduledTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
      status: 'scheduled',
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      metrics: { likes: 1523, comments: 156, shares: 243, reach: 32100 }
    },
    {
      id: '3',
      content: 'Industry insights: The future of social media marketing 📊 #marketing #insights',
      platforms: ['linkedin', 'twitter'],
      status: 'published',
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
      metrics: { likes: 892, comments: 89, shares: 219, reach: 28500 }
    }
  ],
  connectedAccounts: [
    { platform: 'twitter', username: '@yourbrand', connected: true, color: '#1DA1F2' },
    { platform: 'instagram', username: '@yourbrand', connected: true, color: '#E4405F' },
    { platform: 'facebook', username: 'Your Brand Page', connected: false, color: '#1877F2' },
    { platform: 'linkedin', username: 'Your Company', connected: true, color: '#0A66C2' },
  ],
  analytics: {
    totalFollowers: 12500,
    engagementRate: 4.8,
    postsThisWeek: 18,
    reach: 245800,
    weeklyEngagement: [
      { day: 'Mon', value: 85 },
      { day: 'Tue', value: 92 },
      { day: 'Wed', value: 78 },
      { day: 'Thu', value: 95 },
      { day: 'Fri', value: 88 },
      { day: 'Sat', value: 76 },
      { day: 'Sun', value: 82 },
    ]
  },
  settings: {
    notifications: true,
    darkMode: false,
    autoSchedule: false,
  }
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_POST':
      const newState = {
        ...state,
        posts: [action.payload, ...state.posts],
      };
      
      // Update analytics when a post is published
      if (action.payload.status === 'published' && action.payload.metrics) {
        newState.analytics = {
          ...state.analytics,
          postsThisWeek: state.analytics.postsThisWeek + 1,
          reach: state.analytics.reach + action.payload.metrics.reach,
          engagementRate: calculateEngagementRate(newState.posts)
        };
      }
      
      return newState;
    case 'UPDATE_POST':
      return {
        ...state,
        posts: state.posts.map(post =>
          post.id === action.payload.id
            ? { ...post, ...action.payload.updates }
            : post
        ),
      };
    case 'DELETE_POST':
      return {
        ...state,
        posts: state.posts.filter(post => post.id !== action.payload),
      };
    case 'TOGGLE_ACCOUNT':
      return {
        ...state,
        connectedAccounts: state.connectedAccounts.map(account =>
          account.platform === action.payload
            ? { ...account, connected: !account.connected }
            : account
        ),
      };
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
    case 'LOAD_DATA':
      return action.payload;
    case 'UPDATE_ANALYTICS':
      return {
        ...state,
        analytics: { ...state.analytics, ...action.payload },
      };
    default:
      return state;
  }
}

function calculateEngagementRate(posts: Post[]): number {
  const publishedPosts = posts.filter(post => post.status === 'published' && post.metrics);
  if (publishedPosts.length === 0) return 0;
  
  const totalEngagement = publishedPosts.reduce((sum, post) => {
    const metrics = post.metrics!;
    return sum + metrics.likes + metrics.comments + metrics.shares;
  }, 0);
  
  const totalReach = publishedPosts.reduce((sum, post) => sum + (post.metrics?.reach || 0), 0);
  
  return totalReach > 0 ? Number(((totalEngagement / totalReach) * 100).toFixed(1)) : 0;
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from AsyncStorage on app start
  useEffect(() => {
    loadData();
  }, []);

  // Save data to AsyncStorage whenever state changes
  useEffect(() => {
    if (state !== initialState) {
      saveData();
    }
  }, [state]);

  const loadData = async () => {
    try {
      const savedData = await AsyncStorage.getItem('socialMediaAppData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Convert date strings back to Date objects
        parsedData.posts = parsedData.posts.map((post: any) => ({
          ...post,
          createdAt: new Date(post.createdAt),
          scheduledTime: post.scheduledTime ? new Date(post.scheduledTime) : undefined,
        }));
        dispatch({ type: 'LOAD_DATA', payload: parsedData });
      }
    } catch (error) {
      // If we're on web and there's an error, we'll just use the initial state
      if (Platform.OS === 'web') {
        // Web platform doesn't have AsyncStorage, use localStorage instead
        try {
          const savedData = localStorage.getItem('socialMediaAppData');
          if (savedData) {
            const parsedData = JSON.parse(savedData);
            parsedData.posts = parsedData.posts.map((post: any) => ({
              ...post,
              createdAt: new Date(post.createdAt),
              scheduledTime: post.scheduledTime ? new Date(post.scheduledTime) : undefined,
            }));
            dispatch({ type: 'LOAD_DATA', payload: parsedData });
          }
        } catch (webError) {
          console.log('Using initial state for web platform');
        }
      }
    }
  };

  const saveData = async () => {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem('socialMediaAppData', JSON.stringify(state));
      } else {
        await AsyncStorage.setItem('socialMediaAppData', JSON.stringify(state));
      }
    } catch (error) {
      console.log('Note: Data persistence may be limited in this environment');
    }
  };

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}