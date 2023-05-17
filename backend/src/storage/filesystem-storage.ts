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
        // const client = new S3Client({ region: "REGION" });
        this.client = new S3Client({})
    }
    mkdir(dirpath: string): Promise<void> {
        const input: PutObjectCommandInput = {
            // "Body": "",
            "Bucket": this.bucketName,
            "Key": dirpath,
            // "Tagging": "key1=value1&key2=value2"
          }
          return this.client.send(new PutObjectCommand(input)).then(() => {})
    }
    list(dir: string): Promise<string[]> {
        const input: ListObjectsV2CommandInput = { // ListObjectsV2Request
            Bucket: this.bucketName, // required
            // Delimiter: "STRING_VALUE",
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
        .then(output => output.Contents!.map(c => c["Key"]) as string[])
    }
    write(file: string, data: string | NodeJS.ArrayBufferView): Promise<void> {
        const input: PutObjectCommandInput = {
            "Body": data,
            "Bucket": this.bucketName,
            "Key": file,
            // "Tagging": "key1=value1&key2=value2"
          }
          return this.client.send(new PutObjectCommand(input)).then(() => {})
    }
    async read(file: string): Promise<Buffer> {
        return new Promise(async (resolve, reject) => {
            const input: GetObjectCommandInput = {
                Bucket: this.bucketName,
                Key: file
            }
            const response = await this.client.send(new GetObjectCommand(input))
            const buf = await response.Body!.transformToByteArray()
            resolve(Buffer.from(buf))
        })
    }
}
