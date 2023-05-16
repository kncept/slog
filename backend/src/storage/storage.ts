import { Post, PostMetadata } from "../../../interface/Model";

export default interface Storage {
    ListPosts(): Promise<Array<Post>> // TODO: some pagination thingy
    GetPost(id: string): Promise<Post | undefined>

    ListDrafts(): Promise<Array<Post>>
    GetDraft(id: string): Promise<Post | undefined>
    CreateDraft(draft: Post): Promise<void>
    UpdateDraft(draft: Post): Promise<void>

    AddDraftMedia(id: string, filename: string, data: Buffer): Promise<void>
    
}

// export interface PostReader {
//     ListPosts(): Promise<Array<PostMetadata>> // TODO: some pagination thingy
//     GetPost(id: string): Promise<Post>

//     CreateDraft(draft: Post): Promise<void>
// }
