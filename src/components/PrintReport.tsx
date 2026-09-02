import React from 'react';
import { RedditAccount, ActivityItem } from '../types';
import { formatExactDateTime, formatNumber } from '../utils/formatters';

export type PrintRequest =
  | { mode: 'global' }
  | { mode: 'persona'; account: RedditAccount };

interface PrintReportProps {
  request: PrintRequest;
  accounts: RedditAccount[];
  activities: ActivityItem[];
}

const INK = '#1B1815';
const MUTED_INK = '#5A5142';
const BRASS = '#9C6B14';
const HAIRLINE = '#D9D0C2';

function formatDateOnly(unixSecOrIso: number | string | undefined): string {
  if (!unixSecOrIso) return '—';
  const date = typeof unixSecOrIso === 'number' ? new Date(unixSecOrIso * 1000) : new Date(unixSecOrIso);
  if (isNaN(date.getTime())) return '—';
  const day = String(date.getDate()).padStart(2, '0');
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${day} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

const Masthead: React.FC<{ subtitle: string; generatedAt: Date }> = ({ subtitle, generatedAt }) => (
  <div className="pr-avoid-break" style={{ marginBottom: '7mm' }}>
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
      <div
        style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontWeight: 600,
          fontSize: '22pt',
          letterSpacing: '-0.01em',
          color: INK,
        }}
      >
        LitNuke <span style={{ color: BRASS, fontWeight: 500 }}>×</span> Anuma
      </div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '8pt', color: MUTED_INK }}>
        Generated {formatExactDateTime(Math.floor(generatedAt.getTime() / 1000))}
      </div>
    </div>
    <div
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: '10.5pt',
        color: MUTED_INK,
        marginTop: '1mm',
      }}
    >
      {subtitle}
    </div>
    <div style={{ height: '0.6mm', background: BRASS, marginTop: '4mm' }} />
  </div>
);

const KeyFigure: React.FC<{ label: string; value: string; sub?: string }> = ({ label, value, sub }) => (
  <div style={{ flex: 1 }}>
    <div
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: '7.5pt',
        color: MUTED_INK,
        letterSpacing: '0.03em',
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontFamily: "'Fraunces', Georgia, serif",
        fontSize: '18pt',
        color: INK,
        fontWeight: 500,
        marginTop: '0.5mm',
      }}
    >
      {value}
    </div>
    {sub && (
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '7pt', color: MUTED_INK, marginTop: '0.5mm' }}>
        {sub}
      </div>
    )}
  </div>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    className="pr-avoid-break"
    style={{
      fontFamily: "'Fraunces', Georgia, serif",
      fontSize: '12pt',
      fontWeight: 600,
      color: INK,
      borderBottom: `0.4mm solid ${HAIRLINE}`,
      paddingBottom: '1.5mm',
      marginTop: '7mm',
      marginBottom: '3mm',
    }}
  >
    {children}
  </div>
);

const th: React.CSSProperties = {
  textAlign: 'left',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize: '7.5pt',
  color: MUTED_INK,
  letterSpacing: '0.02em',
  fontWeight: 600,
  padding: '0 2mm 2mm 0',
  borderBottom: `0.3mm solid ${HAIRLINE}`,
};

const td: React.CSSProperties = {
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize: '8.5pt',
  color: INK,
  padding: '2mm 2mm 2mm 0',
  borderBottom: `0.2mm solid ${HAIRLINE}`,
  verticalAlign: 'top',
};

const Footer: React.FC = () => (
  <div
    className="pr-avoid-break"
    style={{
      marginTop: '9mm',
      paddingTop: '3mm',
      borderTop: `0.3mm solid ${HAIRLINE}`,
      display: 'flex',
      justifyContent: 'space-between',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '7pt',
      color: MUTED_INK,
    }}
  >
    <span>LitNuke × Anuma — Reddit Account Intelligence</span>
    <span>Confidential — for internal use only</span>
  </div>
);

export const PrintReport: React.FC<PrintReportProps> = ({ request, accounts, activities }) => {
  const generatedAt = new Date();

  const wrapperStyle: React.CSSProperties = {
    background: '#ffffff',
    color: INK,
    padding: '0',
    maxWidth: '190mm',
    margin: '0 auto',
  };

  if (request.mode === 'global') {
    const totalActivities = activities.length;
    const totalPosts = activities.filter((a) => a.type === 'post').length;
    const totalComments = activities.filter((a) => a.type === 'comment').length;
    const totalUpvotes = activities.reduce((acc, a) => acc + (a.score || 0), 0);

    const perAccount = accounts.map((acc) => {
      const accActivities = activities.filter((a) => a.username.toLowerCase() === acc.username.toLowerCase());
      const lastActive = accActivities.reduce((max, a) => Math.max(max, a.createdUtc), 0);
      return {
        acc,
        posts: accActivities.filter((a) => a.type === 'post').length,
        comments: accActivities.filter((a) => a.type === 'comment').length,
        lastActive,
      };
    });

    const recentActivities = [...activities].sort((a, b) => b.createdUtc - a.createdUtc).slice(0, 20);

    return (
      <div className="print-report">
        <div style={wrapperStyle}>
          <Masthead subtitle="Account Intelligence — Portfolio Report" generatedAt={generatedAt} />

          {/* Key Figures */}
          <div style={{ display: 'flex', gap: '8mm' }} className="pr-avoid-break">
            <KeyFigure label="TRACKED ACCOUNTS" value={String(accounts.length)} sub={`${accounts.filter((a) => a.isActive).length} active`} />
            <KeyFigure label="TOTAL ACTIVITY" value={formatNumber(totalActivities)} sub={`${totalPosts} posts · ${totalComments} comments`} />
            <KeyFigure label="TOTAL ENGAGEMENT" value={formatNumber(totalUpvotes)} sub="cumulative upvotes" />
            <KeyFigure label="SUBREDDITS COVERED" value={String(new Set(activities.map((a) => a.subreddit)).size)} sub="unique communities" />
          </div>

          {/* Accounts Table */}
          <SectionTitle>Tracked Accounts</SectionTitle>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Username</th>
                <th style={th}>Holder</th>
                <th style={th}>Persona</th>
                <th style={th}>Karma</th>
                <th style={th}>Posts</th>
                <th style={th}>Comments</th>
                <th style={th}>Status</th>
                <th style={th}>Last Active</th>
              </tr>
            </thead>
            <tbody>
              {perAccount.map(({ acc, posts, comments, lastActive }) => (
                <tr key={acc.id} className="pr-avoid-break">
                  <td style={{ ...td, fontFamily: "'JetBrains Mono', monospace" }}>u/{acc.username}</td>
                  <td style={td}>{acc.accountHolder}</td>
                  <td style={{ ...td, maxWidth: '38mm' }}>{acc.persona}</td>
                  <td style={{ ...td, fontFamily: "'JetBrains Mono', monospace" }}>{formatNumber(acc.karma?.total || 0)}</td>
                  <td style={td}>{posts}</td>
                  <td style={td}>{comments}</td>
                  <td style={td}>{acc.isActive ? 'Active' : 'Inactive'}</td>
                  <td style={{ ...td, fontFamily: "'JetBrains Mono', monospace" }}>
                    {lastActive ? formatDateOnly(lastActive) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Recent Activity Highlights */}
          {recentActivities.length > 0 && (
            <>
              <SectionTitle>Recent Activity (most recent 20)</SectionTitle>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={th}>Date</th>
                    <th style={th}>Account</th>
                    <th style={th}>Type</th>
                    <th style={th}>Subreddit</th>
                    <th style={th}>Summary</th>
                    <th style={th}>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivities.map((item) => (
                    <tr key={item.id} className="pr-avoid-break">
                      <td style={{ ...td, fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap' }}>
                        {formatDateOnly(item.createdUtc)}
                      </td>
                      <td style={{ ...td, fontFamily: "'JetBrains Mono', monospace" }}>u/{item.username}</td>
                      <td style={td}>{item.type === 'post' ? 'Post' : 'Comment'}</td>
                      <td style={td}>{item.subreddit}</td>
                      <td style={{ ...td, maxWidth: '55mm' }}>
                        {(item.title || item.body).slice(0, 90)}
                        {(item.title || item.body).length > 90 ? '…' : ''}
                      </td>
                      <td style={{ ...td, fontFamily: "'JetBrains Mono', monospace" }}>+{formatNumber(item.score)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          <Footer />
        </div>
      </div>
    );
  }

  // Persona (single account) report
  const account = request.account;
  const accountActivities = activities
    .filter((a) => a.username.toLowerCase() === account.username.toLowerCase())
    .sort((a, b) => b.createdUtc - a.createdUtc);

  const posts = accountActivities.filter((a) => a.type === 'post');
  const comments = accountActivities.filter((a) => a.type === 'comment');
  const totalScore = accountActivities.reduce((acc, curr) => acc + curr.score, 0);
  const avgScore = accountActivities.length > 0 ? Math.round(totalScore / accountActivities.length) : 0;

  return (
    <div className="print-report">
      <div style={wrapperStyle}>
        <Masthead subtitle={`Account Report — u/${account.username}`} generatedAt={generatedAt} />

        {/* Profile block */}
        <div className="pr-avoid-break" style={{ display: 'flex', justifyContent: 'space-between', gap: '10mm' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '7.5pt', color: MUTED_INK }}>PERSONA</div>
            <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '12pt', color: INK, marginTop: '0.5mm' }}>
              {account.persona}
            </div>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '8.5pt', color: MUTED_INK, marginTop: '2mm' }}>
              Holder: <span style={{ color: INK }}>{account.accountHolder}</span> &nbsp;·&nbsp;
              Status: <span style={{ color: INK }}>{account.isActive ? 'Active' : 'Inactive'}</span> &nbsp;·&nbsp;
              Tracked since: <span style={{ color: INK }}>{formatDateOnly(account.createdAt)}</span>
            </div>
            {account.targetSubreddits.length > 0 && (
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '8.5pt', color: MUTED_INK, marginTop: '1.5mm' }}>
                Target subreddits: <span style={{ color: INK }}>{account.targetSubreddits.join(', ')}</span>
              </div>
            )}
            {account.notes && (
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '8.5pt', color: MUTED_INK, marginTop: '1.5mm' }}>
                Notes: <span style={{ color: INK }}>{account.notes}</span>
              </div>
            )}
          </div>
        </div>

        {/* Key Figures */}
        <div style={{ display: 'flex', gap: '8mm', marginTop: '6mm' }} className="pr-avoid-break">
          <KeyFigure label="TOTAL KARMA" value={formatNumber(account.karma?.total || 0)} sub={`post ${formatNumber(account.karma?.post || 0)} · comment ${formatNumber(account.karma?.comment || 0)}`} />
          <KeyFigure label="POSTS MONITORED" value={String(posts.length)} />
          <KeyFigure label="COMMENTS MONITORED" value={String(comments.length)} />
          <KeyFigure label="AVG. ENGAGEMENT" value={`+${avgScore}`} sub={`${formatNumber(totalScore)} total upvotes tracked`} />
        </div>

        {/* Activity Table */}
        <SectionTitle>Activity Log ({accountActivities.length})</SectionTitle>
        {accountActivities.length === 0 ? (
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '9pt', color: MUTED_INK }}>
            No activity recorded yet for this account.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Date</th>
                <th style={th}>Type</th>
                <th style={th}>Subreddit</th>
                <th style={th}>Content</th>
                <th style={th}>Score</th>
                <th style={th}>Replies</th>
              </tr>
            </thead>
            <tbody>
              {accountActivities.map((item) => (
                <tr key={item.id} className="pr-avoid-break">
                  <td style={{ ...td, fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap' }}>
                    {formatDateOnly(item.createdUtc)}
                  </td>
                  <td style={td}>{item.type === 'post' ? 'Post' : 'Comment'}</td>
                  <td style={td}>{item.subreddit}</td>
                  <td style={{ ...td, maxWidth: '70mm' }}>
                    {item.title && <div style={{ fontWeight: 600 }}>{item.title}</div>}
                    <div style={{ color: MUTED_INK }}>
                      {item.body.slice(0, 140)}
                      {item.body.length > 140 ? '…' : ''}
                    </div>
                  </td>
                  <td style={{ ...td, fontFamily: "'JetBrains Mono', monospace" }}>+{formatNumber(item.score)}</td>
                  <td style={{ ...td, fontFamily: "'JetBrains Mono', monospace" }}>{item.numComments ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <Footer />
      </div>
    </div>
  );
};
