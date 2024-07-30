import { dirname, join } from 'node:path'
import { type PathLike, existsSync, promises as fs } from 'node:fs'
import { Script } from 'node:vm'
import { parse } from 'svg-parser'
import type { IconfontConfig } from './types'

export function transIconifyJson(o: IconfontConfig, jsonStr: string, jsStr: string) {
  if (o.iconifyJson) {
    const json = JSON.parse(jsonStr)
    const jsonIdName = `_iconfont_svg_string_${json.id}`
    const ctx = {
      window: {
        [jsonIdName]: '',
      },
    }
    try {
      const script = new Script(jsStr)
      script.runInNewContext(ctx)
    }
    catch (error) {}
    const svgStr = ctx.window[jsonIdName]
    const parsed: any = parse(svgStr)
    const symbols = parsed.children[0].children

    // 遍历提取的每个图标并放入单独的SVG标签中
    const svgArr = symbols.map((symbol: { children: any[], properties: { id: any } }) => {
      let svgContent = '<path d="'

      symbol.children
        .filter((child: { tagName: string }) => child.tagName === 'path')
        .forEach((c: { properties: { d: any } }, i: number) => {
          if (i !== 0)
            svgContent += ' '
          svgContent += `${c.properties.d}`
        })

      svgContent += '" fill="currentColor" />'

      return { id: symbol.properties.id, body: svgContent }
    })

    return JSON.stringify({
      prefix: o.prefix,
      icons: Object.fromEntries(
        json.glyphs.map((g: { font_class: any, name: any }) => {
          const { body }
            = svgArr.find(
              (s: { id: string }) => s.id === `${json.css_prefix_text}${g.font_class}`,
            ) || {}
          return [g.name, { body, width: 1024, height: 1024 }]
        }),
      ),
    })
  }
  else { return jsonStr }
}

export async function generateJson(o: IconfontConfig) {
  // 生成下载图标配置
  if (o.iconJson) {
    const JS_CONTENT = await getURLContent(o.url)
    const JSON_CONTENT = await getURLContent(o.url.replace('.js', '.json'))
    const iconJsonPath = o.iconJson !== true ? o.iconJson : 'iconfont.json'
    generateFile(iconJsonPath, transIconifyJson(o, JSON_CONTENT, JS_CONTENT))
  }
}

export function generateDts(o: IconfontConfig, i: number, opts: IconfontConfig[], iconList: string[]) {
  // 生成ts类型声明文件
  if (o.dts) {
    const dtsPath = opts[i].dts !== true ? opts[i].dts : 'iconfont.d.ts'
    const iconDts = `declare type Iconfont = "${iconList.join('"|"')}"`
    generateFile(dtsPath as string, iconDts)
  }
}

export function downloadSymbol(publicPath: string, o: IconfontConfig, URL_CONTENT: string) {
  generateFile(
    join(publicPath, o.filePath as string, o.fileName as string)
      .split('\\')
      .join('/'),
    URL_CONTENT,
  )
}

export function injectHtml(url: string, config: any, o: IconfontConfig, injectArr: any[]) {
  if (o.inject) {
    url = join(config.base, o.filePath as string, o.fileName || '')
      .split('\\')
      .join('/')
    injectArr.push({
      tag: 'script',
      injectTo: 'head',
      attrs: { src: url },
    })
  }

  return injectArr
}

/**
 * 获取地址，如果是相对协议地址自动添加https
 * @param url
 * @returns
 */
export function getURL(url: string) {
  return /http/.test(url) ? url : `https:${url}`
}

/**
 * 判断是否是https地址
 * @param url
 * @returns
 */
export function isHttpsURL(url: string) {
  return /https/.test(url)
}

/**
 * 生成文件
 * @param path
 * @param content
 */
export async function generateFile(filepath: PathLike & string, content: string | undefined) {
  const originalContent = existsSync(filepath)
    ? await fs.readFile(filepath, 'utf-8')
    : ''
  originalContent !== content && writeFile(filepath, content)
}

/**
 * 写文件
 * @param filePath
 * @param content
 * @returns
 */
async function writeFile(filePath: string, content = '') {
  await fs.mkdir(dirname(filePath), { recursive: true })
  return await fs.writeFile(filePath, content, 'utf-8')
}

/**
 * 获取指定url地址的内容
 * @param url
 * @returns
 */
export async function getURLContent(url: string): Promise<string> {
  const targetURL = getURL(url)
  let http: any
  try {
    http = isHttpsURL(targetURL) ? await import('node:https') : await import('node:http')
  }
  catch (err) {
    console.error('https support is disabled!')
  }
  return new Promise((resolve, reject) => {
    http
      .get(targetURL, (res: any) => {
        let data = ''
        res.on('data', (chunk: { toString: () => string }) => (data += chunk.toString()))
        res.on('end', () => resolve(data))
      })
      .on('error', (err: Error) => {
        reject(err)
      })
  })
}
