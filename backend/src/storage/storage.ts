import { Post, PostMetadata } from "../../../interface/Model";

export default interface Storage {
    // ListPosts(): Promise<Array<PostMetadata>> // TODO: some pagination thingy
    // GetPost(id: string): Promise<Post | undefined>

    // ListDrafts(): Promise<Array<PostMetadata>>
    // GetDraft(id: string): Promise<Post | undefined>
    // CreateDraft(draft: Post): Promise<void>
    // UpdateDraft(draft: Post): Promise<void>

    // AddDraftMedia(id: string, filename: string, data: Buffer): Promise<void>

    PostStorage(): PostReader
    DraftStorage(): PostCreator

}

export interface PostReader {
    ListPosts(): Promise<Array<PostMetadata>> // TODO: some pagination thingy
    GetPost(postId: string): Promise<Post>
    GetMediaRef(postId: string, filename: string): Promise<string>
    GetMedia(postId: string, filename: string): Promise<Buffer>
}

export interface PostCreator extends PostReader{
    AddMedia(postId: string, filename: string, data: Buffer): Promise<void>
    Save(post: Post): Promise<void> // update only
    PublishDraft(postId: string): Promise<void>
}
