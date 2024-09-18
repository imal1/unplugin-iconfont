import type { Configuration } from '@rspack/cli'
import Unplugin from '../src/rspack'

const config: Configuration = {
  entry: './main.ts',
  plugins: [
    Unplugin({ configFile: './iconfont.config.ts' }),
  ],
}

export default config
