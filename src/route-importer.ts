import * as path from 'path'
import url from 'url'

import { globSync } from 'glob'

import { ServerlessGenerator } from './route-generator'

import { GeneratorConfigFileData } from '.'

async function importAllHandlers(data: GeneratorConfigFileData) {
  const handlersPath = path.join(
    process.cwd(),
    `${data.projectRoot.concat('/').concat(data.pathPattern)}`,
  )

  const handlers = globSync(handlersPath)

  for (const handler of handlers) {
    try {
      // Importa cada handler para registrar as rotas
      const handlerUrl = url.pathToFileURL(handler).href
      await import(handlerUrl)
    } catch (error) {
      console.warn(`Warning: Could not import handler at ${handler}`, error)
    }
  }
}

export async function generate(data: GeneratorConfigFileData) {
  try {
    // Primeiro importa todos os handlers
    await importAllHandlers(data)

    const fileName = data?.generatedFileName ?? 'serverless-route'

    // Depois gera o serverless.ts
    const projectRoot = process.cwd()
    const srcPath = path.join(projectRoot, data.projectRoot)
    const serverlessPath = path.join(projectRoot, `${fileName}.js`)

    const generator = new ServerlessGenerator(srcPath, serverlessPath)

    generator.generate()

    console.log('Route generation completed successfully!')
  } catch (error) {
    console.error('Error generating routes:', error)
    process.exit(1)
  }
}
