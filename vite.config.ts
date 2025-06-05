import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({ babel: { plugins: ['styled-components'], babelrc: false, } }), nodePolyfills({include: ['events']})],
  base: "/ml-with-bricks/"
})
