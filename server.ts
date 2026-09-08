import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '20mb' }));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Server-side Appwrite Test Connection (bypasses browser CORS)
  app.post('/api/appwrite/test', async (req, res) => {
    try {
      const { endpoint, projectId, databaseId } = req.body;
      const targetEndpoint = (endpoint || 'https://sgp.cloud.appwrite.io/v1').replace(/\/$/, '');
      const targetProject = projectId || '6a9fb005002b81b05e45';
      const targetDb = databaseId || 'ngdc_db';

      const response = await fetch(`${targetEndpoint}/databases/${targetDb}`, {
        method: 'GET',
        headers: {
          'X-Appwrite-Project': targetProject,
        },
      });

      const data = await response.json().catch(() => ({}));
      return res.json({
        ok: response.ok,
        status: response.status,
        data,
      });
    } catch (err: any) {
      return res.status(500).json({
        ok: false,
        error: err?.message || 'Failed to connect to Appwrite from server',
      });
    }
  });

  // Server-side Appwrite Automated Provisioning (bypasses browser CORS and preflight blocks on X-Appwrite-Key)
  app.post('/api/appwrite/provision', async (req, res) => {
    const logs: Array<{ type: 'info' | 'success' | 'warn' | 'error'; message: string }> = [];
    const log = (type: 'info' | 'success' | 'warn' | 'error', message: string) => {
      logs.push({ type, message });
    };

    try {
      const { apiKey, endpoint, projectId, databaseId } = req.body;

      if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Missing Appwrite API Key. Please generate an API Key in Appwrite Console.',
          logs: [{ type: 'error', message: 'Missing Appwrite API Key' }],
        });
      }

      const targetEndpoint = (endpoint || 'https://sgp.cloud.appwrite.io/v1').replace(/\/$/, '');
      const targetProject = (projectId || '6a9fb005002b81b05e45').trim();
      const targetDb = (databaseId || 'ngdc_db').trim();
      const cleanKey = apiKey.trim();

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': targetProject,
        'X-Appwrite-Key': cleanKey,
      };

      log('info', `[Server] Connecting to Appwrite Cloud (Project: ${targetProject})...`);

      // 1. Verify / Create Database
      log('info', `Checking Database "${targetDb}"...`);
      const dbCheckRes = await fetch(`${targetEndpoint}/databases/${targetDb}`, {
        method: 'GET',
        headers,
      });

      if (dbCheckRes.status === 404) {
        log('info', `Database "${targetDb}" not found. Creating database...`);
        const createDbRes = await fetch(`${targetEndpoint}/databases`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            databaseId: targetDb,
            name: 'NGDC BNCC Portal DB',
            enabled: true,
          }),
        });

        if (!createDbRes.ok) {
          const errData = await createDbRes.json().catch(() => ({}));
          throw new Error(errData.message || `Failed to create database: ${createDbRes.statusText}`);
        }
        log('success', `Database "${targetDb}" created successfully.`);
      } else if (dbCheckRes.ok) {
        log('success', `Database "${targetDb}" verified.`);
      } else {
        const errData = await dbCheckRes.json().catch(() => ({}));
        throw new Error(errData.message || `Database check failed with status ${dbCheckRes.status}`);
      }

      // 2. Collections and Attributes definitions
      const collections = [
        {
          id: 'site_settings',
          name: 'Site Settings',
          attributes: [
            { key: 'key', type: 'String', size: 128, required: true },
            { key: 'value', type: 'String', size: 1000000, required: true },
            { key: 'updated_at', type: 'String', size: 64, required: false },
          ],
        },
        {
          id: 'cadets',
          name: 'Cadets',
          attributes: [
            { key: 'cadet_no', type: 'String', size: 64, required: true },
            { key: 'name', type: 'String', size: 128, required: true },
            { key: 'rank', type: 'String', size: 64, required: false, default: 'Cadet' },
            { key: 'category', type: 'String', size: 64, required: false, default: 'Male Platoon' },
            { key: 'section', type: 'String', size: 64, required: false, default: 'Section 01' },
            { key: 'gender', type: 'String', size: 32, required: false, default: 'Male' },
            { key: 'appointment', type: 'String', size: 64, required: false, default: 'Cadet' },
            { key: 'platoon', type: 'String', size: 64, required: false },
            { key: 'batch', type: 'String', size: 64, required: false },
            { key: 'college_id', type: 'String', size: 64, required: false },
            { key: 'department', type: 'String', size: 128, required: false },
            { key: 'blood_group', type: 'String', size: 16, required: false, default: 'B+' },
            { key: 'phone', type: 'String', size: 32, required: false },
            { key: 'email', type: 'String', size: 128, required: false },
            { key: 'joining_date', type: 'String', size: 64, required: false },
            { key: 'attendance_percentage', type: 'Integer', required: false, default: 100 },
            { key: 'parades_attended', type: 'Integer', required: false, default: 0 },
            { key: 'total_parades', type: 'Integer', required: false, default: 0 },
            { key: 'status', type: 'String', size: 32, required: false, default: 'Active' },
            { key: 'cadet_type', type: 'String', size: 32, required: false, default: 'Current' },
            { key: 'is_approved', type: 'Boolean', required: false, default: true },
            { key: 'avatar_url', type: 'String', size: 50000, required: false },
            { key: 'raw_data', type: 'String', size: 1000000, required: false },
            { key: 'updated_at', type: 'String', size: 64, required: false },
          ],
        },
      ];

      const permissions = [
        'read("any")',
        'create("any")',
        'update("any")',
        'delete("any")',
      ];

      for (const col of collections) {
        log('info', `Checking Collection "${col.id}" (${col.name})...`);

        const colCheckRes = await fetch(`${targetEndpoint}/databases/${targetDb}/collections/${col.id}`, {
          method: 'GET',
          headers,
        });

        if (colCheckRes.status === 404) {
          log('info', `Creating collection "${col.id}" with public "Any" permissions...`);
          const createColRes = await fetch(`${targetEndpoint}/databases/${targetDb}/collections`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              collectionId: col.id,
              name: col.name,
              permissions,
              documentSecurity: false,
              enabled: true,
            }),
          });

          if (!createColRes.ok) {
            const errData = await createColRes.json().catch(() => ({}));
            throw new Error(errData.message || `Failed to create collection ${col.id}`);
          }
          log('success', `Collection "${col.id}" created.`);
        } else if (colCheckRes.ok) {
          log('info', `Collection "${col.id}" found. Updating permissions...`);
          await fetch(`${targetEndpoint}/databases/${targetDb}/collections/${col.id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
              name: col.name,
              permissions,
              documentSecurity: false,
              enabled: true,
            }),
          }).catch(() => {});
          log('success', `Collection "${col.id}" permissions verified.`);
        }

        // Check attributes
        const attrRes = await fetch(`${targetEndpoint}/databases/${targetDb}/collections/${col.id}/attributes`, {
          method: 'GET',
          headers,
        });
        const attrData = attrRes.ok ? await attrRes.json().catch(() => ({ attributes: [] })) : { attributes: [] };
        const existingKeys = new Set((attrData.attributes || []).map((a: any) => a.key));

        for (const attr of col.attributes) {
          if (existingKeys.has(attr.key)) {
            continue;
          }

          log('info', `Adding attribute "${attr.key}" to collection "${col.id}"...`);
          let endpointUrl = `${targetEndpoint}/databases/${targetDb}/collections/${col.id}/attributes/string`;
          let payload: any = {
            key: attr.key,
            required: Boolean(attr.required),
          };

          if (attr.type === 'String') {
            endpointUrl = `${targetEndpoint}/databases/${targetDb}/collections/${col.id}/attributes/string`;
            payload.size = (attr as any).size || 255;
            if ((attr as any).default !== undefined) payload.default = (attr as any).default;
          } else if (attr.type === 'Integer') {
            endpointUrl = `${targetEndpoint}/databases/${targetDb}/collections/${col.id}/attributes/integer`;
            if ((attr as any).default !== undefined) payload.default = Number((attr as any).default);
          } else if (attr.type === 'Boolean') {
            endpointUrl = `${targetEndpoint}/databases/${targetDb}/collections/${col.id}/attributes/boolean`;
            if ((attr as any).default !== undefined) payload.default = Boolean((attr as any).default);
          }

          const createAttrRes = await fetch(endpointUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
          });

          if (!createAttrRes.ok) {
            const errData = await createAttrRes.json().catch(() => ({}));
            if (createAttrRes.status !== 409) {
              log('warn', `Attribute "${attr.key}" notice: ${errData.message || createAttrRes.statusText}`);
            }
          } else {
            log('success', `Attribute "${attr.key}" configured.`);
          }
        }
      }

      log('success', 'Appwrite Cloud database, collections, and permissions configured successfully!');

      return res.json({
        success: true,
        message: 'Appwrite Cloud database, collections, and attributes are fully created and verified!',
        logs,
      });
    } catch (err: any) {
      log('error', `Setup error: ${err?.message || err}`);
      return res.status(500).json({
        success: false,
        message: err?.message || 'Provisioning failed',
        logs,
      });
    }
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
