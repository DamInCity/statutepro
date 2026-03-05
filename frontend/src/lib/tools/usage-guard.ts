/**
 * Anonymous usage guard for free legal tools.
 * Stores per-tool use counts in localStorage.
 * Authenticated users (detected via access token) bypass the limit.
 */

const STORAGE_KEY = 'sp_anon_tool_uses';
const FREE_LIMIT = 3;

function readCounts(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function writeCounts(counts: Record<string, number>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
}

/** Returns how many times an anonymous user has used this tool. */
export function getUseCount(toolSlug: string): number {
  return readCounts()[toolSlug] ?? 0;
}

/** Increments the use counter for this tool and returns the new count. */
export function incrementUseCount(toolSlug: string): number {
  const counts = readCounts();
  const next = (counts[toolSlug] ?? 0) + 1;
  writeCounts({ ...counts, [toolSlug]: next });
  return next;
}

/** Returns true if the anonymous user has exceeded the free limit. */
export function isLimitReached(toolSlug: string): boolean {
  return getUseCount(toolSlug) >= FREE_LIMIT;
}

/** Returns true if the user has a valid access token (logged-in). */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('access_token');
}

/** Returns remaining free uses (0 if exhausted or authenticated). */
export function remainingUses(toolSlug: string): number {
  if (isAuthenticated()) return Infinity;
  return Math.max(0, FREE_LIMIT - getUseCount(toolSlug));
}

export const TOOL_FREE_LIMIT = FREE_LIMIT;
