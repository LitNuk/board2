export function formatExactDateTime(unixSec: number): string {
  if (!unixSec) return '-';
  const date = new Date(unixSec * 1000);
  
  // Format: DD MMM YYYY, HH:mm
  const day = String(date.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day} ${month} ${year}, ${hours}:${minutes}`;
}

export function formatTimeOnly(unixSec: number): string {
  if (!unixSec) return '-';
  const date = new Date(unixSec * 1000);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function formatRelativeTime(unixSec: number): string {
  if (!unixSec) return '-';
  const now = Math.floor(Date.now() / 1000);
  const diffSec = Math.max(0, now - unixSec);

  if (diffSec < 45) return 'Just now';
  if (diffSec < 3600) {
    const mins = Math.floor(diffSec / 60);
    return `${mins}m ago`;
  }
  if (diffSec < 86400) {
    const hours = Math.floor(diffSec / 3600);
    return `${hours}h ago`;
  }
  const days = Math.floor(diffSec / 86400);
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  return formatExactDateTime(unixSec).split(',')[0];
}

export function formatNumber(num: number | undefined): string {
  if (num === undefined || num === null) return '0';
  if (Math.abs(num) >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (Math.abs(num) >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toLocaleString();
}

export function normalizeSubreddit(sub: string): string {
  if (!sub) return '';
  const clean = sub.trim().replace(/^r\//, '').replace(/^\//, '');
  return clean ? `r/${clean}` : '';
}

export function isSubredditMatch(sub: string, targets: string[]): boolean {
  if (!sub || !targets || targets.length === 0) return false;
  const normalized = normalizeSubreddit(sub).toLowerCase();
  return targets.some((t) => normalizeSubreddit(t).toLowerCase() === normalized);
}
