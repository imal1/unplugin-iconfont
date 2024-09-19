import { defineConfig } from '@rsbuild/core'
import Unplugin from '../src/rspack'

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
