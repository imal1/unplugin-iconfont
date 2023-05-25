import { dirname, join } from "node:path";
import { existsSync, promises as fs } from "node:fs";
import { IndexHtmlTransformResult, type Plugin } from "vite";

interface Options {
  /**
   * iconfont symbol js url
   */
  url: string;
  /**
   * 保存自动下载iconfont symbol js的public下的路径，默认为iconfonts
   */
  filePath?: string;
  /**
   * 自动下载iconfont symbol js的文件名称，默认为url最后一个/后的名称
   */
  fileName?: string;
  /**
   * iconfont symbol js是否自动注入到index.html
   */
  inject?: boolean;
  /**
   * 是否生成icon类型声明文件，可以为boolean或者具体生成的路径
   */
  dts?: boolean | string;
  /**
   * 自动生成iconfont图标集合
   */
  iconJson?: boolean | string;
  /**
   * 是否添加prefix前缀
   * @example prefix: 'icon-' 生成的symbol id为 icon-xxx
   */
  prefix?: string;
}

export default (options: Options[]): Plugin => {
  if (options.some(o => !o.url)) {
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
        filePath: 'iconfonts',
        inject: true,
        dts: false,
        iconJson: false,
        prefix: "",
      },
      o
    )
  });

  let config;
  return {
    name: "vite-plugin-iconfont",
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    async transformIndexHtml() {
      const injectArr: IndexHtmlTransformResult = [];
      for (let i = 0; i < opt.length; i++) {
        const o = opt[i];
        let url = o.url;

        let URL_CONTENT = await getURLContent(url);
        if (o.prefix) {
          URL_CONTENT = URL_CONTENT.replace(/\<symbol id\=\"/g, `<symbol id="${o.prefix}`)
        }
        const iconList = URL_CONTENT.match(/(?<=id=").+?(?=")/g) || [];

        // 生成下载图标配置
        if (o.iconJson) {
          const JSON_CONTENT = await getURLContent(url.replace(".js", ".json"));
          const iconJsonPath =
            o.iconJson !== true ? o.iconJson : "iconfont.json";
          generateFile(iconJsonPath, JSON_CONTENT);
        }

        // 生成ts类型声明文件
        if (o.dts) {
          const dtsPath = options[i].dts !== true ? options[i].dts : "iconfont.d.ts";
          const iconDts = `declare type Iconfont = "${iconList.join('"|"')}"`;
          generateFile(dtsPath as string, iconDts);
        }

        // 自动下载iconfont symbol js
        const { publicDir } = config;
        generateFile(join(publicDir, o.filePath as string, o.fileName as string).split("\\").join("/"), URL_CONTENT);
        if (o.inject) {
          url = join(config.base, o.filePath as string, o.fileName || "")
            .split("\\")
            .join("/");
          injectArr.push({
            tag: "script",
            injectTo: "head",
            attrs: { src: url },
          });
        }
      }
      return injectArr;
    },
  };
};

/**
 * 获取地址，如果是相对协议地址自动添加https
 * @param url
 * @returns
 */
function getURL(url) {
  return /http/.test(url) ? url : `https:${url}`;
}

/**
 * 判断是否是https地址
 * @param url
 * @returns
 */
function isHttpsURL(url) {
  return /https/.test(url);
}

/**
 * 生成文件
 * @param path
 * @param content
 */
async function generateFile(filepath, content) {
  const originalContent = existsSync(filepath)
    ? await fs.readFile(filepath, "utf-8")
    : "";
  originalContent !== content && writeFile(filepath, content);
}

/**
 * 写文件
 * @param filePath
 * @param content
 * @returns
 */
async function writeFile(filePath: string, content = "") {
  await fs.mkdir(dirname(filePath), { recursive: true });
  return await fs.writeFile(filePath, content, "utf-8");
}

/**
 * 获取指定url地址的内容
 * @param url
 * @returns
 */
async function getURLContent(url): Promise<string> {
  const targetURL = getURL(url);
  let http;
  try {
    http = isHttpsURL(targetURL) ? await import("https") : await import("http");
  } catch (err) {
    console.log("https support is disabled!");
  }
  return new Promise((resolve, reject) => {
    http
      .get(targetURL, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk.toString()));
        res.on("end", () => resolve(data));
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}
