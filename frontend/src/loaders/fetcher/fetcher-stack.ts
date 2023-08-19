import { AuthenticatedUser } from "../../AuthContext"
import { AuthenticatedFetcher } from "./authenticated-fetcher"
import CachedFetcher from "./cached-fetcher"
import { Fetcher } from "./fetcher"
import PoynfilledFetcher from "./ponyfilled-fetcher"

export function fetcherStack(user: AuthenticatedUser | null) : Fetcher {
    let wrapped = new PoynfilledFetcher()
    wrapped = new CachedFetcher(wrapped)
    wrapped = new AuthenticatedFetcher(
        wrapped,
        user)
    return wrapped
}
