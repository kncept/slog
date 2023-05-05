// I must say, the Lambda V3 API and typescript offering from amazon is horrible
import Router from './router'

const router = new Router()

export const handler = async (event: any, context: any): Promise<any> => {
    console.log(`Event: ${JSON.stringify(event, null, 2)}`);
    console.log(`Context: ${JSON.stringify(context, null, 2)}`);

    // todo: cors??

    return {
        statusCode: "200",
        body: JSON.stringify({
            id: Math.random(),
            title: "lambda title" + Math.random()
        }),
    }
}
