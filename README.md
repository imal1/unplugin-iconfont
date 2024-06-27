# ⚡unplugin-iconfont
[![npm](https://img.shields.io/npm/v/vite-plugin-iconfont)](https://www.npmjs.com/package/vite-plugin-iconfont) [![npm](https://img.shields.io/npm/dt/vite-plugin-iconfont)](https://www.npmjs.com/package/vite-plugin-iconfont)

这是一个自动下载iconfont symbol js到项目的vite 插件，旨在解决单个项目多个iconfont库的问题（目前仅支持阿里icofont），支持以下特性：

- 自动下载iconfont symbol js 到本地。
- 自动生成iconfont json配置（iconify格式）。
- 自动生成iconfont TypeScript类型声明文件。
- 支持构建时自动注入index.html。

## 安装

```shell
npm install -D unplugin-iconfont
// 或
yarn add -D unplugin-iconfont
// 或
pnpm install -D unplugin-iconfont
```

## 使用方法

### vite

添加插件到`vite.config.ts`

```ts
import { defineConfig } from 'vite';
import Iconfont from 'unplugin-iconfont/vite';
export default defineConfig({
  plugins: [
    // ...
    Iconfont([
      {
        url: '//at.alicdn.com/t/c/font_1*********.js',
        fileName: 'iconfont-1.js',
        prefix: 'iconfont_1',
        separator: '-',
        dts: true,
      },
      {
        url: '//at.alicdn.com/t/c/font_2*********.js',
        fileName: 'iconfont-2.js',
        prefix: 'iconfont_2',
        separator: '-',
        dts: true,
      }
    ])
  ]
});
```

### nuxt

添加到`nuxt.config.ts`中的`modules`

```ts
import { defineNuxtConfig } from 'nuxt/config';
export default defineNuxtConfig({
  modules: [
    // ...
    [
      'unplugin-iconfont/nuxt',
      {
        options: [
          {
            url: '//at.alicdn.com/t/c/font_1*********.js',
            fileName: 'iconfont-1.js',
            prefix: 'iconfont_1',
            separator: '-',
            dts: true,
          }
        ]
      }
    ]
  ]
})
```

### iconify

插件配置项

```json
// options
{
  url: '//at.alicdn.com/t/c/font_*********.js',
  fileName: false,
  prefix: 'common',
  iconJson: './src/assets/iconfonts/iconfont-common.json',
  iconifyJson: true,
},
```

uno.config.ts

```ts
import { defineConfig, presetIcons } from 'unocss';
export default defineConfig({
  presets: [
    // ...
    presetIcons({
      common: () => import('./src/assets/iconfonts/iconfont-common.json').then((i) => i.default),
    }),
  ],
})
```

## 配置选项(options)

### url

iconfont使用symbol引用方式，生成的项目js地址，该参数为主要输入参数。

- **Type :** `string`
- **Default :** ''
- **Required :**`true`

### filePath

保存自动下载iconfont symbol js的public下的路径，默认为iconfonts。

- **Type :** `string`
- **Default :** `iconfonts`
- **Required :**`false`

### fileName

自动下载iconfont symbol js的文件名称，默认为url最后一个/后的名称

- **Type :** `string`
- **Default :** `${filename}.js`
- **Required :**`false`

### iconJson

生成iconify json配置路径，默认文件名称：`iconfont.json` 。

- **Type :** `boolean|string`
- **Default :** `false`
- **Required :**`false`

### inject

iconfont symbol js是否自动注入到`index.html`文件。

- **Type :** `boolean`
- **Default :** `true`
- **Required :**`false`

### dts

生成TypeScript 类型声明文件,`false`不生成，也可以是具体生成类型声明文件的文件路径地址，默认文件名称：`iconfont.d.ts`。

- **Type :** `boolean|string`
- **Default :** `false`
- **Required :**`false`

### prefix

生成的iconfont symbol js的前缀，为了区分多个 iconfont 中的 id 值。

- **Type :** `string`
- **Default :** ''
- **Required :**`false`

### separator

prefix前缀分隔符

- **Type :** `string`
- **Default :** '-'
- **Required :**`false`

### trimStart

对iconfont symbol进行trim start

- **example :** `trimStart: 'icon-' 'icon-xxx' 生成的symbol id为 xxx`
- **Type :** `string`
- **Default :** ''
- **Required :**`false`

### iconifyJson

是否输出 iconify 格式的 json，iconJson 为 false 时无效

- **Type :** `boolean`
- **Default :** `true`
- **Required :**`false`

>注意：要获得eslint的支持请在eslint配置文件中增加如下配置：

```js
{
  globals: {
    Iconfont: true,
  },
  ...
}
```

