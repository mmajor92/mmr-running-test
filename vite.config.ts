import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Without this file, Vite never loads @vitejs/plugin-react, so JSX is compiled
// with esbuild's classic transform and every file needs `React` in scope.
// The plugin switches to the automatic runtime and enables Fast Refresh.
export default defineConfig({
  plugins: [react()],
});
