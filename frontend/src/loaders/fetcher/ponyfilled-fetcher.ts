
import fetchPonyfill from 'fetch-ponyfill'
import { Fetcher, FetcherInitParams } from './fetcher'
const fetch_ponyfill = fetchPonyfill({})

export default class PoynfilledFetcher implements Fetcher {
    fetch(
        url: string,
        params: FetcherInitParams,
    ): Promise<Response> {
        // console.log(`${params.method} ${url}, ${Object.keys(params.headers)}`)
        return fetch_ponyfill.fetch(url, {
            headers: new Headers(params.headers),
            method: params.method,
            body: params?.body,
            credentials: 'include',
            mode: 'cors',
        })
    }
}