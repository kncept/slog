import { AuthenticatedUser } from "../../AuthContext"
import { AuthenticatedFetcher } from "./authenticated-fetcher"
import CachedFetcher from "./cached-fetcher"
import { Fetcher } from "./fetcher"
import IsomorphicFetcher from "./isomorphic-fetcher"
import PoynfilledFetcher from "./ponyfilled-fetcher"

export function fetcherStack(user: AuthenticatedUser | null) : Fetcher {
    let wrapped = new PoynfilledFetcher()
    // let wrapped = new IsomorphicFetcher()
    wrapped = new CachedFetcher(wrapped)
    wrapped = new AuthenticatedFetcher(
        wrapped,
        user)
    return wrapped
}
