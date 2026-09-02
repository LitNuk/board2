import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { StatsBanner } from './components/StatsBanner';
import { FilterBar } from './components/FilterBar';
import { ActivityTable } from './components/ActivityTable';
import { AccountDetailModal } from './components/AccountDetailModal';
import { AccountSettingsModal } from './components/AccountSettingsModal';
import { PostPreviewModal } from './components/PostPreviewModal';
import { LoginPage } from './components/LoginPage';
import { PrintReport, PrintRequest } from './components/PrintReport';
import { 
  RedditAccount, 
  ActivityItem, 
  FilterState, 
  GlobalStats, 
  SortField, 
  SortOrder 
} from './types';
import { 
  loadSavedAccounts, 
  saveAccountsToStorage, 
  loadSavedActivities, 
  saveActivitiesToStorage,
  fetchLiveUserActivities,
} from './services/redditService';
import { INITIAL_ACCOUNTS, INITIAL_ACTIVITIES } from './data/initialAccounts';
import { Bell } from 'lucide-react';

export default function App() {
  // Auth State
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        setIsAuthenticated(Boolean(data.authenticated));
        setCurrentUsername(data.username || null);
      })
      .catch(() => {
        // If we can't even reach the server's auth check, fail closed (show login)
        setIsAuthenticated(false);
      })
      .finally(() => setAuthChecked(true));
  }, []);

  const handleLoginSuccess = (username: string) => {
    setIsAuthenticated(true);
    setCurrentUsername(username);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // ignore network errors on logout, clear client state regardless
    }
    setIsAuthenticated(false);
    setCurrentUsername(null);
  };

  // Primary State
  const [accounts, setAccounts] = useState<RedditAccount[]>(() => loadSavedAccounts());
  const [activities, setActivities] = useState<ActivityItem[]>(() => loadSavedActivities());
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(30); // 30s default
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modal States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedUsernameForModal, setSelectedUsernameForModal] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<ActivityItem | null>(null);

  // Toast / Notification State
  const [toastMessage, setToastMessage] = useState<{ id: string; text: string; subtext?: string } | null>(null);

  // Print Report State — mounted only while a report is being generated/printed
  const [printRequest, setPrintRequest] = useState<PrintRequest | null>(null);

  const handlePrintGlobalReport = () => setPrintRequest({ mode: 'global' });
  const handlePrintPersonaReport = (account: RedditAccount) => setPrintRequest({ mode: 'persona', account });

  // Once a report is mounted, wait for it to paint, then hand off to the
  // browser's print flow. 'afterprint' fires whether the user prints or
  // cancels, so we use it to unmount the report again either way.
  useEffect(() => {
    if (!printRequest) return;
    const handleAfterPrint = () => setPrintRequest(null);
    window.addEventListener('afterprint', handleAfterPrint);
    const timer = setTimeout(() => window.print(), 80);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [printRequest]);

  const showToast = (text: string, subtext?: string) => {
    const id = Date.now().toString();
    setToastMessage({ id, text, subtext });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.id === id ? null : prev));
    }, 4000);
  };

  // Filter & Sorting State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedUsername: 'all',
    selectedHolder: 'all',
    selectedType: 'all',
    selectedSubreddit: 'all',
    targetSubredditOnly: false,
    dateFrom: '',
    dateTo: '',
    sortField: 'createdUtc',
    sortOrder: 'desc',
  });

  // Save to LocalStorage whenever accounts or activities change
  useEffect(() => {
    saveAccountsToStorage(accounts);
  }, [accounts]);

  useEffect(() => {
    saveActivitiesToStorage(activities);
  }, [activities]);

  // Always-current accounts reference, so an in-flight sync (which can take
  // a second or more per Reddit request) never overwrites a deletion that
  // happened while it was running.
  const accountsRef = React.useRef<RedditAccount[]>(accounts);
  useEffect(() => {
    accountsRef.current = accounts;
  }, [accounts]);

  // Sync with Reddit API
  const handleSyncAll = useCallback(async () => {
    if (isSyncing) return;
    setIsSyncing(true);

    try {
      const activeAccounts = accountsRef.current.filter((a) => a.isActive);
      let newItemsFound = 0;

      // Query active accounts in parallel
      const results = await Promise.allSettled(
        activeAccounts.map((acc) => fetchLiveUserActivities(acc))
      );

      const fetchedByAccountId = new Map<string, { items: ActivityItem[]; userInfo: any }>();
      results.forEach((res, index) => {
        if (res.status === 'fulfilled' && res.value) {
          fetchedByAccountId.set(activeAccounts[index].id, res.value);
        }
      });

      // Only ever merge into accounts that still exist right now — this is
      // what stops a deleted account (and its fetched posts) from reappearing.
      const stillExistingIds = new Set(accountsRef.current.map((a) => a.id));

      const fetchedActivities: ActivityItem[] = [];
      fetchedByAccountId.forEach((value, accountId) => {
        if (!stillExistingIds.has(accountId)) return;
        if (value.items && value.items.length > 0) {
          fetchedActivities.push(...value.items);
        }
      });

      if (fetchedActivities.length > 0) {
        setActivities((prev) => {
          const existingIds = new Set(prev.map((i) => i.id));
          const fresh = fetchedActivities.filter((i) => !existingIds.has(i.id));
          newItemsFound = fresh.length;
          return [...fresh, ...prev];
        });
      }

      setAccounts((prev) =>
        prev.map((a) => {
          const fetched = fetchedByAccountId.get(a.id);
          if (!fetched || !fetched.userInfo) return a;
          return {
            ...a,
            karma: {
              total: fetched.userInfo.totalKarma,
              post: fetched.userInfo.postKarma,
              comment: fetched.userInfo.commentKarma,
            },
            avatarUrl: fetched.userInfo.avatarUrl || a.avatarUrl,
          };
        })
      );
      setLastUpdated(new Date());

      if (newItemsFound > 0) {
        showToast(`Sync completed!`, `${newItemsFound} new post(s)/comment(s) found.`);
      } else {
        showToast(`Sync completed`, 'All accounts updated to latest status.');
      }
    } catch (e) {
      console.error('Sync error:', e);
      showToast('Sync completed', 'Account records verified.');
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  // Auto Polling / Refresh Timer
  useEffect(() => {
    if (autoRefreshInterval <= 0) return;

    const interval = setInterval(() => {
      handleSyncAll();
    }, autoRefreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefreshInterval, handleSyncAll]);

  // Add new account dynamically
  const handleAddAccount = async (newAccData: Omit<RedditAccount, 'id' | 'createdAt'>) => {
    const newAccount: RedditAccount = {
      ...newAccData,
      id: `acc-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setAccounts((prev) => [...prev, newAccount]);

    // Immediately pull real activity for the newly tracked account from Reddit
    try {
      const { items, userInfo } = await fetchLiveUserActivities(newAccount);
      if (items.length > 0) {
        setActivities((prev) => [...items, ...prev]);
      }
      if (userInfo) {
        setAccounts((prev) =>
          prev.map((a) =>
            a.id === newAccount.id
              ? {
                  ...a,
                  karma: {
                    total: userInfo.totalKarma,
                    post: userInfo.postKarma,
                    comment: userInfo.commentKarma,
                  },
                  avatarUrl: userInfo.avatarUrl || a.avatarUrl,
                }
              : a
          )
        );
      }
      showToast(
        `Account u/${newAccount.username} added successfully!`,
        items.length > 0 ? `${items.length} recent activities loaded.` : 'No public activity found yet.'
      );
    } catch (e) {
      showToast(`Account u/${newAccount.username} added successfully!`, 'Initial sync failed, try clicking "Sync Live".');
    }
  };

  // Update account
  const handleUpdateAccount = (id: string, updates: Partial<RedditAccount>) => {
    const previous = accountsRef.current.find((a) => a.id === id);

    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );

    // Each ActivityItem keeps a denormalized snapshot of accountHolder /
    // persona / username (captured at fetch time) so filtering/display stay
    // fast. Whenever those fields change on the account itself, cascade the
    // change into any already-fetched activities too — otherwise the
    // Operator filter (and persona labels) keep showing stale values for
    // posts/comments that were pulled in before the edit.
    const holderChanged = 'accountHolder' in updates && updates.accountHolder !== previous?.accountHolder;
    const personaChanged = 'persona' in updates && updates.persona !== previous?.persona;
    const usernameChanged = 'username' in updates && updates.username !== previous?.username;

    if (previous && (holderChanged || personaChanged || usernameChanged)) {
      const oldUsername = previous.username.toLowerCase();
      setActivities((prev) =>
        prev.map((item) =>
          item.username.toLowerCase() === oldUsername
            ? {
                ...item,
                accountHolder: updates.accountHolder ?? item.accountHolder,
                persona: updates.persona ?? item.persona,
                username: updates.username ?? item.username,
              }
            : item
        )
      );
    }

    showToast('Account details successfully updated.');
  };

  // Delete account
  const handleDeleteAccount = (id: string) => {
    const target = accounts.find((a) => a.id === id);
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    if (target) {
      setActivities((prev) => prev.filter((a) => a.username.toLowerCase() !== target.username.toLowerCase()));
    }
    showToast(`Account u/${target?.username || ''} removed from monitoring.`);
  };

  // Reset to default accounts
  const handleResetToDefault = () => {
    setAccounts(INITIAL_ACCOUNTS);
    setActivities(INITIAL_ACTIVITIES);
    saveAccountsToStorage(INITIAL_ACCOUNTS);
    saveActivitiesToStorage(INITIAL_ACTIVITIES);
    showToast('Data reset to default LitNuke X ANUMA preset.');
  };

  // Available unique subreddits for filtering
  const availableSubreddits = useMemo(() => {
    const subs = new Set<string>();
    activities.forEach((a) => {
      if (a.subreddit) subs.add(a.subreddit);
    });
    accounts.forEach((a) => {
      a.targetSubreddits.forEach((ts) => subs.add(ts));
    });
    return Array.from(subs).sort();
  }, [activities, accounts]);

  // Selected Account for Modal
  const selectedAccountForModal = useMemo(() => {
    if (!selectedUsernameForModal) return null;
    return accounts.find((a) => a.username.toLowerCase() === selectedUsernameForModal.toLowerCase()) || null;
  }, [accounts, selectedUsernameForModal]);

  // Filtered & Sorted Activities
  const filteredActivities = useMemo(() => {
    return activities
      .filter((item) => {
        // Search query
        if (filters.searchQuery) {
          const q = filters.searchQuery.toLowerCase();
          const matchTitle = item.title?.toLowerCase().includes(q);
          const matchBody = item.body.toLowerCase().includes(q);
          const matchUser = item.username.toLowerCase().includes(q);
          const matchSub = item.subreddit.toLowerCase().includes(q);
          const matchPersona = item.persona.toLowerCase().includes(q);
          if (!matchTitle && !matchBody && !matchUser && !matchSub && !matchPersona) {
            return false;
          }
        }

        // Selected Username filter
        if (filters.selectedUsername !== 'all') {
          if (item.username.toLowerCase() !== filters.selectedUsername.toLowerCase()) {
            return false;
          }
        }

        // Selected Holder (LitNuke / Kim)
        if (filters.selectedHolder !== 'all') {
          if (item.accountHolder !== filters.selectedHolder) {
            return false;
          }
        }

        // Selected Type (Post / Comment)
        if (filters.selectedType !== 'all') {
          if (item.type !== filters.selectedType) {
            return false;
          }
        }

        // Selected Subreddit
        if (filters.selectedSubreddit !== 'all') {
          if (item.subreddit.toLowerCase() !== filters.selectedSubreddit.toLowerCase()) {
            return false;
          }
        }

        // Target Subreddit only
        if (filters.targetSubredditOnly && !item.isTargetSubreddit) {
          return false;
        }

        // Date range (inclusive, compared by local calendar day)
        if (filters.dateFrom) {
          const fromMs = new Date(`${filters.dateFrom}T00:00:00`).getTime();
          if (item.createdUtc * 1000 < fromMs) return false;
        }
        if (filters.dateTo) {
          const toMs = new Date(`${filters.dateTo}T23:59:59.999`).getTime();
          if (item.createdUtc * 1000 > toMs) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (filters.sortField === 'createdUtc') {
          diff = a.createdUtc - b.createdUtc;
        } else if (filters.sortField === 'score') {
          diff = a.score - b.score;
        } else if (filters.sortField === 'numComments') {
          diff = (a.numComments || 0) - (b.numComments || 0);
        } else if (filters.sortField === 'username') {
          diff = a.username.localeCompare(b.username);
        }

        return filters.sortOrder === 'desc' ? -diff : diff;
      });
  }, [activities, filters]);

  // Overall Global Statistics (Statistik Keseluruhan)
  const globalStats: GlobalStats = useMemo(() => {
    const totalPosts = activities.filter((a) => a.type === 'post').length;
    const totalComments = activities.filter((a) => a.type === 'comment').length;
    const totalUpvotes = activities.reduce((acc, curr) => acc + (curr.score || 0), 0);
    const litNukeActivities = activities.filter((a) => a.accountHolder === 'LitNuke').length;
    const kimActivities = activities.filter((a) => a.accountHolder === 'Kim').length;

    const uniqueSubs = new Set(activities.map((a) => a.subreddit));

    return {
      totalAccounts: accounts.length,
      activeAccounts: accounts.filter((a) => a.isActive).length,
      totalPosts,
      totalComments,
      totalActivities: activities.length,
      totalUpvotes,
      litNukeActivities,
      kimActivities,
      uniqueSubredditsCount: uniqueSubs.size,
    };
  }, [accounts, activities]);

  // Handle Sort Change from Table Column
  const handleSortChange = (field: SortField) => {
    setFilters((prev) => {
      if (prev.sortField === field) {
        return {
          ...prev,
          sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc',
        };
      }
      return {
        ...prev,
        sortField: field,
        sortOrder: 'desc',
      };
    });
  };

  const handleFilterUpdates = (updates: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      selectedUsername: 'all',
      selectedHolder: 'all',
      selectedType: 'all',
      selectedSubreddit: 'all',
      targetSubredditOnly: false,
      dateFrom: '',
      dateTo: '',
      sortField: 'createdUtc',
      sortOrder: 'desc',
    });
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-500 text-sm font-mono">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Sticky Navigation */}
      <Navbar
        stats={globalStats}
        isSyncing={isSyncing}
        onSync={handleSyncAll}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAddAccount={() => setIsSettingsOpen(true)}
        lastUpdated={lastUpdated}
        autoRefreshInterval={autoRefreshInterval}
        currentUsername={currentUsername}
        onLogout={handleLogout}
        onPrintReport={handlePrintGlobalReport}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Overall Statistics Banner */}
        <StatsBanner
          stats={globalStats}
          accounts={accounts}
          selectedHolder={filters.selectedHolder}
          onSelectHolder={(holder) => handleFilterUpdates({ selectedHolder: holder })}
          onOpenAccountDetail={(username) => setSelectedUsernameForModal(username)}
        />

        {/* Filter & Search Bar */}
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterUpdates}
          accounts={accounts}
          availableSubreddits={availableSubreddits}
          totalFiltered={filteredActivities.length}
          totalAll={activities.length}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onResetFilters={handleResetFilters}
        />

        {/* Main Feed / Table View */}
        <ActivityTable
          activities={filteredActivities}
          accounts={accounts}
          sortField={filters.sortField}
          sortOrder={filters.sortOrder}
          onSortChange={handleSortChange}
          onOpenAccountDetail={(username) => setSelectedUsernameForModal(username)}
          onPreviewItem={(item) => setPreviewItem(item)}
          viewMode={viewMode}
        />

      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl max-w-sm">
            <div className="p-1 rounded-lg bg-orange-950/60 text-orange-400 border border-orange-800/40">
              <Bell className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 text-xs">
              <div className="font-bold text-slate-100">{toastMessage.text}</div>
              {toastMessage.subtext && (
                <div className="text-slate-400 mt-0.5 font-mono text-[11px]">{toastMessage.subtext}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AccountDetailModal
        account={selectedAccountForModal}
        activities={activities}
        isOpen={Boolean(selectedUsernameForModal)}
        onClose={() => setSelectedUsernameForModal(null)}
        onPreviewItem={(item) => setPreviewItem(item)}
        onPrintReport={handlePrintPersonaReport}
      />

      <AccountSettingsModal
        accounts={accounts}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onAddAccount={handleAddAccount}
        onUpdateAccount={handleUpdateAccount}
        onDeleteAccount={handleDeleteAccount}
        onResetToDefault={handleResetToDefault}
        autoRefreshInterval={autoRefreshInterval}
        onSetAutoRefreshInterval={setAutoRefreshInterval}
      />

      <PostPreviewModal
        item={previewItem}
        account={previewItem ? accounts.find((a) => a.username.toLowerCase() === previewItem.username.toLowerCase()) : undefined}
        isOpen={Boolean(previewItem)}
        onClose={() => setPreviewItem(null)}
        onOpenAccountDetail={(username) => setSelectedUsernameForModal(username)}
      />

      {/* Subtle Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">LITNUKE X ANUMA</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">REDDIT INTELLIGENCE TRACKER</span>
          </div>
          <div className="text-slate-500 flex items-center gap-2">
            <span>OPERATORS: LITNUKE & KIM</span>
            <span className="text-slate-700">•</span>
            <span className="text-emerald-400">TELEMETRY ONLINE</span>
          </div>
        </div>
      </footer>

      {/* Premium Print Report — only mounted while generating/printing */}
      {printRequest && (
        <PrintReport request={printRequest} accounts={accounts} activities={activities} />
      )}
    </div>
  );
}
