import * as fs from 'fs'
import { S3Client, ListObjectsV2Command, PutObjectCommand, PutObjectCommandInput, ListObjectsV2CommandInput, GetObjectCommand, GetObjectCommandInput, DeleteObjectCommand, DeleteObjectCommandInput, CopyObjectCommand, CopyObjectCommandInput } from '@aws-sdk/client-s3'


export interface FileOperations {
    mkdir(dirpath: string): Promise<void>
    list(dir: string): Promise<Array<string>>
    write(file: string, data: string | NodeJS.ArrayBufferView): Promise<void>
    read(file: string): Promise<Buffer>
    delete(file: string): Promise<void>
    copy(src: string, dst: string): Promise<void>
}

export class LocalFsOperations implements FileOperations {
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
    read(file: string): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            fs.readFile(file, (err, data) => {
                if (err != null) {
                    reject(err)
                } else {
                    resolve(data)
                }
            })
        })
    }
    delete(file: string): Promise<void> {
        if (file.endsWith('/')) {
            return new Promise(async (resolve, reject) => {
                const files = fs.readdirSync(file)
                await Promise.all(files.map(f => this.delete(file + f)))

                fs.rmdir(file, (err) => {
                    if (err != null) {
                        reject(err)
                    } else {
                        resolve()
                    }
                })
            })
        }
        return new Promise((resolve, reject) => {
            fs.rm(file, (err) => {
                if (err != null) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })
    }
    copy(src: string, dst: string): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.copyFile(src, dst, (err) => {
                if (err !== null) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })
    }
}

export class S3FsOperations implements FileOperations {
    bucketName: string
    client: S3Client
    constructor(bucketName: string) {
        this.bucketName = bucketName
        this.client = new S3Client({})
    }
    mkdir(dir: string): Promise<void> {
        if (!dir.endsWith('/')) dir = dir + '/'
        const input: PutObjectCommandInput = {
            "Bucket": this.bucketName,
            "Key": dir,
        }
        return this.client.send(new PutObjectCommand(input))
        .then(() => {})
    }

    // TODO: listing continuations
    list(dir: string): Promise<string[]> {
        if (!dir.endsWith('/')) dir = dir + '/'
        const input: ListObjectsV2CommandInput = { // ListObjectsV2Request
            Bucket: this.bucketName, // required
            // Delimiter: "/",
            MaxKeys: 500,
            Prefix: dir,
            // ContinuationToken: "STRING_VALUE",
          }
        return this.client.send(new ListObjectsV2Command(input))
        // .then(output => {console.log('S3 LIST ' + dir + ' got:', output); return output})
        .then(output => {
            if (output.KeyCount === 0) return []
            let contents = output.Contents!.map(c => {
                let val = c.Key!.substring(dir.length)
                const folderIndicatorIndex = val.indexOf('/')
                if (folderIndicatorIndex === -1) {
                    return val
                } else if (val.length === folderIndicatorIndex + 1) {
                    return val.substring(0, val.length - 1)
                }
                // otherwise the listing includes subdirectories... filter them out
                return ''
            })
            contents = contents.filter(c => c !== '') // filter out anything that ends up blank
            return contents
        })
    }
    write(file: string, data: string | NodeJS.ArrayBufferView): Promise<void> {
        const input: PutObjectCommandInput = {
            "Body": data,
            "Bucket": this.bucketName,
            "Key": file,
          }
          return this.client.send(new PutObjectCommand(input))
          .then(() => {})
    }
    read(file: string): Promise<Buffer> {
        // console.log('S3fs reading ' + file)
        const input: GetObjectCommandInput = {
            Bucket: this.bucketName,
            Key: file
        }
        return this.client.send(new GetObjectCommand(input))
        .then(response => response.Body!.transformToByteArray())
        .then(Buffer.from)
    }
    delete(file: string): Promise<void> {
        // console.log('S3fs deleting ' + file)
        return new Promise(async (resolve, reject) => {
            if (file.endsWith('/')) {
                console.log('manual s3 delete recurse')
                const filenames = await this.list(file)
                await Promise.all(filenames.map(f => this.delete(file + f)))
                filenames.forEach(filename => console.log('s3 filename: ', filename))
                // await all deletes on them all 
            }
            const input: DeleteObjectCommandInput = {
                Bucket: this.bucketName,
                Key: file
            }
            const response = await this.client.send(new DeleteObjectCommand(input))
            console.log('S3 deleted file: ', file)
            console.log('response: ', response)
            resolve()

        })
    }
    copy(src: string, dst: string): Promise<void> {
        const input: CopyObjectCommandInput = {
            Bucket: this.bucketName,
            CopySource: src,
            Key: dst,
        }
        return this.client.send(new CopyObjectCommand(input))
        .then(() => {})
    }
}
