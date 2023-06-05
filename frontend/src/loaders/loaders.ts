import { createContext } from 'react'
import { Identified, LoginOptions, Post, PostMetadata, PostUpdatableFields } from '../../../interface/Model'
import { AuthenticatedUser } from '../AuthContext'
import { CacheLoader } from './cachedLoaders'


export interface LoaderApi {
  ListDrafts: (user: AuthenticatedUser) => Promise<Array<PostMetadata>>
  GetDraft: (user: AuthenticatedUser, id: string) => Promise<Post>
  CreateDraft: (user: AuthenticatedUser, title: string) => Promise<Post>
  SaveDraft: (user: AuthenticatedUser, postId: string, post: PostUpdatableFields) => Promise<void>
  DeleteDraft: (user: AuthenticatedUser, id: string) => Promise<void>
  PublishDraft: (user: AuthenticatedUser, id: string) => Promise<Identified>
  GetPost: (id: string) => Promise<Post>
  ListPosts: () => Promise<Array<PostMetadata>>
  LoginProviders: () => Promise<LoginOptions>
  LoginCallback: (providerId: string, params: Record<string, string>) => Promise<string>
}


// wrappedLoader
class WrappedLoader implements LoaderApi {
  wrapped: LoaderApi
  constructor() {
    this.wrapped = new CacheLoader()
  }
  Wrap(wrapped: LoaderApi) {
    this.wrapped = wrapped
  }
  ListDrafts: (user: AuthenticatedUser) => Promise<PostMetadata[]> = (user) => this.wrapped.ListDrafts(user)
  GetDraft: (user: AuthenticatedUser, id: string) => Promise<Post> = (user, id) => this.wrapped.GetDraft(user, id)
  CreateDraft: (user: AuthenticatedUser, title: string) => Promise<Post> = (user, title) => this.wrapped.CreateDraft(user, title)
  SaveDraft: (user: AuthenticatedUser, postId: string, post: PostUpdatableFields) => Promise<void> = (user, id) => this.wrapped.DeleteDraft(user, id)
  DeleteDraft: (user: AuthenticatedUser, id: string) => Promise<void> = (user, id) => this.wrapped.DeleteDraft(user, id)
  PublishDraft: (user: AuthenticatedUser, id: string) => Promise<Identified> = (user, id) => this.wrapped.PublishDraft(user, id)
  GetPost: (id: string) => Promise<Post> = (id) => this.wrapped.GetPost(id)
  ListPosts: () => Promise<PostMetadata[]> = () => this.wrapped.ListPosts()
  LoginProviders: () => Promise<LoginOptions> = () => this.wrapped.LoginProviders()
  LoginCallback: (providerId: string, params: Record<string, string>) => Promise<string> = (providerId, params) => this.wrapped.LoginCallback(providerId, params)
  
}

const Loader = new WrappedLoader
export default Loader