// I must say, the Lambda V3 API and typescript offering from amazon is horrible
import Router from './router'

export const handler = async (event: any, context: any): Promise<any> => {
    console.log('event', event)
    console.log('context', context)
    return "done"
}
