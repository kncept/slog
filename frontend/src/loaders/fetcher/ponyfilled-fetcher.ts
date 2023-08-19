
import fetchPonyfill from 'fetch-ponyfill'
import { Fetcher, FetcherInitParams } from './fetcher'
const fetch_ponyfill = fetchPonyfill({})

export default class PoynfilledFetcher implements Fetcher {
    fetch(
        url: string,
        params?: FetcherInitParams,
    ): Promise<Response> {
        const headers = params?.headers || {}

        console.log(`${params?.method || 'GET'} ${url}, ${headers['Authorization']}`)
        return fetch_ponyfill.fetch(url, {
            headers: new Headers(params?.headers || {}),
            method: params?.method || 'GET',
            body: params?.body,
            credentials: 'include'
        })
    }
}