import { defineNuxtModule } from "@nuxt/kit";
import type {} from "@nuxt/schema";
import {
  type Options,
  getURLContent,
  generateJson,
  generateDts,
} from "./index";

export default defineNuxtModule({
  meta: {
    name: "create-icon-json",
    configKey: "createIconJson",
  },
  setup({ options }, nuxt) {
    nuxt.hook("modules:done", async () => {
      if (options.some((o) => !o.url)) {
        throw new Error(
          `【vite-plugin-iconfont】 options url parameter is required`
        );
      }

      const opt: Options[] = options.map((o, i) => {
        const urlArr = o.url.split(/[\/]/g);
        return Object.assign(
          {
            url: "",
            fileName: urlArr[urlArr.length - 1],
            filePath: "iconfonts",
            inject: false,
            dts: false,
            iconJson: true,
            prefix: "",
            separator: "-",
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
            `<symbol id="${o.prefix}${o.separator}`
          );
        }
        const iconList = URL_CONTENT.match(/(?<=id=").+?(?=")/g) || [];

        await generateJson(o);

        generateDts(o, i, options, iconList);
      }
    });
  },
});
