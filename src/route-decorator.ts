import path from 'path'

// src/shared/decorators/route.ts
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

interface RouteConfig {
  method: HttpMethod
  path: string
  cors?: boolean
  name?: string
}

const routeConfigs = new Map<string, RouteConfig & { context: string }>()

function getContext(match: RegExpMatchArray) {
  // Expressão regular para capturar o caminho do arquivo dentro dos parênteses
  if (match && match[1]) {
    const caminhoCompleto = match[1] // Exemplo: /Users/.../src/modules/aws/handler

    // Obter o diretório que contém 'handler.ts'
    const diretorio = path.dirname(caminhoCompleto) // Exemplo: /Users/.../src/modules/aws

    // Encontrar a posição de 'src' no caminho
    const indiceSrc = diretorio.indexOf(path.join('src'))

    if (indiceSrc !== -1) {
      // Extrair a substring a partir de 'src'
      const caminhoRelativo = diretorio.substring(indiceSrc) // Exemplo: src/modules/aws
      return caminhoRelativo
    }
  }

  // Retorna null se não encontrar o padrão desejado
  return null
}

export const createHandler = (
  config: RouteConfig,
  handler: (...args: unknown[]) => unknown,
) => {
  if (process.env.NODE_ENV === 'production') {
    return handler
  }

  // Registra a configuração usando o nome do arquivo + nome da função como chave
  const matchPath = new Error()
    .stack!.split('\n')[2]
    .match(/\(([^:]+):\d+:\d+\)/)

  if (!matchPath) {
    throw new Error('Could not find handler path')
  }

  const context = getContext(matchPath)

  if (!context) {
    throw new Error('Could not find handler context')
  }

  const fileName =
    new Error().stack!.split('\n')[2].match(/[/\\]([\w\-. ]+)\.[jt]s/)?.[1] ||
    'unknown'

  const key = `${fileName}.${config.name}`

  routeConfigs.set(key, { ...config, context })

  return handler
}

export const getRouteConfigs = () => {
  return Array.from(routeConfigs.entries()).map(([handler, config]) => ({
    handler,
    ...config,
  }))
}
