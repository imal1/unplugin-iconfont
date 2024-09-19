import type { IndexHtmlTransformResult } from 'vite'
import type { Options } from '../types'
import { loadConfig } from 'unconfig'
import { createUnplugin } from 'unplugin'
import { downloadSymbol, generateDts, generateJson, getURLContent, injectHtml } from './utils'

let frameConfig: any

const PLUGIN_NAME = 'unplugin-iconfont'

export default createUnplugin<Options | undefined>((options, meta) => {
  // const filter = createFilter(
  //   options?.configFile || [/iconfont\.config\.(c|m)?js|ts$/],
  // )

  return {
    name: PLUGIN_NAME,
    enforce: 'post',
    async transform() {
      const isVite = meta.framework === 'vite'
      const isRspack = meta.framework === 'rspack'

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
      if (!config.length || !config.every(c => c.url || c.configFile))
        this.error(`Options url parameter is required`)

      const originConfig = config

      config = config.filter(c => c.url).map((c) => {
        const urlArr = c.url.split(/\//g)
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
            /<symbol id="/g,
            `<symbol id="${c.prefix}${c.separator}`,
          )
        }

        const iconList = URL_CONTENT.match(/(?<=id=").+?(?=")/g) || []

        if (c.iconJson)
          await generateJson(c)

        if (c.dts)
          generateDts(c, i, config, iconList)

        if (c.inject) {
          if (isVite) {
            const injectArr: IndexHtmlTransformResult = []

            injectHtml(c.url, frameConfig, c, injectArr)
          }
        }

        if (originConfig[i].fileName) {
          let publicDir: string = ''

          if (isVite)
            publicDir = frameConfig.publicDir

          if (isRspack) {
            publicDir = frameConfig.output.publicPath === 'auto' ? frameConfig.output.path : frameConfig.output.publicPath
          }

          if (publicDir)
            downloadSymbol(publicDir, c, URL_CONTENT)
        }
      }

      return null
    },
    vite: {
      configResolved(config) {
        frameConfig = config
      },
    },
    webpack(compiler) {
      compiler.hooks.watchRun.tap(PLUGIN_NAME, (watching) => {
        frameConfig = watching.options
      })
    },
    rspack(compiler) {
      compiler.hooks.watchRun.tap(PLUGIN_NAME, (watching) => {
        frameConfig = watching.options
      })
    },
  }
})
