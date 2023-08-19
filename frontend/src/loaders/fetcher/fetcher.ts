
export interface FetcherInitParams {
    method?: string
    body?: string | File
    headers?: Record<string, string>
}

export interface Fetcher {
    fetch(
        url: string,
        params?: FetcherInitParams,
    ): Promise<Response>
}


