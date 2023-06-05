import { Identified, LoginOptions, Post, PostMetadata, PostUpdatableFields } from '../../../interface/Model'
import { AuthenticatedUser } from '../AuthContext'
import { LoaderApi } from './loaders'

export class StubLoader implements LoaderApi{
 
  ListDrafts: (user: AuthenticatedUser) => Promise<Array<PostMetadata>> = (user) => {
    if (user === undefined || user === null) throw new Error('Authentication required')
    return Promise.resolve([])
  }

  GetDraft: (user: AuthenticatedUser, id: string) => Promise<Post> = (user, id) => {
    if (user === undefined || user === null) throw new Error('Authentication required')
      return Promise.resolve({} as Post)
  }

  CreateDraft: (user: AuthenticatedUser, title: string) => Promise<Post> = (user, title) => {
    if (user === undefined || user === null) throw new Error('Authentication required')
    return Promise.resolve({} as Post)
  }

  SaveDraft: (user: AuthenticatedUser, postId: string, post: PostUpdatableFields) => Promise<void> = (user, postId, post) => {
    if (user === undefined || user === null) throw new Error('Authentication required')
    return Promise.resolve()
  }

  DeleteDraft: (user: AuthenticatedUser, id: string) => Promise<void> = (user, id) => {
    if (user === undefined || user === null) throw new Error('Authentication required')
    return Promise.resolve()
  }

  PublishDraft: (user: AuthenticatedUser, id: string) => Promise<Identified> = (user, id) => {
    if (user === undefined || user === null) throw new Error('Authentication required')
    return Promise.resolve({} as Identified)
  }

  GetPost: (id: string) => Promise<Post> = (id) => {
    return Promise.resolve({} as Post)
  }


  ListPosts: () => Promise<Array<PostMetadata>> = () => {
    return Promise.resolve([])
  }

  LoginProviders: () => Promise<LoginOptions> = async () => {
    return Promise.resolve({
      providers: [],
      verificationKeys: []
    } as LoginOptions)
  }
  LoginCallback: (providerId: string, params: Record<string, string>) => Promise<string> = async (providerId, params) => {
      return Promise.resolve('')
  }
}