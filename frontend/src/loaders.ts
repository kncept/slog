import fetchPonyfill from 'fetch-ponyfill'
import { LoginProvider, Post, PostMetadata } from '../../interface/Model'
import { stringify} from '@supercharge/json'
import { AuthenticatedUser } from './AuthContext'

const {fetch, Headers} = fetchPonyfill({})

let apiBase = process.env.REACT_APP_API_ENDPOINT || ""
while (apiBase.endsWith("/")) {
  apiBase = apiBase.slice(0, -1)
}

const ContentTypes = {
  json: 'application/json'
}

// super basic parallel request cache
class Cache {
  activeRequests: Record<string, any> = {}
  async lookup(input: string, init: RequestInit): Promise<Response> {
    let value = this.activeRequests[input]
    if (value !== null && value !== undefined) {
      return value
    }
    value = fetch(input, init)
    .then(response => {
      delete this.activeRequests[input]
      return response
    })
    return value
  }
}
const cache = new Cache()
function headers(user: AuthenticatedUser, contentType: string | undefined, acceptType: string | undefined): Headers {
  const h: Record<string, string> = {}
  h['Authorization'] = 'Bearer ' + user.token()
  if (contentType) h['Content-Type'] = contentType
  if (acceptType) h['Accept'] = acceptType
  return new Headers(h)
}

export const GetPost: (id: string) => Promise<Post> = (id) => {
    return cache.lookup(`${apiBase}/post${id}`, {
      method: 'GET',
      headers: new Headers({'Accept': ContentTypes.json})
    })
    .then(res => res.json())
}

export const ListDrafts: (user: AuthenticatedUser) => Promise<Array<PostMetadata>> = (user) => {
  if (user === undefined || user === null) throw new Error('Authentication required')
  return cache.lookup(`${apiBase}/draft/`, {
    method: 'GET',
    headers: headers(user, undefined, ContentTypes.json),
  })
  .then(res => res.json())
}


export const GetDraft: (user: AuthenticatedUser, id: string) => Promise<Post> = (user, id) => {
  if (user === undefined || user === null) throw new Error('Authentication required')
    return cache.lookup(`${apiBase}/draft/${id}`, {
      method: 'GET',
      headers: headers(user, undefined, ContentTypes.json),
    })
    .then(res => res.json())
}

export const CreateDraft: (user: AuthenticatedUser, title: string) => Promise<Post> = (user, title) => {
  if (user === undefined || user === null) throw new Error('Authentication required')
  return cache.lookup(`${apiBase}/create-draft/`, {
    method: 'POST',
    headers: headers(user, ContentTypes.json, ContentTypes.json),
    body: stringify({title}),
  })
  .then(res => res.json())
}

export const SaveDraft: (user: AuthenticatedUser, post: Post) => Promise<Post> = (user, post) => {
  if (user === undefined || user === null) throw new Error('Authentication required')
    return cache.lookup(`${apiBase}/draft`, {
      method: 'POST',
      headers: headers(user, ContentTypes.json, ContentTypes.json),
      body: stringify(post),
    })
    .then(res => res.json())
}

export const LoginProviders: () => Promise<Array<LoginProvider>> = async () => {
    return cache.lookup(`${apiBase}/login/providers`, {
      method: 'GET',
      headers: new Headers({
        'Accept': 'application/json'
      })
    })
    .then(res => res.json())
}
export const LoginCallback: (providerId: string, params: Record<string, string>) => Promise<string> = async (providerId, params) => {
    return cache.lookup(`${apiBase}/login/callback/${providerId}`, {
      method: 'POST',
      headers: new Headers({
        'Accept': 'application/jwt',
        'Content-Type': 'application/json',
      }),
      body: stringify(params)
    })
    .then(res => res.text())
}