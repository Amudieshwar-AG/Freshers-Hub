import { getBackendUrl } from '@/lib/utils';

const DEVICE_ID_KEY = 'rit_device_identifier';

/**
 * Gets a persistent user identifier for likes.
 * If user is authenticated, uses email. Otherwise uses a persistent UUID in localStorage.
 */
export function getClubUserIdentifier(userEmail?: string | null): string {
  if (userEmail && userEmail.trim()) {
    return userEmail.trim().toLowerCase();
  }

  try {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = 'guest_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch {
    return 'guest_fallback_user';
  }
}

/**
 * Fetch total counts of likes for all clubs & centers from database
 */
export async function fetchClubLikes(): Promise<Record<string, number>> {
  try {
    const res = await fetch(getBackendUrl('/api/clubs/likes'));
    if (!res.ok) {
      throw new Error(`Failed to fetch likes: ${res.status}`);
    }
    const data = await res.json();
    return data || {};
  } catch (err) {
    console.warn('Unable to fetch club likes from database backend:', err);
    return {};
  }
}

/**
 * Fetch user's liked club IDs from database
 */
export async function fetchUserLikedClubs(userIdentifier: string): Promise<string[]> {
  try {
    const res = await fetch(
      getBackendUrl(`/api/clubs/user-likes?userIdentifier=${encodeURIComponent(userIdentifier)}`)
    );
    if (!res.ok) {
      throw new Error(`Failed to fetch user likes: ${res.status}`);
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('Unable to fetch user liked clubs from database backend:', err);
    return [];
  }
}

/**
 * Toggle like status for a club/center in database
 */
export async function toggleClubLikeInDb(
  clubId: string,
  userIdentifier: string
): Promise<{ liked: boolean; count: number } | null> {
  try {
    const res = await fetch(getBackendUrl(`/api/clubs/${encodeURIComponent(clubId)}/like`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIdentifier }),
    });
    if (!res.ok) {
      throw new Error(`Toggle like failed: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`Failed to persist like for club ${clubId} in database:`, err);
    return null;
  }
}
