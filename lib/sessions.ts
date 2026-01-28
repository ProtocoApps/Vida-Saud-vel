import { supabase } from './supabase';

type SessionStats = {
  sessionsThisMonth: number;
  sessionsLastMonth: number;
  percentChange: number | null;
};

function monthKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function addMonths(date: Date, delta: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + delta);
  return d;
}

async function userKeySuffix() {
  try {
    const { data } = await supabase.auth.getUser();
    const id = data?.user?.id;
    return id || 'anon';
  } catch {
    return 'anon';
  }
}

function storageKey(base: string, suffix: string) {
  return `vida_saudavel_${base}_${suffix}`;
}

export async function trackSession(options?: { minGapMinutes?: number }) {
  const minGapMinutes = options?.minGapMinutes ?? 30;
  const suffix = await userKeySuffix();

  const now = Date.now();
  const lastTsKey = storageKey('last_session_ts', suffix);
  const lastTsRaw = localStorage.getItem(lastTsKey);
  const lastTs = lastTsRaw ? Number(lastTsRaw) : null;

  if (lastTs && Number.isFinite(lastTs) && now - lastTs < minGapMinutes * 60_000) {
    return;
  }

  localStorage.setItem(lastTsKey, String(now));

  const mk = monthKey(new Date());
  const monthCountKey = storageKey(`sessions_${mk}`, suffix);
  const currentRaw = localStorage.getItem(monthCountKey);
  const current = currentRaw ? Number(currentRaw) : 0;
  const next = Number.isFinite(current) ? current + 1 : 1;
  localStorage.setItem(monthCountKey, String(next));
}

export async function getSessionStats(): Promise<SessionStats> {
  const suffix = await userKeySuffix();
  const now = new Date();

  const thisMonth = monthKey(now);
  const lastMonth = monthKey(addMonths(now, -1));

  const thisKey = storageKey(`sessions_${thisMonth}`, suffix);
  const lastKey = storageKey(`sessions_${lastMonth}`, suffix);

  const thisRaw = localStorage.getItem(thisKey);
  const lastRaw = localStorage.getItem(lastKey);

  const sessionsThisMonth = thisRaw ? Number(thisRaw) : 0;
  const sessionsLastMonth = lastRaw ? Number(lastRaw) : 0;

  const safeThis = Number.isFinite(sessionsThisMonth) ? sessionsThisMonth : 0;
  const safeLast = Number.isFinite(sessionsLastMonth) ? sessionsLastMonth : 0;

  if (safeLast <= 0) {
    return { sessionsThisMonth: safeThis, sessionsLastMonth: safeLast, percentChange: safeThis > 0 ? 100 : 0 };
  }

  const percentChange = Math.round(((safeThis - safeLast) / safeLast) * 100);
  return { sessionsThisMonth: safeThis, sessionsLastMonth: safeLast, percentChange };
}
