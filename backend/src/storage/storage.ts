import { Contributor, Post, PostMetadata } from "../../../interface/Model"
import { FilesystemKeyPairManager, KeyManager } from "../crypto/keypair-manager"
import { FileOperations } from "./filesystem-storage"
import { parse, stringify} from '@supercharge/json'
import * as path from 'path'

export default interface Storage {
    readyFlag: Promise<any>
    
    PostStorage(): PostReader
    DraftStorage(): PostCreator

    KeyManager(): KeyManager
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
    RemoveMedia(postId: string, filename: string): Promise<void>
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

    KeyManager(): KeyManager {
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
        return this.fsBackend.list(this.storageLocation)
        .then(ids => Promise.all(ids.map(
            postId => this.fsBackend.read(path.join(this.calculatePostPath(postId), 'post.json'))
            .then(postData => parse(postData.toString()) as PostMetadata)
            )
        ))
    }

    GetPost(postId: string): Promise<Post> {
        const postPath = this.calculatePostPath(postId)
        return Promise.all([
            this.fsBackend.read(path.join(postPath, 'post.json')),
            this.fsBackend.read(path.join(postPath, 'post.md')),
        ])
        .then(async values => {
            const postMeta = parse(values[0].toString()) as PostMetadata
            let post = {...postMeta, markdown: values[1].toString()}
            const existingVersion = post.version
            post =  updatePostIfRequired(post)

            // write back incremental updates
            if (post.version !== existingVersion) await this.Save(post)

            return post
        })
    }
    GetMediaRef(postId: string, filename: string): Promise<string> {
        throw new Error('Method not implemented.')
    }
    GetMedia(postId: string, filename: string): Promise<Buffer> {
        const postPath = this.calculatePostPath(postId)
        return this.fsBackend.read(path.join(postPath, filename))
    }

    calculatePostPath(postId: string): string {
        return path.join(this.storageLocation, postId)
    }

    DeletePost(postId: string): Promise<void> {
        // return this.fsBackend.delete('.data/')
        const postPath = this.calculatePostPath(postId) + '/'
        return this.fsBackend.delete(postPath)
    }
    Save(post: Post): Promise<void> {
        const postPath = this.calculatePostPath(post.id)
        return this.fsBackend.mkdir(postPath).then(async () => {
            await this.fsBackend.write(path.join(postPath, 'post.json'), stringify(extractMetadata(post)))
            await this.fsBackend.write(path.join(postPath, 'post.md'), post.markdown)
        })
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
    RemoveMedia(postId: string, filename: string): Promise<void> {
        if (filename.toLowerCase() === 'post.json' || filename.toLowerCase() === 'post.md') {
            return Promise.reject()
        }
        const postPath = this.calculatePostPath(postId)
        return this.fsBackend.read(path.join(postPath, 'post.json')).then(async postJson => {

            await this.fsBackend.delete(path.join(postPath, filename))
            const post = parse(postJson.toString()) as PostMetadata
            post.attachments = post.attachments.filter(attachment => attachment !== filename)

            await this.fsBackend.write(path.join(postPath, 'post.json'), stringify(post))
        })

    }
}

// Todo: possibly link in a VersionManager here to update the post?
export function updatePostIfRequired(post: Post) : Post {
    if (!post.version || post.version === '') post.version == '1.0.1'

    // TODO: VersionUpdater for post



    post.contributors = sortContributors(post.contributors)
    for(let i = 0; i < post.contributors.length; i++) {
        post.contributors[i] = updateContributorIfRequired(post.version, post.contributors[i])
    }
    return post
}

export function sortContributors (data: Array<Contributor>): Array<Contributor> {
    return data.sort((a: Contributor, b: Contributor) => b.id.localeCompare(a.id))
}

export function updateContributorIfRequired(version: string, c: Contributor): Contributor {
    // possible reencode of contributor id on version bump

    if (version === '1.0.0') {
        const decryptedId = c.id
    }

    return c
}



function extractMetadata(post: Post): PostMetadata {
    return {
        version: post.version,
        attachments: post.attachments,
        contributors: post.contributors,
        id: post.id,
        title: post.title,
        updatedTs: post.updatedTs,
    }
}
