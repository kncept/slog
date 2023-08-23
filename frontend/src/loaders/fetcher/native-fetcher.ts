
import { Fetcher, FetcherInitParams } from './fetcher'

export default class NativeFetcher implements Fetcher {
    fetch(
        url: string,
        params: FetcherInitParams,
    ): Promise<Response> {
        // console.log(`${params.method} ${url}, ${Object.keys(params.headers)}`)
        return fetch(url, {
            headers: new Headers(params.headers),
            method: params.method,
            body: params?.body,
            credentials: 'include',
            mode: 'cors',
        })
    }
}