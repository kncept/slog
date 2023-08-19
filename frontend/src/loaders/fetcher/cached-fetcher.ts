import { Fetcher, FetcherInitParams } from './fetcher'

// only one of these
const cachedActiveFetcherRequest: Record<string, any> = {}

export default class CachedFetcher implements Fetcher {
    wrapped: Fetcher
    constructor(wrapped: Fetcher) {
        this.wrapped = wrapped
    }
    fetch(
        url: string,
        params: FetcherInitParams,
    ): Promise<Response> {
        // N.B. header count to catch presence/absence of auth header
        // So make sure we cache _after_ handling auth headers
        const headersSize = Object.keys(params.headers).length
        const method = params.method
        const key = `${headersSize}${method}${url}`

        let value = cachedActiveFetcherRequest[key]
        if (value !== null && value !== undefined) {
          return value
        }

        value = this.wrapped
            .fetch(url, params)
            .then(res => {
                delete cachedActiveFetcherRequest[key]
                return res
            }).catch(e => {
                delete cachedActiveFetcherRequest[key]
                throw e
            })

        return value
    }
}