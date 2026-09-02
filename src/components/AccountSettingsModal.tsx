import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  UserPlus, 
  Radio, 
  Sparkles, 
  Target, 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw,
  Clock,
  ExternalLink
} from 'lucide-react';
import { RedditAccount, AccountHolder } from '../types';
import { verifyRedditUsername } from '../services/redditService';
import { normalizeSubreddit } from '../utils/formatters';

interface AccountSettingsModalProps {
  accounts: RedditAccount[];
  isOpen: boolean;
  onClose: () => void;
  onAddAccount: (account: Omit<RedditAccount, 'id' | 'createdAt'>) => Promise<void>;
  onUpdateAccount: (id: string, updates: Partial<RedditAccount>) => void;
  onDeleteAccount: (id: string) => void;
  onResetToDefault: () => void;
  autoRefreshInterval: number;
  onSetAutoRefreshInterval: (seconds: number) => void;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  accounts,
  isOpen,
  onClose,
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
  onResetToDefault,
  autoRefreshInterval,
  onSetAutoRefreshInterval,
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);

  // Form State for Add / Edit
  const [formUsername, setFormUsername] = useState('');
  const [formPersona, setFormPersona] = useState('');
  const [formTargetSubreddits, setFormTargetSubreddits] = useState('');
  const [formAccountHolder, setFormAccountHolder] = useState<AccountHolder>('LitNuke');
  const [formNotes, setFormNotes] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setFormUsername('');
    setFormPersona('');
    setFormTargetSubreddits('');
    setFormAccountHolder('LitNuke');
    setFormNotes('');
    setVerifyMessage(null);
    setIsAddingNew(false);
    setEditingAccountId(null);
  };

  const handleStartEdit = (account: RedditAccount) => {
    setEditingAccountId(account.id);
    setIsAddingNew(false);
    setFormUsername(account.username);
    setFormPersona(account.persona);
    setFormTargetSubreddits(account.targetSubreddits.join(', '));
    setFormAccountHolder(account.accountHolder);
    setFormNotes(account.notes || '');
    setVerifyMessage(null);
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = formUsername.replace(/^(u\/|r\/|@)/, '').trim();

    if (!cleanUser) {
      setVerifyMessage({ type: 'error', text: 'Reddit username is required.' });
      return;
    }
    if (!formPersona.trim()) {
      setVerifyMessage({ type: 'error', text: 'Account persona is required.' });
      return;
    }

    // Process subreddits array
    const rawSubs = formTargetSubreddits.split(',').map((s) => s.trim()).filter(Boolean);
    const subreddits = rawSubs.length > 0 ? rawSubs.map(normalizeSubreddit) : ['r/indonesia', 'r/technology'];

    // Only hit Reddit's API when it's actually needed: adding a brand-new
    // account, or editing one where the username itself changed. Editing
    // notes/persona/subreddits on an already-verified account should never
    // be blocked by a live Reddit call (or by Reddit rate-limiting/403s).
    const existingAccount = editingAccountId ? accounts.find((a) => a.id === editingAccountId) : null;
    const usernameChanged = !existingAccount || existingAccount.username.toLowerCase() !== cleanUser.toLowerCase();

    setIsVerifying(true);
    try {
      let verifyResult: {
        valid: boolean;
        karma?: { total: number; post: number; comment: number };
        avatarUrl?: string;
        createdUtc?: number;
        message?: string;
      } = { valid: true };

      if (usernameChanged) {
        verifyResult = await verifyRedditUsername(cleanUser);
        if (!verifyResult.valid) {
          setVerifyMessage({
            type: 'error',
            text: verifyResult.message || `u/${cleanUser} could not be verified on Reddit.`,
          });
          setIsVerifying(false);
          return;
        }
      }

      if (editingAccountId) {
        // Update existing — only overwrite karma/avatar if we actually re-verified
        onUpdateAccount(editingAccountId, {
          username: cleanUser,
          persona: formPersona.trim(),
          targetSubreddits: subreddits,
          accountHolder: formAccountHolder,
          notes: formNotes.trim(),
          ...(usernameChanged
            ? { karma: verifyResult.karma, avatarUrl: verifyResult.avatarUrl }
            : {}),
        });
      } else {
        // Add new
        await onAddAccount({
          username: cleanUser,
          persona: formPersona.trim(),
          targetSubreddits: subreddits,
          accountHolder: formAccountHolder,
          notes: formNotes.trim(),
          isActive: true,
          karma: verifyResult.karma,
          avatarUrl: verifyResult.avatarUrl,
          redditCreatedUtc: verifyResult.createdUtc,
        });
      }

      resetForm();
    } catch (err: any) {
      setVerifyMessage({ type: 'error', text: 'Failed to save account. Please try again.' });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wide uppercase flex items-center gap-2">
                <span>Settings & Reddit Account Management</span>
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-950/50 text-orange-400 border border-orange-800/60">
                {accounts.length} ACCOUNTS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage 5-10 Reddit monitoring accounts, personas, target subreddits, and operator assignments.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* Add / Edit Form Section */}
          {(isAddingNew || editingAccountId) ? (
            <form onSubmit={handleSaveAccount} className="p-4 rounded-xl border border-orange-600/40 bg-slate-950 space-y-4 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-orange-400" />
                  <span>{editingAccountId ? 'Edit Reddit Account' : 'Add New Reddit Account'}</span>
                </h3>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-slate-400 hover:text-white font-mono"
                >
                  [Cancel]
                </button>
              </div>

              {verifyMessage && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                    verifyMessage.type === 'success'
                      ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/60'
                      : 'bg-red-950/50 text-red-300 border border-red-800/60'
                  }`}
                >
                  {verifyMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  )}
                  <span>{verifyMessage.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Username */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Reddit Username <span className="text-orange-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500">
                      u/
                    </span>
                    <input
                      id="input-account-username"
                      type="text"
                      required
                      placeholder="e.g. tech_enthusiast"
                      value={formUsername}
                      onChange={(e) => setFormUsername(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-600"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Exact username on Reddit.</p>
                </div>

                {/* Account Holder (LitNuke, Kim - Dropdown) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Account Holder <span className="text-orange-400">*</span>
                  </label>
                  <select
                    id="select-account-holder"
                    value={formAccountHolder}
                    onChange={(e) => setFormAccountHolder(e.target.value as AccountHolder)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-medium text-slate-100 focus:outline-none focus:border-orange-600"
                  >
                    <option value="LitNuke">LitNuke</option>
                    <option value="Kim">Kim</option>
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1">Select the responsible operator (LitNuke / Kim).</p>
                </div>

              </div>

              {/* Account Persona */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Account Persona <span className="text-orange-400">*</span>
                </label>
                <input
                  id="input-account-persona"
                  type="text"
                  required
                  placeholder="e.g. AI Systems Architect & Tech Evangelist"
                  value={formPersona}
                  onChange={(e) => setFormPersona(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-600"
                />
              </div>

              {/* Target Subreddits */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Subreddits <span className="text-orange-400">*</span>
                </label>
                <input
                  id="input-account-subreddits"
                  type="text"
                  required
                  placeholder="r/indonesia, r/technology, r/programming"
                  value={formTargetSubreddits}
                  onChange={(e) => setFormTargetSubreddits(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-600"
                />
                <p className="text-[10px] text-slate-500 mt-1">Comma-separated (e.g. r/indonesia, r/technology).</p>
              </div>

              {/* Additional Notes (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Notes / Discussion Focus (Optional)
                </label>
                <textarea
                  id="input-account-notes"
                  rows={2}
                  placeholder="Notes regarding posting strategy or specific topics..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-600"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-account"
                  type="submit"
                  disabled={isVerifying}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 rounded-lg disabled:opacity-60 transition-colors"
                >
                  {isVerifying ? (
                    <span>Validating & Saving...</span>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingAccountId ? 'Update Account' : 'Save New Account'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Monitored Accounts List ({accounts.length})
              </span>

              <button
                id="btn-show-add-form"
                onClick={() => {
                  resetForm();
                  setIsAddingNew(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Account</span>
              </button>
            </div>
          )}

          {/* Accounts List Table */}
          <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
            <div className="divide-y divide-slate-800">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/60 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-900 border border-slate-800 flex-shrink-0 flex items-center justify-center text-xs font-bold text-orange-400 mt-0.5">
                      {account.avatarUrl ? (
                        <img
                          src={account.avatarUrl}
                          alt={account.username}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        account.username.charAt(0).toUpperCase()
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs text-orange-400">
                          u/{account.username}
                        </span>
                        
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            account.accountHolder === 'LitNuke'
                              ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800/50'
                              : 'bg-blue-900/40 text-blue-400 border border-blue-800/50'
                          }`}
                        >
                          {account.accountHolder}
                        </span>

                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                            account.isActive
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                              : 'bg-slate-900 text-slate-500 border border-slate-800'
                          }`}
                        >
                          {account.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 mt-0.5">
                        {account.persona}
                      </p>

                      {/* Target Subreddits */}
                      <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                        {account.targetSubreddits.map((sub) => (
                          <span
                            key={sub}
                            className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 font-mono text-[10px] uppercase border border-slate-800"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    {/* Toggle Active Button */}
                    <button
                      onClick={() => onUpdateAccount(account.id, { isActive: !account.isActive })}
                      title={account.isActive ? 'Deactivate Account' : 'Activate Account'}
                      className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                        account.isActive
                          ? 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                          : 'bg-emerald-950/50 text-emerald-400 border-emerald-800/60 hover:bg-emerald-900/40'
                      }`}
                    >
                      {account.isActive ? 'Deactivate' : 'Activate'}
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={() => handleStartEdit(account)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Edit Account"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to remove u/${account.username}?`)) {
                          onDeleteAccount(account.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors"
                      title="Delete Account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Auto Refresh & Polling Preferences */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-xs font-semibold text-slate-300">Automatic Sync Interval</span>
              </div>
              <span className="text-xs font-mono text-orange-400 font-bold">
                {autoRefreshInterval > 0 ? `${autoRefreshInterval} SECONDS` : 'MANUAL'}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2 text-xs">
              {[
                { label: 'Off (Manual)', sec: 0 },
                { label: '15 Seconds', sec: 15 },
                { label: '30 Seconds', sec: 30 },
                { label: '60 Seconds', sec: 60 },
                { label: '5 Minutes', sec: 300 },
              ].map((item) => (
                <button
                  key={item.sec}
                  onClick={() => onSetAutoRefreshInterval(item.sec)}
                  className={`py-1.5 px-1 rounded-md border text-center font-medium font-mono text-xs transition-all ${
                    autoRefreshInterval === item.sec
                      ? 'bg-orange-600 text-white border-orange-500 font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reset Defaults */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-500">
            <span>Reset accounts to default LitNuke X ANUMA preset?</span>
            <button
              type="button"
              onClick={() => {
                if (confirm('Restore all accounts and activities to default preset data?')) {
                  onResetToDefault();
                  resetForm();
                }
              }}
              className="inline-flex items-center gap-1 text-slate-400 hover:text-orange-400 transition-colors font-mono"
            >
              <RotateCcw className="w-3 h-3" />
              <span>[Reset to Default]</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
