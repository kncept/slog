import fetchPonyfill from 'fetch-ponyfill'
import { Identified, LoginOptions, Post, PostMetadata } from '../../interface/Model'
import { stringify} from '@supercharge/json'
import { AuthenticatedUser } from './AuthContext'

const {fetch, Headers} = fetchPonyfill({})

let apiBase = process.env.REACT_APP_API_ENDPOINT || ''
while (apiBase.endsWith('/')) {
  apiBase = apiBase.slice(0, -1)
}

const ContentTypes = {
  json: 'application/json',
  jwt: 'application/jwt',
}

// super basic parallel request cache
class Cache {
  activeRequests: Record<string, any> = {}
  async lookup(user: AuthenticatedUser | null, url: string, init: {
    method: string,
    headers?: Record<string, string> | undefined
    body?: string | undefined
  }): Promise<Response> {

    let key = user == null ? 'n' : user.admin()? 't' : 'f'
    key = key + url

    const headers: Record<string, string> = init.headers || {}
    if (user !== null) {
      headers['Authorization'] = 'Bearer ' + user.token()
    }

    let value = this.activeRequests[key]
    if (value !== null && value !== undefined) {
      return value
    }
    value = fetch(url, {
      method: init.method,
      headers: new Headers(headers),
      body: init.body,
    })
    .then(res => {
      delete this.activeRequests[key]
      return res
    })
    .then(res => {
      if (res.status === 403 && user !== null) {
        console.log('logging user out on 403')
        user.logout()
      }
      if (res.status === 401 || (res.status === 403 && user === null)) {
        console.log(`SHOULD redirect to a 'login required' screen`)
      }
      return res
    })
    return value
  }
}

const cache = new Cache()

export const ListDrafts: (user: AuthenticatedUser) => Promise<Array<PostMetadata>> = (user) => {
  if (user === undefined || user === null) throw new Error('Authentication required')
  return cache.lookup(user, `${apiBase}/draft/`, {
    method: 'GET',
    headers: {'Accept': ContentTypes.json}
  })
  .then(res => res.json())
}

export const GetDraft: (user: AuthenticatedUser, id: string) => Promise<Post> = (user, id) => {
  if (user === undefined || user === null) throw new Error('Authentication required')
    return cache.lookup(user, `${apiBase}/draft/${id}`, {
      method: 'GET',
      headers: {'Accept': ContentTypes.json}
    })
    .then(res => res.json())
}

export const CreateDraft: (user: AuthenticatedUser, title: string) => Promise<Post> = (user, title) => {
  if (user === undefined || user === null) throw new Error('Authentication required')
  return cache.lookup(user, `${apiBase}/create-draft/`, {
    method: 'POST',
    headers: {'Accept': ContentTypes.json, 'Content-Type': ContentTypes.json},
    body: stringify({title}),
  })
  .then(res => res.json())
}

export const SaveDraft: (user: AuthenticatedUser, post: Post) => Promise<void> = (user, post) => {
  if (user === undefined || user === null) throw new Error('Authentication required')
    return cache.lookup(user, `${apiBase}/draft`, {
      method: 'POST',
      headers: {'Accept': ContentTypes.json, 'Content-Type': ContentTypes.json},
      body: stringify(post),
    })
    .then(res => {})
}

export const DeleteDraft: (user: AuthenticatedUser, id: string) => Promise<void> = (user, id) => {
  if (user === undefined || user === null) throw new Error('Authentication required')
  return cache.lookup(user, `${apiBase}/draft/${id}`, {
    method: 'DELETE',
  })
  .then(res => {})
}

export const PublishDraft: (user: AuthenticatedUser, id: string) => Promise<Identified> = (user, id) => {
  if (user === undefined || user === null) throw new Error('Authentication required')
  return cache.lookup(user, `${apiBase}/publish-draft/${id}`, {
    method: 'POST',
  })
  .then(res => res.json())
}

export const GetPost: (id: string) => Promise<Post> = (id) => {
  return cache.lookup(null, `${apiBase}/post/${id}`, {
    method: 'GET',
    headers: {'Accept': ContentTypes.json}
  })
  .then(res => res.json())
}


export const ListPosts: () => Promise<Array<PostMetadata>> = () => {
  return cache.lookup(null, `${apiBase}/post/`, {
    method: 'GET',
    headers: {'Accept': ContentTypes.json}
  })
  .then(res => res.json())
}

export const LoginProviders: () => Promise<LoginOptions> = async () => {
    return cache.lookup(null, `${apiBase}/login/providers`, {
      method: 'GET',
      headers: {'Accept': ContentTypes.json},
    })
    .then(res => res.json())
}
export const LoginCallback: (providerId: string, params: Record<string, string>) => Promise<string> = async (providerId, params) => {
    return cache.lookup(null, `${apiBase}/login/callback/${providerId}`, {
      method: 'POST',
      headers: {'Accept': ContentTypes.jwt, 'Content-Type': ContentTypes.json},
      body: stringify(params)
    })
    .then(res => res.text())
}