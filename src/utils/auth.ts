// src/utils/auth.ts

import { getSupabaseClient } from './supabaseClient';

/**
 * Verify an admin authentication token via Supabase RPC.
 * Returns true if the token is valid, false otherwise.
 */
export async function verifyAdminToken(token: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    // Assuming a Supabase RPC named `verify_admin_token` that returns a boolean `valid` field.
    const { data, error } = await client.rpc('verify_admin_token', { token });
    if (error) {
      console.warn('Admin token verification error:', error.message);
      return false;
    }
    // `data` is expected to be an object like { valid: true }
    return Boolean((data as any)?.valid);
  } catch (err) {
    console.warn('Admin token verification failed:', err);
    return false;
  }
}
