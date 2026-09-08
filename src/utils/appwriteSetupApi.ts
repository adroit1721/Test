import { getAppwriteConfig } from './appwriteClient';

export interface ProvisionLog {
  type: 'info' | 'success' | 'warn' | 'error';
  message: string;
}

export async function autoProvisionAppwrite(
  apiKey: string,
  onLog?: (log: ProvisionLog) => void
): Promise<{ success: boolean; message: string }> {
  const config = getAppwriteConfig();
  const endpoint = config.endpoint.replace(/\/$/, '');
  const projectId = config.projectId;
  const databaseId = config.databaseId || 'ngdc_db';

  const log = (type: 'info' | 'success' | 'warn' | 'error', message: string) => {
    if (onLog) onLog({ type, message });
  };

  log('info', `Connecting to Appwrite setup service for project ${projectId}...`);

  // 1. Call server-side provision route (completely bypasses browser CORS / X-Appwrite-Key blocks)
  try {
    log('info', 'Executing server-side provisioning engine...');
    const serverRes = await fetch('/api/appwrite/provision', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: apiKey.trim(),
        endpoint,
        projectId,
        databaseId,
      }),
    });

    const data = await serverRes.json().catch(() => null);

    if (data && Array.isArray(data.logs)) {
      for (const item of data.logs) {
        log(item.type, item.message);
      }
    }

    if (serverRes.ok && data?.success) {
      return {
        success: true,
        message: data.message || 'Appwrite Cloud database and collections configured successfully!',
      };
    } else if (data?.message) {
      return {
        success: false,
        message: data.message,
      };
    }
  } catch (err: any) {
    log('warn', `Server route notification: ${err?.message || 'Server route unavailable, falling back...'}`);
  }

  // 2. Fallback: Direct REST call if server route was unavailable
  try {
    log('info', 'Attempting direct Appwrite REST API connection...');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Appwrite-Project': projectId,
      'X-Appwrite-Key': apiKey.trim(),
    };

    const dbCheckRes = await fetch(`${endpoint}/databases/${databaseId}`, {
      method: 'GET',
      headers,
    });

    if (dbCheckRes.ok) {
      log('success', `Database "${databaseId}" is active!`);
      return {
        success: true,
        message: `Database "${databaseId}" connected successfully!`,
      };
    } else {
      const errJson = await dbCheckRes.json().catch(() => ({}));
      throw new Error(errJson.message || `Appwrite response code: ${dbCheckRes.status}`);
    }
  } catch (directErr: any) {
    const errorText = String(directErr?.message || directErr);
    log('error', `Connection error: ${errorText}`);

    const isFetchFailed = errorText.toLowerCase().includes('fetch') || errorText.toLowerCase().includes('network');
    const guidance = isFetchFailed
      ? 'Appwrite Cloud blocked the browser request (CORS). To fix this, open Appwrite Console -> Overview -> Add Platform -> Web App -> set Hostname to "*".'
      : errorText;

    return {
      success: false,
      message: guidance,
    };
  }
}
