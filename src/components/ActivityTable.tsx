import React from 'react';
import {
  ArrowUpDown,
  ArrowUpNarrowWide,
  ArrowDownWideNarrow,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { ActivityItem, RedditAccount, SortField, SortOrder } from '../types';
import { formatExactDateTime, formatRelativeTime, formatNumber } from '../utils/formatters';

interface ActivityTableProps {
  activities: ActivityItem[];
  accounts: RedditAccount[];
  sortField: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField) => void;
  onOpenAccountDetail: (username: string) => void;
  onPreviewItem: (item: ActivityItem) => void;
  viewMode: 'table' | 'cards';
}

export const ActivityTable: React.FC<ActivityTableProps> = ({
  activities,
  accounts,
  sortField,
  sortOrder,
  onSortChange,
  onOpenAccountDetail,
  onPreviewItem,
  viewMode,
}) => {
  const getAccount = (username: string) => {
    return accounts.find((a) => a.username.toLowerCase() === username.toLowerCase());
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity" />;
    }
    return sortOrder === 'desc' ? (
      <ArrowDownWideNarrow className="w-3 h-3 text-orange-400" />
    ) : (
      <ArrowUpNarrowWide className="w-3 h-3 text-orange-400" />
    );
  };

  if (activities.length === 0) {
    return (
      <div className="py-16 text-center">
        <AlertCircle className="w-6 h-6 text-slate-600 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">No Activities Found</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          No posts or comments match the active filters. Try adjusting your search query or reset filters.
        </p>
      </div>
    );
  }

  // Card View — divided list, no boxed cards
  if (viewMode === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
        {activities.map((item) => {
          const account = getAccount(item.username);
          return (
            <div
              key={item.id}
              className="py-3.5 border-b border-slate-800/70 flex flex-col justify-between group"
            >
              <div>
                {/* Header: Account & Type */}
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <button
                    onClick={() => onOpenAccountDetail(item.username)}
                    className="group/acc flex items-center gap-2 text-left min-w-0"
                  >
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-950 border border-slate-800 flex-shrink-0 flex items-center justify-center text-xs font-bold text-orange-400">
                      {account?.avatarUrl ? (
                        <img
                          src={account.avatarUrl}
                          alt={item.username}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        item.username.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-orange-400 group-hover/acc:text-orange-300 transition-colors truncate">
                          u/{item.username}
                        </span>
                        <span className="text-slate-700">·</span>
                        <span
                          className={`text-[10px] font-semibold ${
                            item.accountHolder === 'LitNuke' ? 'text-emerald-400' : 'text-blue-400'
                          }`}
                        >
                          {item.accountHolder}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 italic truncate max-w-[200px]">
                        {item.persona}
                      </p>
                    </div>
                  </button>

                  <span
                    className={`text-[10px] font-mono font-bold uppercase tracking-wider flex-shrink-0 ${
                      item.type === 'post' ? 'text-blue-400' : 'text-purple-400'
                    }`}
                  >
                    {item.type === 'post' ? 'Post' : 'Comment'}
                  </span>
                </div>

                {/* Content */}
                <div className="my-1.5 space-y-1">
                  {item.title && (
                    <h4
                      onClick={() => onPreviewItem(item)}
                      className="text-xs font-bold text-slate-200 hover:text-orange-400 cursor-pointer line-clamp-2 leading-snug transition-colors"
                    >
                      {item.title}
                    </h4>
                  )}
                  {item.parentTitle && !item.title && (
                    <p className="text-[11px] text-slate-500 italic line-clamp-1">
                      Context: &quot;{item.parentTitle}&quot;
                    </p>
                  )}
                  <p
                    onClick={() => onPreviewItem(item)}
                    className="text-xs text-slate-300 line-clamp-3 leading-relaxed cursor-pointer hover:text-white transition-colors"
                  >
                    {item.body}
                  </p>
                </div>
              </div>

              {/* Footer: Metadata & Actions */}
              <div className="pt-1 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="text-slate-500 font-mono text-[10px]">{item.subreddit}</span>
                  <span className="inline-flex items-center gap-0.5 font-mono font-bold text-xs text-emerald-400">
                    +{formatNumber(item.score)}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] text-slate-500 font-mono" title={formatExactDateTime(item.createdUtc)}>
                    {formatRelativeTime(item.createdUtc)}
                  </span>

                  <button
                    onClick={() => onPreviewItem(item)}
                    className="text-slate-500 hover:text-slate-200 transition-colors"
                    title="Preview"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href={item.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-500 hover:text-orange-400 transition-colors font-mono text-xs"
                    title="Open on Reddit"
                  >
                    ↗
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Main Table View
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-950 text-slate-500 uppercase font-bold text-[10px] tracking-wider select-none sticky top-0 border-b border-slate-800">
            <tr>
              <th
                onClick={() => onSortChange('createdUtc')}
                className="py-3 px-4 cursor-pointer hover:text-slate-300 transition-colors group"
                style={{ width: '160px' }}
              >
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>Timestamp</span>
                  {renderSortIcon('createdUtc')}
                </div>
              </th>

              <th
                onClick={() => onSortChange('username')}
                className="py-3 px-4 cursor-pointer hover:text-slate-300 transition-colors group"
                style={{ width: '200px' }}
              >
                <div className="flex items-center gap-1.5">
                  <span>Account</span>
                  {renderSortIcon('username')}
                </div>
              </th>

              <th className="py-3 px-3" style={{ width: '90px' }}>
                <span>Type</span>
              </th>

              <th className="py-3 px-4">
                <span>Context / Title</span>
              </th>

              <th className="py-3 px-3" style={{ width: '130px' }}>
                <span>Subreddit</span>
              </th>

              <th
                onClick={() => onSortChange('score')}
                className="py-3 px-4 cursor-pointer hover:text-slate-300 transition-colors group text-right"
                style={{ width: '90px' }}
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Votes</span>
                  {renderSortIcon('score')}
                </div>
              </th>

              <th className="py-3 px-3 text-center" style={{ width: '60px' }}>
                <span></span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800">
            {activities.map((item, idx) => {
              const account = getAccount(item.username);
              const exactDateTime = formatExactDateTime(item.createdUtc);
              const relativeTime = formatRelativeTime(item.createdUtc);

              return (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-800/40 transition-colors group ${
                    idx % 2 === 0 ? 'bg-slate-900/40' : 'bg-slate-900/10'
                  }`}
                >
                  {/* Timestamp */}
                  <td className="py-3 px-4 whitespace-nowrap align-top font-mono text-slate-400 text-xs">
                    <div>{exactDateTime.split(' ')[1] || exactDateTime}</div>
                    <div className="text-[10px] text-slate-600 font-mono mt-0.5">{relativeTime}</div>
                  </td>

                  {/* Account */}
                  <td className="py-3 px-4 align-top">
                    <div className="flex items-start gap-2">
                      <button
                        onClick={() => onOpenAccountDetail(item.username)}
                        className="w-6 h-6 rounded-full overflow-hidden bg-slate-950 border border-slate-800 flex-shrink-0 flex items-center justify-center text-xs font-bold text-orange-400 hover:ring-1 hover:ring-orange-500 transition-all mt-0.5"
                        title="View Profile"
                      >
                        {account?.avatarUrl ? (
                          <img
                            src={account.avatarUrl}
                            alt={item.username}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          item.username.charAt(0).toUpperCase()
                        )}
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => onOpenAccountDetail(item.username)}
                            className="font-mono font-bold text-orange-400 hover:underline transition-colors truncate text-left text-xs"
                            title="Click for profile"
                          >
                            u/{item.username}
                          </button>
                          <span className="text-slate-700">·</span>
                          <span
                            className={`text-[10px] font-semibold ${
                              item.accountHolder === 'LitNuke' ? 'text-emerald-400' : 'text-blue-400'
                            }`}
                          >
                            {item.accountHolder}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 italic truncate max-w-[150px]">
                          {item.persona}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="py-3 px-3 whitespace-nowrap align-top">
                    <span
                      className={`text-[10px] font-bold font-mono tracking-wider ${
                        item.type === 'post' ? 'text-blue-400' : 'text-purple-400'
                      }`}
                    >
                      {item.type === 'post' ? 'POST' : 'COMMENT'}
                    </span>
                  </td>

                  {/* Content / Title */}
                  <td className="py-3 px-4 align-top max-w-md">
                    {item.title ? (
                      <div>
                        <button
                          onClick={() => onPreviewItem(item)}
                          className="text-left font-semibold text-slate-200 hover:text-orange-400 transition-colors line-clamp-1 leading-snug text-xs"
                        >
                          {item.title}
                        </button>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 leading-relaxed">
                          {item.body}
                        </p>
                      </div>
                    ) : (
                      <div>
                        {item.parentTitle && (
                          <p className="text-[10px] text-slate-500 italic line-clamp-1 mb-0.5">
                            Context: &quot;{item.parentTitle}&quot;
                          </p>
                        )}
                        <button
                          onClick={() => onPreviewItem(item)}
                          className="text-left text-slate-300 hover:text-white text-xs line-clamp-2 leading-relaxed"
                        >
                          &ldquo;{item.body}&rdquo;
                        </button>
                      </div>
                    )}
                  </td>

                  {/* Subreddit */}
                  <td className="py-3 px-3 whitespace-nowrap align-top">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-slate-400">{item.subreddit}</span>
                      {item.isTargetSubreddit && (
                        <span title="Target Subreddit">
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Up-votes */}
                  <td className="py-3 px-4 whitespace-nowrap align-top text-right">
                    <div className="font-mono font-bold text-xs text-emerald-400">
                      +{formatNumber(item.score)}
                    </div>
                    {item.numComments !== undefined && item.numComments > 0 && (
                      <div className="text-[10px] text-slate-600 font-mono mt-0.5">
                        {item.numComments} replies
                      </div>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3 whitespace-nowrap align-top text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onPreviewItem(item)}
                        className="p-1 rounded text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                        title="Preview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <a
                        href={item.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-slate-500 hover:text-orange-400 transition-colors font-mono text-sm"
                        title="Open on Reddit"
                      >
                        ↗
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
