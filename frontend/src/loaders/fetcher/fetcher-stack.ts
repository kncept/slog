import { AuthenticatedUser } from "../../AuthContext"
import { AuthenticatedFetcher } from "./authenticated-fetcher"
import CachedFetcher from "./cached-fetcher"
import { Fetcher } from "./fetcher"
import IsomorphicFetcher from "./isomorphic-fetcher"
import NativeFetcher from "./native-fetcher"
import PoynfilledFetcher from "./ponyfilled-fetcher"

export enum FetcherStackType {
    native = 'native',
    ponyfill = 'ponyfill',
    iosmorphic = 'isomorphic',
}

export function fetcherStack(user: AuthenticatedUser | null, type?: FetcherStackType) : Fetcher {
    let wrapped = fetcherOfType(type || FetcherStackType.ponyfill)
    wrapped = new CachedFetcher(wrapped)
    wrapped = new AuthenticatedFetcher(
        wrapped,
        user)
    return wrapped
}

function fetcherOfType(type: FetcherStackType) {
    switch(type) {
        case FetcherStackType.native: return new NativeFetcher()
        case FetcherStackType.ponyfill: return new PoynfilledFetcher()
        case FetcherStackType.iosmorphic: return new IsomorphicFetcher()
    }
    throw Error(`Unknown fetcher type: ${type}`)
}