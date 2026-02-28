import type { TFunction } from 'i18next';

export function timeAgo(timestamp: string, t: TFunction): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return t('time.secondsAgo', { count: seconds });
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return t('time.minutesAgo', { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t('time.hoursAgo', { count: hours });
  const days = Math.floor(hours / 24);
  return t('time.daysAgo', { count: days });
}

export function timeAgoShort(timestamp: string, t: TFunction): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return t('time.seconds', { count: s });
  const m = Math.floor(s / 60);
  if (m < 60) return t('time.minutes', { count: m });
  const h = Math.floor(m / 60);
  if (h < 24) return t('time.hours', { count: h });
  return t('time.days', { count: Math.floor(h / 24) });
}
