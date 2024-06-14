import { IndexHtmlTransformResult, type Plugin } from "vite";
import {
  type Options,
  getURLContent,
  generateJson,
  generateDts,
  downloadSymbol,
  injectHtml,
} from "./index";

export default (options: Options[]): Plugin => {
  if (options.some((o) => !o.url)) {
    throw new Error(
      `【vite-plugin-iconfont】 options url parameter is required`
    );
  }

  let config;

  return {
    name: "vite-plugin-iconfont",
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    async transformIndexHtml() {
      const injectArr: IndexHtmlTransformResult = [];

      const opt: Options[] = options.map((o, i) => {
        const urlArr = o.url.split(/[\/]/g);
        return Object.assign(
          {
            url: "",
            fileName: urlArr[urlArr.length - 1],
            filePath: "iconfonts",
            inject: true,
            dts: false,
            iconJson: false,
            prefix: "",
            trimStart: "",
          },
          o
        );
      });

      for (let i = 0; i < opt.length; i++) {
        const o = opt[i];
        let url = o.url;

        let URL_CONTENT = await getURLContent(url);
        if (o.trimStart) {
          URL_CONTENT = URL_CONTENT.replace(
            new RegExp(`id="${o.trimStart}`, "g"),
            'id="'
          );
        }
        if (o.prefix) {
          URL_CONTENT = URL_CONTENT.replace(
            /\<symbol id\=\"/g,
            `<symbol id="${o.prefix}`
          );
        }
        const iconList = URL_CONTENT.match(/(?<=id=").+?(?=")/g) || [];

        await generateJson(o);

        generateDts(o, i, options, iconList);

        downloadSymbol(config, o, URL_CONTENT);

        return injectHtml(url, config, o, injectArr);
      }
    },
  };
};
