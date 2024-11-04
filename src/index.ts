import fs from 'fs'
import * as path from 'path'

import { generate } from './route-importer'

export type GeneratorConfigFileData = {
  pathPattern: string
  projectRoot: string
  generatedFileName?: string
}

export { createHandler } from './route-decorator'

export default async function importConfigFile() {
  try {
    const filename = 'serverless-route.config'

    const configFileJson = path.join(process.cwd(), `${filename}.json`)

    if (fs.existsSync(configFileJson)) {
      const data = fs.readFileSync(configFileJson, 'utf-8')

      const parse = JSON.parse(data) as GeneratorConfigFileData

      await generate(parse)

      return
    }

    const configFileJs = path.join(process.cwd(), `${filename}.js`)

    if (fs.existsSync(configFileJs)) {
      const data = await import(configFileJs)

      const configData = data.default as GeneratorConfigFileData

      await generate(configData)

      return
    }

    throw new Error(
      `Could not find config file at ${configFileJson} or ${configFileJs}`,
    )
  } catch (error) {
    const err = error as Error

    console.error(err.message)
    process.exit(1)
  }
}

// Executa o gerador
importConfigFile().catch(console.error)
