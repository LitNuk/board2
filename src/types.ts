export type AccountHolder = 'LitNuke' | 'Kim';

export interface RedditAccount {
  id: string;
  username: string;
  persona: string;
  targetSubreddits: string[];
  accountHolder: AccountHolder;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  avatarUrl?: string;
  karma?: {
    total: number;
    post: number;
    comment: number;
  };
  redditCreatedUtc?: number;
}

export type ActivityType = 'post' | 'comment';

export interface ActivityItem {
  id: string;
  accountId: string;
  username: string;
  accountHolder: AccountHolder;
  persona: string;
  type: ActivityType;
  title?: string;
  body: string;
  subreddit: string;
  score: number;
  upvoteRatio?: number;
  numComments?: number;
  createdUtc: number; // Unix timestamp in seconds
  permalink: string;
  url?: string;
  parentTitle?: string;
  mediaUrl?: string;
  isTargetSubreddit: boolean;
}

export interface AccountStats {
  username: string;
  totalPosts: number;
  totalComments: number;
  totalScore: number;
  averageScore: number;
  topSubreddit: string;
  lastActiveUtc: number;
}

export interface GlobalStats {
  totalAccounts: number;
  activeAccounts: number;
  totalPosts: number;
  totalComments: number;
  totalActivities: number;
  totalUpvotes: number;
  litNukeActivities: number;
  kimActivities: number;
  uniqueSubredditsCount: number;
}

export type SortField = 'createdUtc' | 'score' | 'numComments' | 'username';
export type SortOrder = 'asc' | 'desc';

export interface FilterState {
  searchQuery: string;
  selectedUsername: string; // 'all' or specific username
  selectedHolder: string; // 'all' | 'LitNuke' | 'Kim'
  selectedType: string; // 'all' | 'post' | 'comment'
  selectedSubreddit: string; // 'all' or specific subreddit
  targetSubredditOnly: boolean;
  dateFrom: string; // 'YYYY-MM-DD' or '' for no lower bound
  dateTo: string; // 'YYYY-MM-DD' or '' for no upper bound
  sortField: SortField;
  sortOrder: SortOrder;
}
