import * as path from 'path'
import { Post } from "../../../interface/Model"
import Storage from "./storage"
import * as fs from "fs"


interface FileOperations {
    mkdir(dirpath: string): Promise<void>
    list(dir: string): Promise<Array<string>>
    write(file: string, data: string | NodeJS.ArrayBufferView): Promise<void>
}
class LocalFsOperations implements FileOperations {

    mkdir(dirpath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.mkdir(dirpath, {recursive: true}, (err, _) => {
                if (err !== null) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })
    }

    list(dir: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            fs.readdir(dir, (err, files) => {
                if (err !== null) {
                    reject(err)
                }
                resolve(files)
            })
        })
    }

    write(file: string, data: string | NodeJS.ArrayBufferView): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.writeFile(file, data, err => {
                if (err != null) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })
    }
}

export default class FilesystemStorage implements Storage {
    fsBackend: FileOperations
    draftStorageLocation: string
    postStorageLocation: string
    constructor(storageLocation: string) {
        this.fsBackend = new LocalFsOperations()        

        this.draftStorageLocation = path.join(storageLocation, 'draft')
        this.fsBackend.mkdir(this.draftStorageLocation)
        this.postStorageLocation = path.join(storageLocation, 'post')
        this.fsBackend.mkdir(this.postStorageLocation)
    }
    async ListPosts(): Promise<Post[]> {
        return this.fsBackend.list(this.postStorageLocation)
        .then(postIds => postIds.map(id => {
            const fsContents = fs.readFileSync(path.join(this.postStorageLocation, id, 'post.json'))
            return JSON.parse(fsContents.toString()) as Post
        }))
    }
    async GetPost(id: string): Promise<Post | undefined> {
        return undefined
    }

    async ListDrafts(): Promise<Post[]> {
        return this.fsBackend.list(this.draftStorageLocation)
        .then(postIds => postIds.map(id => {
            const fsContents = fs.readFileSync(path.join(this.postStorageLocation, id, 'draft.json'))
            return JSON.parse(fsContents.toString()) as Post
        }))
    }
    async GetDraft(id: string): Promise<Post | undefined> {
        return undefined
    }
    async SaveDraft(id: string, draft: Post): Promise<void> {
        const draftPath = path.join(this.draftStorageLocation, 'id')
        return this.fsBackend.mkdir(draftPath).then(() => {
            this.fsBackend.write(path.join(draftPath, 'draft.json'), JSON.stringify(draft))
        })
    }

}
