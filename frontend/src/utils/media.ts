/**
 * Resolves an uploaded media/asset path (logo, avatar, resume) to a reachable absolute URL.
 * Supports:
 * - Local optimistic preview URLs (blob: / data:)
 * - Relative paths (/uploads/logos/..., /uploads/avatars/..., etc.)
 * - Production domain https://jobs.camzytech.com -> https://api.jobs.camzytech.com
 * - Rewriting accidental localhost:4000 links on production
 */
export function resolveMediaUrl(url?: string | null): string {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return '';
  }

  const trimmed = url.trim();

  // Instant local previews (blob: or data:)
  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
    return trimmed;
  }

  // Determine current API host
  let apiHost = 'http://localhost:4000';
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'jobs.camzytech.com' || window.location.hostname.endsWith('.camzytech.com')) {
      apiHost = 'https://api.jobs.camzytech.com';
    } else if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      apiHost = `${window.location.protocol}//api.${window.location.host.replace(/^jobs\./, '')}`;
    }
  } else if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
    try {
      const parsed = new URL(process.env.NEXT_PUBLIC_API_URL);
      apiHost = parsed.origin;
    } catch {
      // fallback
    }
  }

  // If already absolute URL:
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    // If it mistakenly has localhost:4000 in a production environment, rewrite to apiHost
    if (apiHost !== 'http://localhost:4000' && trimmed.includes('localhost:4000')) {
      return trimmed.replace('http://localhost:4000', apiHost);
    }
    return trimmed;
  }

  // Relative path (e.g. /uploads/logos/...)
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${apiHost}${cleanPath}`;
}
