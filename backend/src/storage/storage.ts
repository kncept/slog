import { Post, PostMetadata } from "../../../interface/Model"
import { FilesystemKeyPairManager, KeyPairManager } from "../crypto/keypair-manager"
import { FileOperations } from "./filesystem-storage"
import { parse, stringify} from '@supercharge/json'
import * as path from 'path'

export default interface Storage {
    readyFlag: Promise<any>
    
    PostStorage(): PostReader
    DraftStorage(): PostCreator

    KeyPairManager(): KeyPairManager
}

export interface PostReader {
    ListPosts(): Promise<Array<PostMetadata>> // TODO: some pagination thingy
    GetPost(postId: string): Promise<Post>
    GetMediaRef(postId: string, filename: string): Promise<string>
    GetMedia(postId: string, filename: string): Promise<Buffer>
    DeletePost(postId: string): Promise<void>
}

export interface PostCreator extends PostReader{
    AddMedia(postId: string, filename: string, data: Buffer): Promise<void>
    Save(post: Post): Promise<void> // update only
    PublishDraft(draftId: string, postId: string): Promise<void>
}

export class FilesystemStorage implements Storage {
    fsBackend: FileOperations
    storageLocation: string
    readyFlag: Promise<any>
    constructor(storageLocation: string, fsBackend: FileOperations) {
        this.fsBackend = fsBackend
        this.storageLocation = storageLocation
        const draftStorageLocation = path.join(storageLocation, 'draft')
        const postStorageLocation = path.join(storageLocation, 'post')
        const keysStorageLocation = path.join(storageLocation, 'keys')
        this.readyFlag = Promise.all([
            this.fsBackend.mkdir(draftStorageLocation),
            this.fsBackend.mkdir(postStorageLocation),
            this.fsBackend.mkdir(keysStorageLocation),
        ])   
    }
    
    PostStorage(): PostReader {
        const postStorageLocation = path.join(this.storageLocation, 'post')
        return new FileSystemPostReader(postStorageLocation, this.fsBackend)
    }

    DraftStorage(): PostCreator {
        const draftStorageLocation = path.join(this.storageLocation, 'draft')
        const postStorageLocation = path.join(this.storageLocation, 'post')
        return new FileSystemPostCreator(draftStorageLocation, postStorageLocation, this.fsBackend)
    }

    KeyPairManager(): KeyPairManager {
        const keysStorageLocation = path.join(this.storageLocation, 'keys')
        return new FilesystemKeyPairManager(keysStorageLocation, this.fsBackend)
    }
}

class FileSystemPostReader implements PostReader {
    storageLocation: string
    fsBackend: FileOperations
    constructor(storageLocation: string, fsBackend: FileOperations) {
        this.storageLocation = storageLocation
        this.fsBackend = fsBackend
    }
    ListPosts(): Promise<PostMetadata[]> {
        return new Promise(async (resolve, reject) => {
            const posts: Array<PostMetadata> = []
            const postPromises = await this.fsBackend.list(this.storageLocation)
            .then(ids => {
                // PostMetadata
                return ids.map((postId, index) => {
                    const postPath = this.calculatePostPath(postId)
                    return this.fsBackend.read(path.join(postPath, 'post.json'))
                        .then(postData => posts[index] = parse(postData.toString()) as PostMetadata)
                })
            })
            Promise.all(postPromises).then(() => resolve(posts))
        })
    }

    GetPost(postId: string): Promise<Post> {
        const postPath = this.calculatePostPath(postId)
        return new Promise(async (resolve, reject) => {
            const markdown = await this.fsBackend.read(path.join(postPath, 'post.md'))
            const postMetaBuffer = await this.fsBackend.read(path.join(postPath, 'post.json'))
            const postMeta = parse(postMetaBuffer.toString()) as PostMetadata
            resolve({...postMeta, markdown: markdown.toString()})
        })
    }
    GetMediaRef(postId: string, filename: string): Promise<string> {
        throw new Error('Method not implemented.')
    }
    GetMedia(postId: string, filename: string): Promise<Buffer> {
        const postPath = this.calculatePostPath(postId)
        return this.fsBackend.read(path.join(postPath, filename))
        // const postPath = this.calculatePostPath(post.id)
    }

    calculatePostPath(postId: string): string {
        return path.join(this.storageLocation, postId)
    }

    DeletePost(postId: string): Promise<void> {
        // return this.fsBackend.delete('.data/')
        const postPath = this.calculatePostPath(postId) + '/'
        return this.fsBackend.delete(postPath)
    }
}

class FileSystemPostCreator extends FileSystemPostReader implements PostCreator {
    publishLocation: string
    constructor(storageLocation: string, publishLocation: string, fsBackend: FileOperations) {
        super(storageLocation, fsBackend)
        this.publishLocation = publishLocation
    }
    PublishDraft(draftId: string, postId: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const postCreator: FileSystemPostCreator = new FileSystemPostCreator(this.publishLocation, '', this.fsBackend)
            
            const draftPath = this.calculatePostPath(draftId)
            const postPath = postCreator.calculatePostPath(postId)

            const post = await this.GetPost(draftId)
            post.id = postId
            await postCreator.Save(post) // move to drafts
            await Promise.all(post.attachments.map(attachment => this.fsBackend.copy(
                path.join(draftPath, attachment),
                path.join(postPath, attachment),
            )))
            await this.DeletePost(draftId)
            resolve()
        })
    }
    AddMedia(postId: string, filename: string, data: Buffer): Promise<void> {
        if (filename.toLowerCase() === 'post.json' || filename.toLowerCase() === 'post.md') {
            return Promise.reject()
        }
        const postPath = this.calculatePostPath(postId)
        return this.fsBackend.read(path.join(postPath, 'post.json')).then(async postJson => {
            await this.fsBackend.write(path.join(postPath, filename), data)
            const post = parse(postJson.toString()) as PostMetadata
            post.attachments.push(filename)
            await this.fsBackend.write(path.join(postPath, 'post.json'), stringify(post))
        })
    }
    Save(post: Post): Promise<void> {
        const postPath = this.calculatePostPath(post.id)
        return this.fsBackend.mkdir(postPath).then(async () => {
            await this.fsBackend.write(path.join(postPath, 'post.json'), stringify(extractMetadata(post)))
            await this.fsBackend.write(path.join(postPath, 'post.md'), post.markdown)
        })
    }
}

function extractMetadata(post: Post): PostMetadata {
    return {
        attachments: post.attachments,
        contributors: post.contributors,
        id: post.id,
        title: post.title,
        updatedTs: post.updatedTs,
    }
}
