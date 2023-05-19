import * as fs from 'fs'
import { S3Client, ListObjectsV2Request, ListObjectsV2Command, PutObjectCommand, PutObjectCommandInput, ListObjectsV2CommandInput, GetObjectCommand, GetObjectCommandInput } from '@aws-sdk/client-s3'


export interface FileOperations {
    mkdir(dirpath: string): Promise<void>
    list(dir: string): Promise<Array<string>>
    write(file: string, data: string | NodeJS.ArrayBufferView): Promise<void>
    read(file: string): Promise<Buffer>
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
          return this.client.send(new PutObjectCommand(input)).then(() => {})
    }

    // TODO: listing continuations
    list(dir: string): Promise<string[]> {
        if (!dir.endsWith('/')) dir = dir + '/'
        console.log('S3 LIST::', dir)
        const input: ListObjectsV2CommandInput = { // ListObjectsV2Request
            Bucket: this.bucketName, // required
            // Delimiter: "/",
            // EncodingType: "url",
            MaxKeys: 500,
            Prefix: dir,
            // ContinuationToken: "STRING_VALUE",
            // FetchOwner: true || false,
            // StartAfter: "STRING_VALUE",
            // RequestPayer: "requester",
            // ExpectedBucketOwner: "STRING_VALUE",
          }
        return this.client.send(new ListObjectsV2Command(input))
        .then(output => {console.log('S3 LIST got::', output); return output})
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
            contents = contents.filter(c => c !== '') // huh - gotta filter out the folder itself
            return contents
        })
    }
    write(file: string, data: string | NodeJS.ArrayBufferView): Promise<void> {
        console.log("S3 Write:", file)
        const input: PutObjectCommandInput = {
            "Body": data,
            "Bucket": this.bucketName,
            "Key": file,
          }
          return this.client.send(new PutObjectCommand(input))
          .then(v => console.log('S3 wrote: ', v))
          .then(() => {})
    }
    async read(file: string): Promise<Buffer> {
        console.log("S3 read start:", file)
        return new Promise(async (resolve, reject) => {
            const input: GetObjectCommandInput = {
                Bucket: this.bucketName,
                Key: file
            }
            const response = await this.client.send(new GetObjectCommand(input))
            console.log("S3 read resp:", response)
            const buf = await response.Body!.transformToByteArray()
            resolve(Buffer.from(buf))
        })
    }
}
