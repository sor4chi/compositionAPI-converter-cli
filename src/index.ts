import { convertSrc } from "./converter";
import * as fs from "fs";

const srcFilePath: string = process.argv[2];

if (!srcFilePath.match(/\.vue$/)) {
  console.log("please input vue file path");
  process.exit(1);
}

const srcFile = fs.readFileSync(srcFilePath, "utf8");
const converted = convertSrc(srcFile);

let unicodeUnescape = function (str: string): string {
  return str
    .replace(/\\u([\d\w]{4})/gi, (match, grp) => {
      return String.fromCharCode(parseInt(grp, 16));
    })
    .replace(/\\/g, "");
};

const unescapedScript = unicodeUnescape(converted);

fs.writeFileSync(srcFilePath, unescapedScript, "utf8");
