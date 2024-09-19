import { defineConfig } from '@rsbuild/core'
// eslint-disable-next-line antfu/no-import-dist
import Unplugin from '../dist/rspack'

export default defineConfig({
  html: {
    mountId: 'app',
  },
  source: {
    entry: {
      index: './main.ts',
    },
  },
  tools: {
    rspack: {
      plugins: [
        Unplugin({ configFile: './iconfont.config.ts' }),
      ],
    },
  },
})
