import React from 'react';
import { 
  X, 
  ExternalLink, 
  ArrowUp, 
  MessageSquare, 
  FileText, 
  Clock, 
  Share2, 
  Target, 
  CheckCircle,
  Copy,
  Check
} from 'lucide-react';
import { ActivityItem, RedditAccount } from '../types';
import { formatExactDateTime, formatRelativeTime, formatNumber } from '../utils/formatters';

interface PostPreviewModalProps {
  item: ActivityItem | null;
  account?: RedditAccount;
  isOpen: boolean;
  onClose: () => void;
  onOpenAccountDetail: (username: string) => void;
}

export const PostPreviewModal: React.FC<PostPreviewModalProps> = ({
  item,
  account,
  isOpen,
  onClose,
  onOpenAccountDetail,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !item) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(item.permalink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                item.type === 'post'
                  ? 'bg-blue-900/30 text-blue-400 border border-blue-800/50'
                  : 'bg-purple-900/30 text-purple-400 border border-purple-800/50'
              }`}
            >
              {item.type === 'post' ? (
                <>
                  <FileText className="w-3 h-3 text-blue-400" />
                  <span>POST</span>
                </>
              ) : (
                <>
                  <MessageSquare className="w-3 h-3 text-purple-400" />
                  <span>COMMENT</span>
                </>
              )}
            </span>

            <span className="font-mono text-xs text-slate-400 uppercase bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              {item.subreddit}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* Author info card */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <button
              onClick={() => {
                onClose();
                onOpenAccountDetail(item.username);
              }}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-orange-400 text-xs flex-shrink-0">
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
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-orange-400 group-hover:underline transition-colors">
                    u/{item.username}
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      item.accountHolder === 'LitNuke'
                        ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800/50'
                        : 'bg-blue-900/40 text-blue-400 border border-blue-800/50'
                    }`}
                  >
                    {item.accountHolder}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{item.persona}</p>
              </div>
            </button>

            <div className="text-right text-xs text-slate-400 font-mono">
              <div>{formatExactDateTime(item.createdUtc)}</div>
              <div className="text-[10px] text-slate-500">{formatRelativeTime(item.createdUtc)}</div>
            </div>
          </div>

          {/* Title if post */}
          {item.title && (
            <h3 className="text-base font-bold text-slate-100 leading-snug">
              {item.title}
            </h3>
          )}

          {/* Parent context if comment */}
          {item.parentTitle && (
            <div className="p-3 rounded-lg bg-slate-950 border-l-2 border-orange-600 text-xs text-slate-300">
              <span className="text-slate-500 font-medium block text-[10px] uppercase font-mono">
                Context / In Response To:
              </span>
              <p className="mt-0.5 font-semibold text-slate-200">&quot;{item.parentTitle}&quot;</p>
            </div>
          )}

          {/* Text body */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
            {item.body}
          </div>

          {/* Engagement metrics */}
          <div className="flex items-center gap-3 pt-1 text-xs">
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-950 border border-slate-800 font-mono font-bold text-emerald-400">
              <ArrowUp className="w-3.5 h-3.5" />
              <span>+{formatNumber(item.score)} UPVOTES</span>
            </div>

            {item.numComments !== undefined && (
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-400 font-mono">
                <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                <span>{item.numComments} REPLIES</span>
              </div>
            )}

            {item.isTargetSubreddit && (
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-[10px] font-mono">
                <CheckCircle className="w-3 h-3" />
                <span>TARGET SUBREDDIT</span>
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors font-mono"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied' : 'Copy Link'}</span>
          </button>

          <a
            href={item.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold transition-colors"
          >
            <span>Open Directly on Reddit</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </div>
  );
};
