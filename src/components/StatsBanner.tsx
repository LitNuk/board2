import React from 'react';
import { MessageSquare, FileText, ThumbsUp, Users, Activity } from 'lucide-react';
import { GlobalStats, RedditAccount } from '../types';
import { formatNumber } from '../utils/formatters';

interface StatsBannerProps {
  stats: GlobalStats;
  accounts: RedditAccount[];
  selectedHolder: string;
  onSelectHolder: (holder: string) => void;
  onOpenAccountDetail: (username: string) => void;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({
  stats,
  accounts,
  selectedHolder,
  onSelectHolder,
  onOpenAccountDetail,
}) => {
  const avgUpvotes = stats.totalActivities > 0 ? Math.round(stats.totalUpvotes / stats.totalActivities) : 0;
  const replyRatio = stats.totalActivities > 0 ? Math.round((stats.totalComments / stats.totalActivities) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Key Figures — flat ledger row, no boxed cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-5 gap-x-6 py-4 border-y border-slate-800">
        <div>
          <span className="flex items-center gap-1.5 text-[10px] uppercase text-slate-500 font-semibold tracking-widest">
            <Activity className="w-3 h-3 text-orange-400" />
            Total Activities
          </span>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
              {formatNumber(stats.totalActivities)}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">units</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {stats.activeAccounts} account{stats.activeAccounts === 1 ? '' : 's'} active
          </div>
        </div>

        <div className="lg:border-l lg:border-slate-800 lg:pl-6">
          <span className="flex items-center gap-1.5 text-[10px] uppercase text-slate-500 font-semibold tracking-widest">
            <FileText className="w-3 h-3 text-blue-400" />
            Total Posts
          </span>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-blue-400 tracking-tight">
              {formatNumber(stats.totalPosts)}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">threads</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Avg. {avgUpvotes} upvotes / activity</div>
        </div>

        <div className="lg:border-l lg:border-slate-800 lg:pl-6">
          <span className="flex items-center gap-1.5 text-[10px] uppercase text-slate-500 font-semibold tracking-widest">
            <MessageSquare className="w-3 h-3 text-purple-400" />
            Total Comments
          </span>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-purple-400 tracking-tight">
              {formatNumber(stats.totalComments)}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">replies</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">{replyRatio}% of tracked activity</div>
        </div>

        <div className="lg:border-l lg:border-slate-800 lg:pl-6">
          <span className="flex items-center gap-1.5 text-[10px] uppercase text-slate-500 font-semibold tracking-widest">
            <ThumbsUp className="w-3 h-3 text-emerald-400" />
            Total Upvotes
          </span>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400 tracking-tight">
              {formatNumber(stats.totalUpvotes)}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">votes</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">{stats.uniqueSubredditsCount} subreddits covered</div>
        </div>
      </div>

      {/* Operator filter & quick account access — plain text, no chip/pill boxes */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 text-[10px] uppercase text-slate-500 font-semibold tracking-widest">
            <Users className="w-3 h-3 text-slate-500" />
            Operator
          </span>

          <button
            id="filter-holder-all"
            onClick={() => onSelectHolder('all')}
            className={`font-semibold transition-colors ${
              selectedHolder === 'all' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            All ({stats.totalAccounts})
          </button>

          <span className="text-slate-700">·</span>

          <button
            id="filter-holder-litnuke"
            onClick={() => onSelectHolder('LitNuke')}
            className={`inline-flex items-center gap-1.5 font-semibold transition-colors ${
              selectedHolder === 'LitNuke' ? 'text-emerald-400' : 'text-slate-500 hover:text-emerald-400/80'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            LitNuke ({accounts.filter((a) => a.accountHolder === 'LitNuke').length})
          </button>

          <span className="text-slate-700">·</span>

          <button
            id="filter-holder-kim"
            onClick={() => onSelectHolder('Kim')}
            className={`inline-flex items-center gap-1.5 font-semibold transition-colors ${
              selectedHolder === 'Kim' ? 'text-blue-400' : 'text-slate-500 hover:text-blue-400/80'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            Kim ({accounts.filter((a) => a.accountHolder === 'Kim').length})
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] uppercase text-slate-500 font-semibold tracking-widest whitespace-nowrap">
            Accounts
          </span>
          {accounts.slice(0, 7).map((acc, i) => (
            <React.Fragment key={acc.id}>
              {i > 0 && <span className="text-slate-700">·</span>}
              <button
                id={`chip-account-${acc.username}`}
                onClick={() => onOpenAccountDetail(acc.username)}
                className="inline-flex items-center gap-1.5 whitespace-nowrap font-mono font-semibold text-orange-400/90 hover:text-orange-300 transition-colors"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${acc.accountHolder === 'LitNuke' ? 'bg-emerald-400' : 'bg-blue-400'}`}></span>
                u/{acc.username}
              </button>
            </React.Fragment>
          ))}
          {accounts.length > 7 && (
            <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">+{accounts.length - 7} more</span>
          )}
        </div>
      </div>
    </div>
  );
};
