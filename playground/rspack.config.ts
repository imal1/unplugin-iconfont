import type { Configuration } from '@rspack/cli'
import Unplugin from '../src/rspack'

const config: Configuration = {
  plugins: [
    Unplugin(),
  ],
}

export default config
