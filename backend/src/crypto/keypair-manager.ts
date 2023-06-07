import { FileOperations } from "../storage/filesystem-storage"
import { KeyPair, KeySpec, generateKey, generateKeyPair } from "./crypto-utils"
import { parse, stringify} from '@supercharge/json'
import * as path from 'path'


export enum KeyPairName {
    login = 'login', // login keypair
}
export enum KeyName {
    user = 'user', // user details encryption
}

// perhaps a per-type get/set?
// WHAT ABOUT a per-contributor bio? That's a good way to add state info?
export interface KeyPairManager {
    ReadKeyPair(keyPairName: KeyPairName): Promise<KeyPair>
    WriteKeyPair(keyPairName: KeyPairName, value: KeyPair): Promise<void>

    ReadKey(keyName: KeyName): Promise<KeySpec>
    WriteKey(keyName: KeyName, value: KeySpec): Promise<void>
}

export class FilesystemKeyPairManager implements KeyPairManager {
    storageLocation: string
    fsBackend: FileOperations
    constructor(storageLocation: string, fsBackend: FileOperations) {
        this.storageLocation = storageLocation
        this.fsBackend = fsBackend
    }
    ReadKeyPair(keyPairName: KeyPairName): Promise<KeyPair> {
        return this.fsBackend.read(path.join(this.storageLocation, `${keyPairName}.json`))
        .then(file => parse(file.toString()) as KeyPair)
        .catch(async reason => { // write a new value when empty
            const value = await generateKeyPair()
            await this.WriteKeyPair(keyPairName, value)
            return value
        })
    }
    WriteKeyPair(keyPairName: KeyPairName, value: KeyPair): Promise<void> {
        return this.fsBackend.write(path.join(this.storageLocation, `${keyPairName}.json`), stringify(value))
    }

    ReadKey(keyName: KeyName): Promise<KeySpec> {
        return this.fsBackend.read(path.join(this.storageLocation, `${keyName}.json`))
        .then(file => parse(file.toString()) as KeySpec)
        .catch(async reason => { // write a new value when empty
            const value = await generateKey()
            await this.WriteKey(keyName, value)
            return value
        })
    }

    WriteKey(keyName: KeyName, value: KeySpec): Promise<void> {
        return this.fsBackend.write(path.join(this.storageLocation, `${keyName}.json`), stringify(value))
    }

}