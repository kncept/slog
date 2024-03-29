import { Identified, LoginOptions, Post, PostMetadata, PostUpdatableFields } from '../../../interface/Model'
import { AuthenticatedUser } from '../AuthContext'
import { stringify} from '@supercharge/json'
import { Fetcher } from './fetcher/fetcher'
import { fetcherStack } from './fetcher/fetcher-stack'


export interface LoaderApi {
  // auth required
  ListDrafts: () => Promise<Array<PostMetadata>>
  GetDraft: (id: string) => Promise<Post>
  CreateDraft: (title: string) => Promise<Post>
  SaveDraft: (id: string, post: PostUpdatableFields) => Promise<void>
  RemoveContributor: (id: string, contributorId: string) => Promise<void>
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
  LogoutCallback: () => Promise<void>
  
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

  ListDrafts: () => Promise<Array<PostMetadata>> = () => {
    return this.fetcher.fetch(
      `${apiBase}/draft/`, {
        method: 'GET',
        headers: {'Accept': ContentTypes.json}
      }
    ).then(res => res.json())
  }
  GetDraft: (id: string) => Promise<Post> = (id) => {
    return this.fetcher.fetch(`${apiBase}/draft/${id}`, {
      method: 'GET',
      headers: {'Accept': ContentTypes.json}
    })
    .then(res => res.json())
  }

  CreateDraft: (title: string) => Promise<Post> = (title) => {
    return this.fetcher.fetch(`${apiBase}/create-draft/`, {
      method: 'POST',
      headers: {'Accept': ContentTypes.json, 'Content-Type': ContentTypes.json},
      body: stringify({title}),
    })
    .then(res => res.json())
  }

  SaveDraft: (id: string, post: PostUpdatableFields) => Promise<void> = (id, post) => {
    return this.fetcher.fetch(`${apiBase}/draft/${id}`, {
        method: 'POST',
        headers: {'Accept': ContentTypes.json, 'Content-Type': ContentTypes.json},
        body: stringify(post),
      })
      .then(() => {})
  }

  RemoveContributor: (id: string, contributorId: string) => Promise<void> = (id, contributorId) => {
    return this.fetcher.fetch(`${apiBase}/draft/${id}/contributors/${contributorId}`, {
      method: 'DELETE',
      headers: {'Accept': ContentTypes.json, 'Content-Type': ContentTypes.json},
    })
    .then(() => {})
  }

  DeleteDraft: (id: string) => Promise<void> = (id) => {
    return this.fetcher.fetch(`${apiBase}/draft/${id}`, {
      method: 'DELETE',
      headers: {},
    })
    .then(() => {})
  }

  PublishDraft: (id: string) => Promise<Identified> = (id) => {
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

  LogoutCallback: () => Promise<void> = async () => {
    return this.fetcher.fetch(`${apiBase}/logout`, {
      method: 'GET',
      headers: { },
    })
    .then(() => {})
  }

  AddAttachment: (id: String, file: File) => Promise<void> = async (id, file) => {
    this.fetcher.fetch(`${apiBase}/image/draft/${id}`, {
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
    return this.fetcher.fetch(`${apiBase}/image/draft/${id}/${filename}`, {
      method: 'DELETE',
      headers: {},
    })
    .then(() => {})
  }
}