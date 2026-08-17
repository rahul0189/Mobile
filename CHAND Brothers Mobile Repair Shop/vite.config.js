import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'child_process';

// Synchronously resolve bucket configuration file using NodeJS script before compiling
try {
  execSync('node scripts/resolve-bucket.cjs', { stdio: 'inherit' });
} catch (e) {
  console.error('[Vite Config] Pre-build bucket resolution failed:', e.message);
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
});
