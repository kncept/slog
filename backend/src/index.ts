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

  const multiValueHeaders: Record<string, string[]> = {}
  multiValueHeaders['Access-Control-Allow-Headers'] = ['Content-Type','Content-Disposition','Authorization','Accept']
  // headers['Access-Control-Allow-Headers'] = '*'
  multiValueHeaders['Access-Control-Allow-Origin'] = [corsAllowedOriginResponse]
  multiValueHeaders['Access-Control-Allow-Methods'] = ['OPTIONS','GET','POST','DELETE']

  if (event.httpMethod == 'OPTIONS') {
    return {
      statusCode: 204,
      // headers,
      multiValueHeaders,
      body: ''
    }
  }

  let body: Buffer | undefined = undefined
  if (event.isBase64Encoded && event.body) {
    body = Buffer.from(event.body, 'base64')
  }
  

  try {
      var res = await router.route(event.httpMethod, event.path, event.headers, body)
      if(res.headers) {
        Object.keys(res.headers).forEach(key => {

          if (!multiValueHeaders[key]) {
            multiValueHeaders[key] = []
          }
          multiValueHeaders[key].push(res.headers![key])

        }) 
      }

      if (res.body == undefined) {
        return {
          multiValueHeaders,
          statusCode: res.statusCode,
          body: ''
        }
      }
      if (Buffer.isBuffer(res.body)) {
        return {
          multiValueHeaders,
          statusCode: res.statusCode,
          isBase64Encoded: true,
          body: (res.body as Buffer).toString('base64'),
        }
      }
      if (typeof res.body === 'string') {
        return {
          multiValueHeaders,
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
