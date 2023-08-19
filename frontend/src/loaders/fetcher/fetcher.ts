
export interface FetcherInitParams {
    method: string
    headers: Record<string, string>
    body?: string | File
}

export interface Fetcher {
    fetch(
        url: string,
        params: FetcherInitParams,
    ): Promise<Response>
}


