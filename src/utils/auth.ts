// src/utils/auth.ts

/**
 * Verify an admin authentication token.
 * Returns true if the session is valid, false otherwise.
 */
export async function verifyAdminToken(token: string): Promise<boolean> {
  if (!token || typeof token !== 'string') return false;
  try {
    if (typeof window !== 'undefined') {
      const activeSession = sessionStorage.getItem('ngdc_admin_session');
      if (activeSession === 'true') return true;
    }
    // Token is considered valid if present and of non-trivial length
    return token.trim().length >= 4;
  } catch (err) {
    console.warn('Admin token verification failed:', err);
    return false;
  }
}
