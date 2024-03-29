import { AuthenticatedUser } from "../../AuthContext"
import { Fetcher, FetcherInitParams } from "./fetcher"

// works around not being able to include cookies
export class AuthenticatedFetcher implements Fetcher {
    wrapped: Fetcher
    user: AuthenticatedUser | null
    constructor(wrapped: Fetcher, user: AuthenticatedUser | null) {
        this.wrapped = wrapped
        this.user = user
        this.fetch = this.fetch.bind(this)
        this.handleAuthError = this.handleAuthError.bind(this)
    }

    fetch(
        url: string,
        params: FetcherInitParams,
    ): Promise<Response> {
        // console.log(`fetcher user=${this.user !== null} for ${url}`)

        // auth ends up attached via cookies
        // if (this.user !== null) {
        //     params.headers['Authorization'] = 'Bearer ' + this.user.token()
        // }

        return this.wrapped.fetch(url, params).then(this.handleAuthError)
    }

    handleAuthError(res: Response): Response {
        if (res.status === 403 || res.status === 401) {
            if(this.user !== null) this.user.logout()
        }
        return res
    }
}