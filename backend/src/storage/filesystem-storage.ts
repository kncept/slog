import * as path from 'path'
import { Post } from "../../../interface/Model"
import Storage from "./storage"
import * as fs from "fs"
import { parse, stringify} from '@supercharge/json'


interface FileOperations {
    mkdir(dirpath: string): Promise<void>
    list(dir: string): Promise<Array<string>>
    write(file: string, data: string | NodeJS.ArrayBufferView): Promise<void>
    read(file: string): Promise<string>
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

    read(file: string): Promise<string> {
        return new Promise((resolve, reject) => {
            fs.readFile(file, (err, data) => {
                if (err != null) {
                    reject(err)
                } else {
                    resolve(data.toString())
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
        return this.doList(this.postStorageLocation)
    }
    async ListDrafts(): Promise<Post[]> {
        return this.doList(this.draftStorageLocation)
    }
    async doList(storageLocation: string): Promise<Post[]> {
        return new Promise(async (resolve, reject) => {
            const posts: Array<Post> = []
            const postPromises = await this.fsBackend.list(storageLocation)
            .then(ids => {
                return ids.map((id, index) =>
                    this.doGet(storageLocation, id)
                    .then(data => posts[index] = data as Post)
                )
            })
            Promise.all(postPromises).then(() => resolve(posts))
        })

    }

    async GetPost(id: string): Promise<Post | undefined> {
        return this.doGet(this.postStorageLocation, id)
    }
    async GetDraft(id: string): Promise<Post | undefined> {
        return this.doGet(this.draftStorageLocation, id)
    }
    async doGet(storageLocation: string, id: string): Promise<Post | undefined> {
        return this.fsBackend.read(path.join(storageLocation, id, 'post.json'))
                .then(data => parse(data) as Post)
    }


    async SaveDraft(id: string, draft: Post): Promise<void> {
        const draftPath = path.join(this.draftStorageLocation, id)
        return this.fsBackend.mkdir(draftPath).then(() => {
            this.fsBackend.write(path.join(draftPath, 'post.json'), stringify(draft))
        })
    }

}
