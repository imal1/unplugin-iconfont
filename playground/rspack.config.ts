import type { Configuration } from '@rspack/cli'
import { HtmlRspackPlugin } from '@rspack/core'
import Unplugin from '../src/rspack'

const config: Configuration = {
  entry: './main.ts',
  plugins: [
    new HtmlRspackPlugin({
      template: './index.html',
    }),
    Unplugin({ configFile: './iconfont.config.ts' }),
  ],
}

export default config
