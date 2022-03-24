import ts from 'typescript'
import { parseComponent } from 'vue-template-compiler'
import { getNodeByKind } from './helper'
import { convertClass } from './converters/classApiConverter'
import { convertOptionsApi } from './converters/optionsApiConverter'

export const convertSrc = (input: string): string => {
  const parsed = parseComponent(input)
  const scriptContent = parsed.script?.content || ''
  const scriptMethodsFormat = scriptContent
    .replaceAll(/\b(.*): function /g, '$1')
    .replaceAll(/\b(.*): async function /g, 'async $1')
  const sourceFile = ts.createSourceFile(
    'src.tsx',
    scriptMethodsFormat,
    ts.ScriptTarget.Latest
  )

  const exportAssignNode = getNodeByKind(
    sourceFile,
    ts.SyntaxKind.ExportAssignment
  )
  if (exportAssignNode) {
    // optionsAPI
    return convertOptionsApi(sourceFile)
  }

  const classNode = getNodeByKind(sourceFile, ts.SyntaxKind.ClassDeclaration)
  if (classNode && ts.isClassDeclaration(classNode)) {
    // classAPI
    return convertClass(classNode, sourceFile)
  }

  throw new Error('no convert target')
}
