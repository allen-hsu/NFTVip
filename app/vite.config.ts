import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';
// import Terminal from 'vite-plugin-terminal';
// https://vitejs.dev/config/
export default defineConfig({
    base: '/',
    plugins: [react(), tsconfigPaths()],
    publicDir: './public',
});
