import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import { execSync } from 'child_process';

const configPath = './src/bucketConfig.js';

if (!fs.existsSync(configPath)) {
  try {
    console.log('[KVdb] Generating permanent cloud bucket ID...');
    const bucketId = execSync('curl -s -X POST https://kvdb.io/').toString().trim();
    if (bucketId && bucketId.length > 5 && !bucketId.includes('html') && !bucketId.includes('error')) {
      fs.writeFileSync(configPath, `export const BUCKET_ID = "${bucketId}";\n`);
      console.log(`[KVdb] Successfully created bucket: ${bucketId}`);
    } else {
      throw new Error(`Invalid response: ${bucketId}`);
    }
  } catch (e) {
    console.error('[KVdb] Failed to generate bucket, using fallback:', e.message);
    fs.writeFileSync(configPath, `export const BUCKET_ID = "fallback_chand_bucket_v1";\n`);
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
});
