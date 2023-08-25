import { Identified, LoginOptions, Post, PostMetadata, PostUpdatableFields } from '../../../interface/Model'
import { AuthenticatedUser } from '../AuthContext'
import { LoaderApi } from './loaders'

export class StubLoader implements LoaderApi {
 
  ListDrafts: () => Promise<Array<PostMetadata>> = () => {
    return Promise.resolve([])
  }
  GetDraft: (id: string) => Promise<Post> = () => {
      return Promise.resolve({} as Post)
  }
  CreateDraft: (title: string) => Promise<Post> = () => {
    return Promise.resolve({} as Post)
  }
  SaveDraft: (postId: string, post: PostUpdatableFields) => Promise<void> = () => {
    return Promise.resolve()
  }
  DeleteDraft: (id: string) => Promise<void> = () => {
    return Promise.resolve()
  }
  PublishDraft: (id: string) => Promise<Identified> = () => {
    return Promise.resolve({} as Identified)
  }
  GetPost: (id: string) => Promise<Post> = () => {
    return Promise.resolve({} as Post)
  }
  ListPosts: () => Promise<Array<PostMetadata>> = () => {
    return Promise.resolve([])
  }
  AddAttachment: (id: String, file: File) => Promise<void> = () => Promise.resolve()
  RemoveAttachment: (id: String, filename: string) => Promise<void> = () => Promise.resolve()

  LoginProviders: () => Promise<LoginOptions> = async () => {
    return Promise.resolve({
      providers: [],
      verificationKeys: []
    } as LoginOptions)
  }
  LoginCallback: (providerId: string, params: Record<string, string>) => Promise<string> = () => {
      return Promise.resolve('')
  }
  LogoutCallback: () => Promise<void> = () => Promise.resolve()
}