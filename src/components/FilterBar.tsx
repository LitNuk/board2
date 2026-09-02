import React from 'react';
import { Search, LayoutList, LayoutGrid, CheckCircle2, X, Calendar } from 'lucide-react';
import { FilterState, RedditAccount } from '../types';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  accounts: RedditAccount[];
  availableSubreddits: string[];
  totalFiltered: number;
  totalAll: number;
  viewMode: 'table' | 'cards';
  onViewModeChange: (mode: 'table' | 'cards') => void;
  onResetFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  accounts,
  availableSubreddits,
  totalFiltered,
  totalAll,
  viewMode,
  onViewModeChange,
  onResetFilters,
}) => {
  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.selectedUsername !== 'all' ||
    filters.selectedHolder !== 'all' ||
    filters.selectedType !== 'all' ||
    filters.selectedSubreddit !== 'all' ||
    filters.targetSubredditOnly ||
    filters.dateFrom !== '' ||
    filters.dateTo !== '';

  const dateRangeInvalid = Boolean(filters.dateFrom && filters.dateTo && filters.dateFrom > filters.dateTo);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-3.5 space-y-3 shadow-sm">
      {/* Top Search & Primary Filters Row */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5">

        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            id="input-search-feed"
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            placeholder="Search titles, body content, subreddit, persona, or username..."
            className="w-full pl-9 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-600 transition-colors"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ searchQuery: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">

          {/* Account Filter */}
          <div className="flex-1 sm:flex-initial min-w-[140px]">
            <select
              id="select-filter-account"
              value={filters.selectedUsername}
              onChange={(e) => onFilterChange({ selectedUsername: e.target.value })}
              className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono font-medium text-slate-200 focus:outline-none focus:border-orange-600"
            >
              <option value="all">All Accounts ({accounts.length})</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.username}>
                  u/{acc.username} ({acc.accountHolder})
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter (Post / Comment) */}
          <div className="flex-1 sm:flex-initial min-w-[120px]">
            <select
              id="select-filter-type"
              value={filters.selectedType}
              onChange={(e) => onFilterChange({ selectedType: e.target.value })}
              className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-medium text-slate-200 focus:outline-none focus:border-orange-600"
            >
              <option value="all">All Types</option>
              <option value="post">POSTS Only</option>
              <option value="comment">COMMENTS Only</option>
            </select>
          </div>

          {/* Subreddit Filter */}
          <div className="flex-1 sm:flex-initial min-w-[130px]">
            <select
              id="select-filter-subreddit"
              value={filters.selectedSubreddit}
              onChange={(e) => onFilterChange({ selectedSubreddit: e.target.value })}
              className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-orange-600"
            >
              <option value="all">All Subreddits</option>
              {availableSubreddits.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order Selector */}
          <div className="flex-1 sm:flex-initial min-w-[150px]">
            <select
              id="select-sort-order"
              value={`${filters.sortField}_${filters.sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('_');
                onFilterChange({
                  sortField: field as any,
                  sortOrder: order as any,
                });
              }}
              className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-medium text-slate-200 focus:outline-none focus:border-orange-600"
            >
              <option value="createdUtc_desc">Time: Newest to Oldest</option>
              <option value="createdUtc_asc">Time: Oldest to Newest</option>
              <option value="score_desc">Highest Upvotes (+)</option>
              <option value="numComments_desc">Most Comments</option>
              <option value="username_asc">Account Name (A-Z)</option>
              <option value="username_desc">Account Name (Z-A)</option>
            </select>
          </div>

        </div>

      </div>

      {/* Date Range Row */}
      <div className="flex flex-wrap items-center gap-2.5 pt-2.5 border-t border-slate-800/80">
        <span className="flex items-center gap-1.5 text-[10px] uppercase text-slate-500 font-semibold tracking-widest">
          <Calendar className="w-3 h-3 text-slate-500" />
          Date Range
        </span>

        <input
          id="input-date-from"
          type="date"
          value={filters.dateFrom}
          max={filters.dateTo || undefined}
          onChange={(e) => onFilterChange({ dateFrom: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-orange-600 [color-scheme:dark]"
        />
        <span className="text-slate-600 text-xs">to</span>
        <input
          id="input-date-to"
          type="date"
          value={filters.dateTo}
          min={filters.dateFrom || undefined}
          onChange={(e) => onFilterChange({ dateTo: e.target.value })}
          className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-orange-600 [color-scheme:dark]"
        />

        {(filters.dateFrom || filters.dateTo) && (
          <button
            onClick={() => onFilterChange({ dateFrom: '', dateTo: '' })}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Clear dates
          </button>
        )}

        {dateRangeInvalid && (
          <span className="text-[11px] text-red-400">Start date is after end date — no results will match.</span>
        )}
      </div>

      {/* Bottom Row: Target Subreddit Toggle & View Switcher & Result Count */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-800/80 text-xs">

        <div className="flex items-center gap-3 flex-wrap">
          {/* Target Subreddit match filter */}
          <button
            id="btn-toggle-target-subreddit"
            onClick={() => onFilterChange({ targetSubredditOnly: !filters.targetSubredditOnly })}
            className={`inline-flex items-center gap-1.5 text-xs font-medium transition-colors ${
              filters.targetSubredditOnly ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${filters.targetSubredditOnly ? 'text-emerald-400' : 'text-slate-600'}`} />
            <span>Target Subreddits Only</span>
          </button>

          {hasActiveFilters && (
            <button
              id="btn-reset-filters"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 font-semibold"
            >
              [Reset Filters]
            </button>
          )}

          <span className="text-slate-500 text-xs font-mono">
            Showing: <strong className="text-slate-300 font-bold">{totalFiltered}</strong> / {totalAll} activities
          </span>
        </div>

        {/* View mode switcher */}
        <div className="flex items-center gap-3 text-xs">
          <button
            id="view-mode-table"
            onClick={() => onViewModeChange('table')}
            title="Main Table View"
            className={`flex items-center gap-1.5 font-medium transition-colors ${
              viewMode === 'table' ? 'text-orange-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutList className="w-3.5 h-3.5" />
            <span>Main Table</span>
          </button>

          <span className="text-slate-700">·</span>

          <button
            id="view-mode-cards"
            onClick={() => onViewModeChange('cards')}
            title="Feed Cards View"
            className={`flex items-center gap-1.5 font-medium transition-colors ${
              viewMode === 'cards' ? 'text-orange-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Feed Cards</span>
          </button>
        </div>

      </div>
    </div>
  );
};
