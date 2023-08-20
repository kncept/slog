
import {default as iso_fetch}  from 'isomorphic-fetch'
import { Fetcher, FetcherInitParams } from './fetcher'

export default class IsomorphicFetcher implements Fetcher {
    fetch(
        url: string,
        params: FetcherInitParams,
    ): Promise<Response> {
        console.log(`${params.method} ${url}, ${Object.keys(params.headers)}`)
        return iso_fetch(url, {
            headers: new Headers(params.headers),
            method: params.method,
            body: params?.body,
            credentials: 'include'
        })
    }
}