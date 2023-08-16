import fetchPonyfill from 'fetch-ponyfill'
import { Identified, LoginOptions, Post, PostMetadata, PostUpdatableFields } from '../../../interface/Model'
import { stringify} from '@supercharge/json'
import { AuthenticatedUser } from '../AuthContext'
import { LoaderApi } from './loaders'

const {fetch, Headers} = fetchPonyfill({})

let apiBase = process.env.REACT_APP_API_ENDPOINT || ''
while (apiBase.endsWith('/')) {
  apiBase = apiBase.slice(0, -1)
}

const ContentTypes = {
  json: 'application/json',
  jwt: 'application/jwt',
}

function authErrorHandler(user: AuthenticatedUser | null): (res: Response) => Response {
  return (res: Response) => {
    if (res.status === 403 && user !== null) {
      console.log('logging user out on 403')
      user.logout()
    }
    if (res.status === 401 || (res.status === 403 && user === null)) {
      console.log(`SHOULD redirect to a 'login required' screen`)
      if (user !== null) user.logout() // I don't _think_ this can happen
    }
    return res
  }
}
// super basic parallel request cache
export class CacheLoader implements LoaderApi{
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
    .then(authErrorHandler(user))
    .then(async res => {
      if (!res.ok) throw new Error('Response not okay: ' + url)
      return res
    })
    return value
  }

  ListDrafts: (user: AuthenticatedUser) => Promise<Array<PostMetadata>> = (user) => {
    if (user === undefined || user === null) throw new Error('Authentication required')
    return this.lookup(user, `${apiBase}/draft/`, {
      method: 'GET',
      headers: {'Accept': ContentTypes.json}
    })
    .then(authErrorHandler(user))
    .then(res => res.json())
  }

  GetDraft: (user: AuthenticatedUser, id: string) => Promise<Post> = (user, id) => {
    if (user === undefined || user === null) throw new Error('Authentication required')
      return this.lookup(user, `${apiBase}/draft/${id}`, {
        method: 'GET',
        headers: {'Accept': ContentTypes.json}
      })
      .then(authErrorHandler(user))
      .then(res => res.json())
  }

  CreateDraft: (user: AuthenticatedUser, title: string) => Promise<Post> = (user, title) => {
    if (user === undefined || user === null) throw new Error('Authentication required')
    return this.lookup(user, `${apiBase}/create-draft/`, {
      method: 'POST',
      headers: {'Accept': ContentTypes.json, 'Content-Type': ContentTypes.json},
      body: stringify({title}),
    })
    .then(authErrorHandler(user))
    .then(res => res.json())
  }

  SaveDraft: (user: AuthenticatedUser, id: string, post: PostUpdatableFields) => Promise<void> = (user, id, post) => {
    if (user === undefined || user === null) throw new Error('Authentication required')
      return this.lookup(user, `${apiBase}/draft/${id}`, {
        method: 'POST',
        headers: {'Accept': ContentTypes.json, 'Content-Type': ContentTypes.json},
        body: stringify(post),
      })
      .then(authErrorHandler(user))
      .then(res => {})
  }

  DeleteDraft: (user: AuthenticatedUser, id: string) => Promise<void> = (user, id) => {
    if (user === undefined || user === null) throw new Error('Authentication required')
    return this.lookup(user, `${apiBase}/draft/${id}`, {
      method: 'DELETE',
    })
    .then(authErrorHandler(user))
    .then(res => {})
  }

  PublishDraft: (user: AuthenticatedUser, id: string) => Promise<Identified> = (user, id) => {
    if (user === undefined || user === null) throw new Error('Authentication required')
    return this.lookup(user, `${apiBase}/publish-draft/${id}`, {
      method: 'POST',
    })
    .then(authErrorHandler(user))
    .then(res => res.json())
  }

  GetPost: (id: string) => Promise<Post> = (id) => {
    return this.lookup(null, `${apiBase}/post/${id}`, {
      method: 'GET',
      headers: {'Accept': ContentTypes.json}
    })
    .then(res => res.json())
  }


  ListPosts: () => Promise<Array<PostMetadata>> = () => {
    return this.lookup(null, `${apiBase}/post/`, {
      method: 'GET',
      headers: {'Accept': ContentTypes.json}
    })
    .then(res => res.json())
  }

  LoginProviders: () => Promise<LoginOptions> = async () => {
      return this.lookup(null, `${apiBase}/login/providers`, {
        method: 'GET',
        headers: {'Accept': ContentTypes.json},
      })
      .then(res => res.json())
  }
  LoginCallback: (providerId: string, params: Record<string, string>) => Promise<string> = async (providerId, params) => {
      return this.lookup(null, `${apiBase}/login/callback/${providerId}`, {
        method: 'POST',
        headers: {'Accept': ContentTypes.jwt, 'Content-Type': ContentTypes.json},
        body: stringify(params)
      })
      .then(res => res.text())
  }
}