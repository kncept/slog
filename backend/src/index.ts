// I must say, the Lambda V3 API and typescript offering from amazon is horrible
import Router from './router'
import { S3FsOperations } from './storage/filesystem-storage'
import { FilesystemStorage } from './storage/storage'
import { LambdaProxyResponse } from './types'

function frontendUrl(): string {
  let url = process.env.PUBLIC_URL || ""
  if (!url.endsWith('/')) url = url + '/'
  return url
}
function bucketName(): string {
  return process.env.S3_BUCKET_NAME || ''
}

let router: Router | undefined

export const handler = async (event: any, context: any): Promise<any> => {
  console.log('event', event)
  // console.log('context', context)
  try {
    console.log('creating new router')
    if (router === undefined) {
      const fsOperations = new S3FsOperations(bucketName())
      router = new Router(new FilesystemStorage('.', fsOperations))
      console.log('awaiting ready')
      await router.readyFlag // make sure that we've created the s3 directories.

      console.log('about to list posts')
      const dirs = await fsOperations.list('./posts')
      console.log('listed: ', dirs)
    }
  } catch (err) {
    console.log('Router Init Error', err)
    return {
      statusCode: "500",
      headers: {
        'Content-Type': 'text/plain'
      },
      body: JSON.stringify(err),
    }
  }

  // sigh... Origin header isn't always present
  let corsAllowedOriginResponse = '*'
  let originHeader = getHeader(event.headers, 'Origin')
  if (originHeader !== undefined && originHeader.endsWith('/')) originHeader = originHeader.substring(0, originHeader.length - 1)
  const allowedOrigins: Array<string | undefined> = [undefined, 'http://localhost:3000', frontendUrl().substring(0, frontendUrl().length - 1)]
  console.log('CORS test log:', originHeader, allowedOrigins)
    if (!allowedOrigins.includes(originHeader)) {
      return {
        statusCode: 403,
        headers: {
          "Content-Type": "text/plain",
        },
        body: 'Access Denied'
      }
    } else if (originHeader !== undefined) {
      corsAllowedOriginResponse = originHeader
    }
  
  // play nice: redirect all root requests to the frontend
  if (event.path === '/') {
    console.log('direct api access, redirecting to front page', process.env.PUBLIC_URL)
    return {
      statusCode: 303, // 'see other' = temporary redirect
      headers: {
        "Location": frontendUrl(),
      }
    }
  }

  const headers: Record<string, string> = {}
  // headers['Access-Control-Allow-Headers'] = 'Content-Type'
  headers['Access-Control-Allow-Headers'] = '*'
  headers['Access-Control-Allow-Origin'] = corsAllowedOriginResponse
  headers['Access-Control-Allow-Methods'] = 'OPTIONS,GET,POST'

  if (event.httpMethod == 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      // body: 'OK'
    }
  }

  headers['Content-Type'] = 'application/json'
  
  let body: Buffer | undefined = undefined
  if (event.isBase64Encoded && event.body != null) {
    body = Buffer.from(event.body, 'base64')
  }
  
  try {
      var res = await router.route(event.httpMethod, event.path, event.headers, body)
      if (res === undefined) {
        const lambdaResponse = {
          isBase64Encoded: false,
          statusCode: 404,
          headers,
      } as LambdaProxyResponse
      console.log('undefined lambdaResponse', lambdaResponse)
      return lambdaResponse
      } else {
        const lambdaResponse = {
          isBase64Encoded: false,
          statusCode: 200,
          headers,
          body: JSON.stringify(res),
      } as LambdaProxyResponse
      console.log('responsevalue lambdaResponse', lambdaResponse)
      return lambdaResponse
      }
      
  } catch (err) {
      console.log('err', err)
      return {
          statusCode: "500",
      }
  }
}

function getHeader(headers: Record<string, string>, name: string): string | undefined {
  name = name.toLowerCase()
  const keys: Array<string> = Object.keys(headers)
  for(let i = 0; i < keys.length; i++) {
    if (keys[i].toLowerCase() === name) return headers[keys[i]]
  }
  return undefined
}
