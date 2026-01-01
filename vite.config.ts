import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    // Get API key from either .env file or process.env (Vercel)
    const apiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

    // Get Supabase credentials from either .env file or process.env (Vercel)
    const supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    // Log warning if credentials are missing (only in development)
    if (mode === 'development' && (!supabaseUrl || !supabaseAnonKey)) {
      console.warn('Warning: Supabase credentials are missing');
    }

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      envPrefix: 'VITE_',
      define: {
        // Expose environment variables at build time
        'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(apiKey),
        'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
        'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
