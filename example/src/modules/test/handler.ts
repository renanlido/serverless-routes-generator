import { createHandler } from '../../../../dist'

export const generatePresignedLink = createHandler(
  {
    method: 'POST',
    path: 'test/route-path',
    cors: true,
    name: 'route-path',
  },
  () => {
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Hello World' }),
    }
  },
)
