import type { UnpluginFactory } from 'unplugin'
import { createUnplugin } from 'unplugin'
import type { Options, PartialIconfontConfig } from './types'

export const defineConfig = (configs: PartialIconfontConfig) => configs

export const unpluginFactory: UnpluginFactory<Options | undefined> = options => ({
  name: 'unplugin-iconfont',
  transformInclude(id) {
    return id.endsWith('iconfont.config.', id.length - 2) || id.endsWith('iconfont.config.', id.length - 3)
  },
  transform(code) {

    if (!Array.isArray(options))
      this.error(`Options must be an Array`)

    if (options?.some(o => !o.url))
      this.error(`Options url parameter is required`)

    // console.log(chalk.yellow.inverse(' code '), code)
    // return

    // return code.replace('__UNPLUGIN__', `Hello Unplugin! ${options}`)
  },
})

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory)

export default unplugin
