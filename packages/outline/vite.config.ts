import {fileURLToPath, URL} from "url";
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import raw from 'vite-raw-plugin'
import path from "path";
// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
  return {
    plugins: [vue(), raw({
      fileRegex: /\.md$/i,
    })],
    build: {
      minify: mode === 'production',
      lib: {
        entry: 'src/index.ts',
        name: 'LexicalOutLineVue',
        fileName: (format) => `lexical-outline-vue.${format}.js`
      },
      rollupOptions: {
        external: [
          'vue',
          'lexical-vue',
          '@vue/composition-api',
          '@lexical/clipboard',
          '@lexical/code',
          '@lexical/dragon',
          '@lexical/hashtag',
          '@lexical/history',
          '@lexical/link',
          '@lexical/list',
          '@lexical/mark',
          '@lexical/markdown',
          '@lexical/overflow',
          '@lexical/plain',
          '@lexical/rich',
          '@lexical/selection',
          '@lexical/table',
          '@lexical/text',
          '@lexical/utils',
          '@lexical/yjs',
          '@lexical/rich-text',
          'lexical'
        ],
        output: {
          globals: {
            vue: 'Vue'
          }
        },
      }
    },
    resolve: {
      alias: [
        {find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url))},
      ],
    },
  }
})
