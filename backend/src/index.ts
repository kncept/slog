// I must say, the Lambda V3 API and typescript offering from amazon is horrible
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import Router from './router'
import { S3FsOperations } from './storage/filesystem-storage'
import { FilesystemStorage } from './storage/storage'

function frontendUrl(): string {
  let url = process.env.PUBLIC_URL || ''
  if (!url.endsWith('/')) url = url + '/'
  return url
}
function bucketName(): string {
  return process.env.S3_BUCKET_NAME || ''
}

const router: Router = new Router(
  new FilesystemStorage('.', new S3FsOperations(bucketName())))

export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  // console.log('event', event)
  // console.log('context', context)
  await router.readyFlag // make sure that we've created the s3 directories.

  // sigh... Origin header isn't always present
  let corsAllowedOriginResponse = '*'
  let originHeader = getHeader(event.headers, 'Origin')
  if (originHeader !== undefined && originHeader.endsWith('/')) originHeader = originHeader.substring(0, originHeader.length - 1)
  const allowedOrigins: Array<string | undefined> = [undefined, 'http://localhost:3000', frontendUrl().substring(0, frontendUrl().length - 1)]
    if (!allowedOrigins.includes(originHeader)) {
      return {
        statusCode: 403,
        headers: {
          'Content-Type': 'text/plain',
        },
        body: 'Access Denied'
      }
    } else if (originHeader !== undefined) {
      corsAllowedOriginResponse = originHeader
    }
  
  // play nice: redirect all root requests to the frontend
  if (event.path === '/') {
    return {
      statusCode: 303, // 'see other' = temporary redirect
      headers: {
        'Location': frontendUrl(),
      },
      body: ''
    }
  }

  const headers: Record<string, string> = {}
  // headers['Access-Control-Allow-Headers'] = 'Content-Type'
  headers['Access-Control-Allow-Headers'] = '*'
  headers['Access-Control-Allow-Origin'] = corsAllowedOriginResponse
  headers['Access-Control-Allow-Methods'] = 'OPTIONS,GET,POST,DELETE'

  if (event.httpMethod == 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    }
  }

  let body: Buffer | undefined = undefined
  if (event.isBase64Encoded && event.body) {
    body = Buffer.from(event.body, 'base64')
  }
  
  event.headers

  try {
      var res = await router.route(event.httpMethod, event.path, event.headers, body)
      if(res.headers) {
        Object.keys(res.headers).forEach(key => headers[key] = res.headers![key])
      }

      if (res.body == undefined) {
        return {
          headers,
          statusCode: res.statusCode,
          body: ''
        }
      }
      if (Buffer.isBuffer(res.body)) {
        return {
          headers,
          statusCode: res.statusCode,
          isBase64Encoded: true,
          body: (res.body as Buffer).toString('base64'),
        }
      }
      if (typeof res.body === 'string') {
        return {
          headers,
          statusCode: res.statusCode,
          isBase64Encoded: false,
          body: res.body as string
        }
      }
      console.log('Internal Server Error: Unable to determine type of ' + res.body)
      return {
        statusCode: 500,
        isBase64Encoded: false,
        body: 'Internal Server Error'
      }
  } catch (err) {
      console.log('err', err)
      return {
          statusCode: 500,
          body: ''
      }
  }
}

function getHeader(headers: Record<string, string | undefined>, name: string): string | undefined {
  name = name.toLowerCase()
  const keys: Array<string> = Object.keys(headers)
  for(let i = 0; i < keys.length; i++) {
    if (keys[i].toLowerCase() === name) return headers[keys[i]]
  }
  return undefined
}
