import { convertSrc } from "./converter";
import * as fs from "fs";

const srcFilePath: string = process.argv[2];

if (!srcFilePath.match(/\.vue$/)) {
  console.log("please input vue file path");
  process.exit(1);
}

const srcFile = fs.readFileSync(srcFilePath, "utf8");
const converted = convertSrc(srcFile);

fs.writeFileSync(srcFilePath, converted);
