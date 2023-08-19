import { Identified, LoginOptions, Post, PostMetadata, PostUpdatableFields } from '../../../interface/Model'
import { AuthenticatedUser } from '../AuthContext'
import { stringify} from '@supercharge/json'
import { Fetcher } from './fetcher/fetcher'
import { FetcherStackType, fetcherStack } from './fetcher/fetcher-stack'


export interface LoaderApi {
  // auth required
  ListDrafts: () => Promise<Array<PostMetadata>>
  GetDraft: (id: string) => Promise<Post>
  CreateDraft: (title: string) => Promise<Post>
  SaveDraft: (id: string, post: PostUpdatableFields) => Promise<void>
  DeleteDraft: (id: string) => Promise<void>
  PublishDraft: (id: string) => Promise<Identified>
  AddAttachment: (id: String, file: File) => Promise<void>
  RemoveAttachment: (id: String, filename: string) => Promise<void>

  // auth not required:
  GetPost: (id: string) => Promise<Post>
  ListPosts: () => Promise<Array<PostMetadata>>

  // auth related (therefore auth not required)
  LoginProviders: () => Promise<LoginOptions>
  LoginCallback: (providerId: string, params: Record<string, string>) => Promise<string>
  
}

let wrapped: LoaderApi | null = null
export const WrapLoader = (testImpl: LoaderApi) => {
  wrapped = testImpl
}
export const Loader = (user: AuthenticatedUser | null): LoaderApi => {
  if (wrapped !== null) return wrapped
  return new SimpleLoader(user)
}

let apiBase = process.env.REACT_APP_API_ENDPOINT || ''
while (apiBase.endsWith('/')) {
  apiBase = apiBase.slice(0, -1)
}

const ContentTypes = {
  json: 'application/json',
  jwt: 'application/jwt',
}

class SimpleLoader implements LoaderApi {
  fetcher: Fetcher
  user: AuthenticatedUser | null
  constructor(user: AuthenticatedUser | null) {
    this.user = user
    this.fetcher = fetcherStack(user)  
  }

  requireAuth() {
    if (this.user === undefined || this.user === null) throw new Error('Authentication required')
  }

  ListDrafts: () => Promise<Array<PostMetadata>> = () => {
    this.requireAuth()
    return this.fetcher.fetch(
      `${apiBase}/draft/`, {
        method: 'GET',
        headers: {'Accept': ContentTypes.json}
      }
    ).then(res => res.json())
  }
  GetDraft: (id: string) => Promise<Post> = (id) => {
    this.requireAuth()
    return this.fetcher.fetch(`${apiBase}/draft/${id}`, {
      method: 'GET',
      headers: {'Accept': ContentTypes.json}
    })
    .then(res => res.json())
  }

  CreateDraft: (title: string) => Promise<Post> = (title) => {
    this.requireAuth()
    return this.fetcher.fetch(`${apiBase}/create-draft/`, {
      method: 'POST',
      headers: {'Accept': ContentTypes.json, 'Content-Type': ContentTypes.json},
      body: stringify({title}),
    })
    .then(res => res.json())
  }

  SaveDraft: (id: string, post: PostUpdatableFields) => Promise<void> = (id, post) => {
    this.requireAuth()
    return this.fetcher.fetch(`${apiBase}/draft/${id}`, {
        method: 'POST',
        headers: {'Accept': ContentTypes.json, 'Content-Type': ContentTypes.json},
        body: stringify(post),
      })
      .then(res => {})
  }

  DeleteDraft: (id: string) => Promise<void> = (id) => {
    this.requireAuth()
    return this.fetcher.fetch(`${apiBase}/draft/${id}`, {
      method: 'DELETE',
      headers: {},
    })
    .then(res => {})
  }

  PublishDraft: (id: string) => Promise<Identified> = (id) => {
    this.requireAuth()
    return this.fetcher.fetch(`${apiBase}/publish-draft/${id}`, {
      method: 'POST',
      headers: {},
    })
    .then(res => res.json())
  }

  GetPost: (id: string) => Promise<Post> = (id) => {
    return this.fetcher.fetch(`${apiBase}/post/${id}`, {
      method: 'GET',
      headers: {'Accept': ContentTypes.json}
    })
    .then(res => res.json())
  }

  ListPosts: () => Promise<Array<PostMetadata>> = () => {
    return this.fetcher.fetch(`${apiBase}/post/`, {
      method: 'GET',
      headers: {'Accept': ContentTypes.json}
    })
    .then(res => res.json())
  }

  LoginProviders: () => Promise<LoginOptions> = async () => {
    return this.fetcher.fetch(`${apiBase}/login/providers`, {
        method: 'GET',
        headers: {'Accept': ContentTypes.json},
      })
      .then(res => res.json())
  }

  LoginCallback: (providerId: string, params: Record<string, string>) => Promise<string> = (providerId, params) => {
    return this.fetcher.fetch(`${apiBase}/login/callback/${providerId}`, {
        method: 'POST',
        headers: {'Accept': ContentTypes.jwt, 'Content-Type': ContentTypes.json},
        body: stringify(params)
      })
      .then(res => res.text())
  }

  AddAttachment: (id: String, file: File) => Promise<void> = async (id, file) => {
    this.requireAuth()
    // broken with ponyfill ??
    const fetcher = fetcherStack(this.user, FetcherStackType.native)
    fetcher.fetch(`${apiBase}/image/draft/${id}`, {
          method: 'POST',
          body: file,
          headers: {
            'Content-Type': file.type,
            'Content-Length': `${file.size}`, // Headers need to be a string
            'Content-Disposition': `file; filename=${file.name}`,
          },
    })
  }

  RemoveAttachment: (id: String, filename: string) => Promise<void> = (id, filename) => {
    this.requireAuth()
    return this.fetcher.fetch(`${apiBase}/image/draft/${id}/${filename}`, {
      method: 'DELETE',
      headers: {},
    })
    .then(res => {})
  }
}