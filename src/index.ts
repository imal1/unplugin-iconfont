import type { UnpluginFactory } from 'unplugin'
import { createUnplugin } from 'unplugin'
import { loadConfig } from 'unconfig'
import type { Options } from './types'
import { downloadSymbol, generateDts, generateJson, getURLContent } from './utils'

export const defineConfig = (configs: Options) => configs

let frameConfig: any

export const unpluginFactory: UnpluginFactory<Options | undefined> = options => ({
  name: 'unplugin-iconfont',
  transformInclude(id) {
    return (
      id.endsWith('iconfont.config.', id.length - 2)
      || id.endsWith('iconfont.config.', id.length - 3)
    )
  },
  async transform() {
    let config = Array.isArray(options) ? options : options ? [options] : [] as any[]
    config = (await loadConfig({
      sources: [
        {
          files: 'iconfont.config',
          extensions: ['ts', 'mts', 'cts', 'js', 'mjs', 'cjs', 'json', ''],
          rewrite(config) {
            return (config as any).default
          },
        },
      ],
      defaults: config,
    })).config
    if (!config.length || !config.every(c => c.url))
      this.error(`Options url parameter is required`)

    config = config.map((c) => {
      const urlArr = c.url.split(/[\/]/g)
      return Object.assign(
        {
          url: '',
          fileName: urlArr[urlArr.length - 1],
          filePath: 'iconfonts',
          inject: true,
          dts: false,
          iconJson: false,
          prefix: '',
          separator: '-',
          trimStart: '',
          iconifyJson: false,
        },
        c,
      )
    })

    for (const [i, c] of config.entries()) {
      const url = c.url
      let URL_CONTENT = await getURLContent(url)

      if (c.trimStart) {
        URL_CONTENT = URL_CONTENT.replace(
          new RegExp(`id="${c.trimStart}`, 'g'),
          'id="',
        )
      }

      if (c.prefix) {
        URL_CONTENT = URL_CONTENT.replace(
          /\<symbol id\=\"/g,
          `<symbol id="${c.prefix}`,
        )
      }

      const iconList = URL_CONTENT.match(/(?<=id=").+?(?=")/g) || []

      if (c.iconJson)
        await generateJson(c)

      if (c.dts)
        generateDts(c, i, config, iconList)

      downloadSymbol(frameConfig.publicDir, c, URL_CONTENT)
    }

    return null
  },
  vite: {
    configResolved(config) {
      frameConfig = config
    },
  },
  webpack(compiler) {
    console.log(compiler)
  },
})

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory)

export default unplugin
