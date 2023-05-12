import { Post } from "../../../interface/Model";

export default interface Storage {
    ListPosts(): Promise<Array<Post>> // TODO: some pagination thingy
    GetPost(id: string): Promise<Post | undefined>

    ListDrafts(): Promise<Array<Post>>
    GetDraft(id: string): Promise<Post | undefined>
    SaveDraft(id: string, draft: Post): Promise<void>
}