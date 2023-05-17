// I must say, the Lambda V3 API and typescript offering from amazon is horrible
import Router from './router'
import { S3FsOperations } from './storage/filesystem-storage'
import { FilesystemStorage } from './storage/storage'

const router = new Router(new FilesystemStorage('/', new S3FsOperations(process.env.BUCKET_NAME || '')))

export const handler = async (event: any, context: any): Promise<any> => {
    const allowedOrigins: Array<string> = ['http://localhost:3000', process.env.PUBLIC_URL || ""]

    if (!allowedOrigins.includes(event.headers.origin)) {
      return {
        statusCode: 403,
        headers: {
          "Content-Type": "text/plain",
        },
        body: 'Access Denied'
      }
    }
  
    const headers: Record<string, string> = {}
    // headers['Access-Control-Allow-Headers'] = 'Content-Type'
    headers['Access-Control-Allow-Headers'] = '*'
    headers['Access-Control-Allow-Origin'] = event.headers.origin
    headers['Access-Control-Allow-Methods'] = 'OPTIONS,GET,POST'

    if (event.httpMethod == 'OPTIONS') {
      return {
        statusCode: 204,
        headers,
        // body: 'OK'
      }
    }

    headers['Content-Type'] = 'application/json'
    const body = event.body
    if (event.isBase64Encoded) {

        console.log(`Event: ${JSON.stringify(event, null, 2)}`);
        console.log(`Context: ${JSON.stringify(context, null, 2)}`);

        // deal with this when it happens
    }
    
    try {
        var res = await router.route(event.httpMethod, event.path, event.headers, undefined)
        return {
            statusCode: "200",
            headers,
            body: JSON.stringify(res),
        }
    } catch (err) {
        console.log('err', err)
        return {
            statusCode: "500",
        }
    }
}
