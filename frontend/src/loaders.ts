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
  async lookup<T>(key: string, provide: () => Promise<T>): Promise<T> {
    let value = this.activeRequests[key]
    if (value !== null && value !== undefined) {
      return value
    }
    value = provide()
    .then(val => {
      delete this.activeRequests[key]
      return val
    })
    this.activeRequests[key] = value
    return value
  }
}
const cache = new Cache()
function headers(user: AuthenticatedUser, contentType: string | undefined, acceptType: string | undefined): Headers {
  const h: Record<string, string> = {}
  h['Authorization'] = 'Bearer: ' + user.token()
  if (contentType) h['Content-Type'] = contentType
  if (acceptType) h['Accept'] = acceptType
  return new Headers(h)
}

export const GetPost: (id: string) => Promise<Post> = (id) => {
    return cache.lookup('post:' + id, async (): Promise<Post> => {
      const res = await fetch(`${apiBase}/post${id}`, {
        method: 'GET',
        headers: new Headers({'Accept': ContentTypes.json})
      })
      return await res.json() as Post
    })
}

export const ListDrafts: (user: AuthenticatedUser) => Promise<Array<PostMetadata>> = (user) => {
  if (user === undefined || user === null) throw new Error('Authentication required')
  return cache.lookup('drafts', async (): Promise<Array<Post>> => {
    return fetch(`${apiBase}/draft/`, {
      method: 'GET',
      headers: headers(user, undefined, ContentTypes.json),
    })
    .then(async res => await res.json() as Array<Post>)
  })
}


export const GetDraft: (user: AuthenticatedUser, id: string) => Promise<Post> = (user, id) => {
  if (user === undefined || user === null) throw new Error('Authentication required')
  return cache.lookup('draft:' + id, async (): Promise<Post> => {
    return fetch(`${apiBase}/draft/${id}`, {
      method: 'GET',
      headers: headers(user, undefined, ContentTypes.json),
    })
    .then(async res => await res.json() as Post)
  })
}

export const CreateDraft: (user: AuthenticatedUser, title: string) => Promise<Post> = (user, title) => {
  if (user === undefined || user === null) throw new Error('Authentication required')
  return cache.lookup('create-draft', async (): Promise<Post> => {
    return fetch(`${apiBase}/create-draft/`, {
      method: 'POST',
      headers: headers(user, ContentTypes.json, ContentTypes.json),
      body: stringify({title}),
    })
    .then(async res => await res.json() as Post)
  })
}

export const SaveDraft: (user: AuthenticatedUser, post: Post) => Promise<Post> = (user, post) => {
  if (user === undefined || user === null) throw new Error('Authentication required')
  return cache.lookup('draft:' + post.id, async (): Promise<Post> => {
    return fetch(`${apiBase}/draft/${post.id}`, {
      method: 'POST',
      headers: headers(user, ContentTypes.json, ContentTypes.json),
      body: stringify(post),
    })
    .then(async res => await res.json() as Post)
  })
}

export const LoginProviders: () => Promise<Array<LoginProvider>> = async () => {
  return cache.lookup('loginproviders', async (): Promise<Array<LoginProvider>> => {
    return fetch(`${apiBase}/login/providers`, {
      method: 'GET',
      headers: new Headers({
        'Accept': 'application/json'
      })
    })
    .then(async res => await res.json() as Array<LoginProvider>)
  })
}
export const LoginCallback: (authContextproviderId: string, params: Record<string, string>) => Promise<string> = async (providerId, params) => {
  return cache.lookup('logincallback', async (): Promise<string> => {
    return fetch(`${apiBase}/login/callback/${providerId}`, {
      method: 'POST',
      headers: new Headers({
        'Accept': 'application/jwt',
        'Content-Type': 'application/json',
      }),
      body: stringify(params)
    })
    .then(async res => await res.text())

  })
}