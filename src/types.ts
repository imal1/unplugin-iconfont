export interface IconfontConfig {
  /**
   * iconfont symbol js url
   */
  url: string
  /**
   * 保存自动下载iconfont symbol js的public下的路径，默认为iconfonts
   */
  filePath?: string
  /**
   * 自动下载iconfont symbol js的文件名称，默认为url最后一个/后的名称
   */
  fileName?: string
  /**
   * iconfont symbol js是否自动注入到index.html
   */
  inject?: boolean
  /**
   * 是否生成icon类型声明文件，可以为boolean或者具体生成的路径
   */
  dts?: boolean | string
  /**
   * 自动生成iconfont图标集合
   */
  iconJson?: boolean | string
  /**
   * 是否添加prefix前缀
   * @example prefix: 'icon-' 生成的symbol id为 icon-xxx
   */
  prefix?: string
  /**
   * 前缀分隔符
   * @default -
   */
  separator?: string
  /**
   * 对iconfont symbol进行trim start
   * @example trimStart: 'icon-' 'icon-xxx' 生成的symbol id为 xxx
   */
  trimStart?: string
  /**
   * 是否输出 iconify 格式的 json，iconJson 为 false 时无效
   */
  iconifyJson?: boolean
}

export type IconFontOptions = Partial<IconfontConfig> & IconfontConfig[]

export type Options = Partial<IconFontOptions> & { configFile?: string }
