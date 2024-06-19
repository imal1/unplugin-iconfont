import { dirname, join } from "node:path";
import { existsSync, promises as fs } from "node:fs";
import { Script } from "node:vm";
import { parse } from "svg-parser";

export interface Options {
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
  /**
   * 前缀分隔符
   * @default -
   */
  separator?: string;
  /**
   * 对iconfont symbol进行trim start
   * @example trimStart: 'icon-' 'icon-xxx' 生成的symbol id为 xxx
   */
  trimStart?: string;
  /**
   * 是否输出 iconify 格式的 json，iconJson 为 false 时无效
   */
  iconifyJson?: boolean;
}

export const transIconifyJson = (
  o: Options,
  jsonStr: string,
  jsStr: string
) => {
  if (o.iconifyJson) {
    const json = JSON.parse(jsonStr);
    const jsonIdName = `_iconfont_svg_string_${json.id}`;
    const ctx = {
      window: {
        [jsonIdName]: "",
      },
    };
    try {
      const script = new Script(jsStr);
      script.runInNewContext(ctx);
    } catch (error) {
      () => {};
    }
    const svgStr = ctx.window[jsonIdName];
    const parsed = parse(svgStr);
    const symbols = parsed.children[0].children;

    // 遍历提取的每个图标并放入单独的SVG标签中
    const svgArr = symbols.map((symbol) => {
      let svgContent = '<path d="';

      symbol.children
        .filter((child) => child.tagName === "path")
        .forEach((c, i) => {
          if (i !== 0) svgContent += " ";
          svgContent += `${c.properties.d}`;
        });

      svgContent += '" fill="currentColor" />';

      return { id: symbol.properties.id, body: svgContent };
    });

    return JSON.stringify({
      prefix: o.prefix,
      icons: Object.fromEntries(
        json.glyphs.map((g) => {
          const { body } =
            svgArr.find(
              (s) => s.id === `${json.css_prefix_text}${g.font_class}`
            ) || {};
          return [g.name, { body, width: 1024, height: 1024 }];
        })
      ),
    });
  } else return jsonStr;
};

export const generateJson = async (o: Options) => {
  // 生成下载图标配置
  if (o.iconJson) {
    const JS_CONTENT = await getURLContent(o.url);
    const JSON_CONTENT = await getURLContent(o.url.replace(".js", ".json"));
    const iconJsonPath = o.iconJson !== true ? o.iconJson : "iconfont.json";
    generateFile(iconJsonPath, transIconifyJson(o, JSON_CONTENT, JS_CONTENT));
  }
};

export const generateDts = (
  o: Options,
  i: number,
  opts: Options[],
  iconList: string[]
) => {
  // 生成ts类型声明文件
  if (o.dts) {
    const dtsPath = opts[i].dts !== true ? opts[i].dts : "iconfont.d.ts";
    const iconDts = `declare type Iconfont = "${iconList.join('"|"')}"`;
    generateFile(dtsPath as string, iconDts);
  }
};

export const downloadSymbol = (
  config: any,
  o: Options,
  URL_CONTENT: string
) => {
  const { publicDir } = config;
  generateFile(
    join(publicDir, o.filePath as string, o.fileName as string)
      .split("\\")
      .join("/"),
    URL_CONTENT
  );
};

export const injectHtml = (
  url: string,
  config: any,
  o: Options,
  injectArr: any[]
) => {
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

  return injectArr;
};

/**
 * 获取地址，如果是相对协议地址自动添加https
 * @param url
 * @returns
 */
export function getURL(url) {
  return /http/.test(url) ? url : `https:${url}`;
}

/**
 * 判断是否是https地址
 * @param url
 * @returns
 */
export function isHttpsURL(url) {
  return /https/.test(url);
}

/**
 * 生成文件
 * @param path
 * @param content
 */
export async function generateFile(filepath, content) {
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
export async function getURLContent(url): Promise<string> {
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
