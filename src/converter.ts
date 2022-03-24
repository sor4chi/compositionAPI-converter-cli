import ts from "typescript";
import { parseComponent } from "vue-template-compiler";
import { getNodeByKind } from "./helper";
import { convertClass } from "./converters/classApiConverter";
import { convertOptionsApi } from "./converters/optionsApiConverter";

export const convertSrc = (input: string): string => {
  const parsed = parseComponent(input);
  const scriptContent = parsed.script?.content || "";
  const templateContent = parsed.template?.content || "";
  const styleContent =
    parsed.styles?.map((style) => style.content).join("\n") || "";
  const scriptMethodsFormat = scriptContent
    .replaceAll(/\b(.*): function /g, "$1")
    .replaceAll(/\b(.*): async function /g, "async $1");
  const sourceFile = ts.createSourceFile(
    "src.tsx",
    scriptMethodsFormat,
    ts.ScriptTarget.Latest
  );

  const exportAssignNode = getNodeByKind(
    sourceFile,
    ts.SyntaxKind.ExportAssignment
  );
  if (exportAssignNode) {
    // optionsAPI
    const convertedScript: string = convertOptionsApi(sourceFile);
    const returnVueScript: string = `<template>${templateContent}\n</template>\n\n<script>\n${convertedScript}\n</script>\n\n<style scoped>\n${styleContent}</style>`;
    return returnVueScript;
  }

  const classNode = getNodeByKind(sourceFile, ts.SyntaxKind.ClassDeclaration);
  if (classNode && ts.isClassDeclaration(classNode)) {
    // classAPI
    const convertedScript: string = convertClass(classNode, sourceFile);
    const returnVueScript: string = `<template>${templateContent}</template>\n\n<script>\n${convertedScript}</script>\n\n<style scoped>\n${styleContent}</style>`;
    return returnVueScript;
  }

  throw new Error("no convert target");
};
