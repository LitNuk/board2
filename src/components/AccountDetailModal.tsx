import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Search,
  CheckCircle,
  Printer
} from 'lucide-react';
import { RedditAccount, ActivityItem } from '../types';
import { formatExactDateTime, formatRelativeTime, formatNumber } from '../utils/formatters';

interface AccountDetailModalProps {
  account: RedditAccount | null;
  activities: ActivityItem[];
  isOpen: boolean;
  onClose: () => void;
  onPreviewItem: (item: ActivityItem) => void;
  onPrintReport: (account: RedditAccount) => void;
}

export const AccountDetailModal: React.FC<AccountDetailModalProps> = ({
  account,
  activities,
  isOpen,
  onClose,
  onPreviewItem,
  onPrintReport,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'post' | 'comment'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen || !account) return null;

  // Filter activities for this account
  const accountActivities = activities.filter(
    (a) => a.username.toLowerCase() === account.username.toLowerCase()
  );

  const posts = accountActivities.filter((a) => a.type === 'post');
  const comments = accountActivities.filter((a) => a.type === 'comment');
  const totalScore = accountActivities.reduce((acc, curr) => acc + curr.score, 0);
  const avgScore = accountActivities.length > 0 ? Math.round(totalScore / accountActivities.length) : 0;

  const filteredList = accountActivities.filter((item) => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchBody = item.body.toLowerCase().includes(q);
      const matchSub = item.subreddit.toLowerCase().includes(q);
      return matchTitle || matchBody || matchSub;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header / Banner */}
        <div className="relative px-5 py-4 bg-slate-950 border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5">
            {/* Avatar */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 p-0.5 flex-shrink-0 flex items-center justify-center text-xl font-bold text-orange-400">
              {account.avatarUrl ? (
                <img
                  src={account.avatarUrl}
                  alt={account.username}
                  className="w-full h-full object-cover rounded-lg"
                  referrerPolicy="no-referrer"
                />
              ) : (
                account.username.charAt(0).toUpperCase()
              )}
            </div>

            {/* Title & Meta */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-orange-400 font-mono tracking-tight">
                  u/{account.username}
                </h2>

                <span
                  className={`text-xs font-semibold ${
                    account.accountHolder === 'LitNuke' ? 'text-emerald-400' : 'text-blue-400'
                  }`}
                >
                  {account.accountHolder}
                </span>

                <span className="text-slate-700 text-xs">·</span>

                <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                  <span className={`w-1.5 h-1.5 rounded-full ${account.isActive ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
                  {account.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Persona */}
              <div className="mt-1 flex items-start gap-1.5 text-xs text-slate-300">
                <span className="font-semibold text-slate-500">Persona</span>
                <span className="text-slate-200">{account.persona}</span>
              </div>

              {/* Target Subreddits */}
              <div className="mt-1 flex items-start gap-1.5 text-xs">
                <span className="font-semibold text-slate-500 whitespace-nowrap">Targets</span>
                <span className="text-slate-400 font-mono">
                  {account.targetSubreddits.join('  ·  ')}
                </span>
              </div>
            </div>

            {/* Direct Link to Reddit Profile */}
            <div className="self-end sm:self-center flex items-center gap-4">
              <button
                onClick={() => onPrintReport(account)}
                title="Print a premium account report"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-orange-400 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Report</span>
              </button>
              <a
                href={`https://reddit.com/user/${account.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors"
              >
                <span>Open on Reddit</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Account Karma & Metric Figures — flat, no boxed cards */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-3 gap-x-6">
            <div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block">Total Karma</span>
              <span className="text-lg font-bold text-emerald-400 mt-0.5 block font-mono">
                {formatNumber(account.karma?.total || 0)}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                Post {formatNumber(account.karma?.post || 0)} · Comment {formatNumber(account.karma?.comment || 0)}
              </span>
            </div>

            <div className="sm:border-l sm:border-slate-800 sm:pl-6">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block">Posts Monitored</span>
              <span className="text-lg font-bold text-blue-400 mt-0.5 block font-mono">
                {posts.length}
              </span>
              <span className="text-[10px] text-slate-500">Threads created</span>
            </div>

            <div className="sm:border-l sm:border-slate-800 sm:pl-6">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block">Comments Monitored</span>
              <span className="text-lg font-bold text-purple-400 mt-0.5 block font-mono">
                {comments.length}
              </span>
              <span className="text-[10px] text-slate-500">Active replies</span>
            </div>

            <div className="sm:border-l sm:border-slate-800 sm:pl-6">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block">Tracker Upvotes</span>
              <span className="text-lg font-bold text-orange-400 mt-0.5 block font-mono">
                +{formatNumber(totalScore)}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Average {avgScore} / activity</span>
            </div>
          </div>
        </div>

        {/* Activity Feed Section */}
        <div className="flex-1 flex flex-col min-h-0 p-5 overflow-hidden">

          {/* Header & Filter for Account Activities */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Account Activities <span className="text-slate-500 font-normal normal-case">({filteredList.length})</span>
            </h4>

            <div className="flex items-center gap-4">
              {/* Type Filter — plain text toggle */}
              <div className="flex items-center gap-2.5 text-xs">
                <button
                  onClick={() => setFilterType('all')}
                  className={`font-semibold transition-colors ${
                    filterType === 'all' ? 'text-orange-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  All ({accountActivities.length})
                </button>
                <span className="text-slate-700">·</span>
                <button
                  onClick={() => setFilterType('post')}
                  className={`font-semibold transition-colors ${
                    filterType === 'post' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Posts ({posts.length})
                </button>
                <span className="text-slate-700">·</span>
                <button
                  onClick={() => setFilterType('comment')}
                  className={`font-semibold transition-colors ${
                    filterType === 'comment' ? 'text-purple-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Comments ({comments.length})
                </button>
              </div>

              {/* In-modal Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-0 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-5 pr-1 py-1 bg-transparent border-b border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-600 w-32 sm:w-40"
                />
              </div>
            </div>
          </div>

          {/* Activity Scroll List — divided rows, not boxed cards */}
          <div className="flex-1 overflow-y-auto pr-1 divide-y divide-slate-800/70">
            {filteredList.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No activities match the current filter.
              </div>
            ) : (
              filteredList.map((item) => (
                <div
                  key={item.id}
                  className="py-3 flex flex-col justify-between group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider">
                      <span className={item.type === 'post' ? 'font-bold text-blue-400' : 'font-bold text-purple-400'}>
                        {item.type === 'post' ? 'Post' : 'Comment'}
                      </span>
                      <span className="text-slate-700">·</span>
                      <span className="text-slate-400 normal-case">{item.subreddit}</span>
                      {item.isTargetSubreddit && (
                        <>
                          <span className="text-slate-700">·</span>
                          <span className="text-emerald-400 flex items-center gap-1 normal-case">
                            <CheckCircle className="w-3 h-3" /> Target
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono whitespace-nowrap">
                      <span>{formatExactDateTime(item.createdUtc)}</span>
                      <span>({formatRelativeTime(item.createdUtc)})</span>
                    </div>
                  </div>

                  {/* Content body */}
                  <div className="my-2">
                    {item.title && (
                      <h5
                        onClick={() => onPreviewItem(item)}
                        className="text-xs font-bold text-slate-200 group-hover:text-orange-400 cursor-pointer transition-colors leading-snug"
                      >
                        {item.title}
                      </h5>
                    )}
                    {item.parentTitle && (
                      <p className="text-[10px] text-slate-500 italic mb-0.5">
                        Context: &quot;{item.parentTitle}&quot;
                      </p>
                    )}
                    <p
                      onClick={() => onPreviewItem(item)}
                      className="text-xs text-slate-300 line-clamp-2 leading-relaxed cursor-pointer hover:text-white mt-0.5"
                    >
                      {item.body}
                    </p>
                  </div>

                  {/* Footer item */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-xs text-emerald-400">
                        +{formatNumber(item.score)}
                      </span>
                      {item.numComments !== undefined && item.numComments > 0 && (
                        <span className="text-slate-500 font-mono text-[10px]">
                          {item.numComments} replies
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onPreviewItem(item)}
                        className="text-xs text-slate-400 hover:text-white transition-colors"
                      >
                        Preview
                      </button>

                      <a
                        href={item.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-500 hover:text-orange-400 transition-colors font-mono text-xs"
                      >
                        ↗ Reddit
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
