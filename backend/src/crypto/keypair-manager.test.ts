import { randomUUID } from 'crypto'
import * as os from 'os'
import * as fs from 'fs'
import * as path from 'path'
import { parse } from '@supercharge/json/dist'
import { KeyPair, KeySpec } from '../crypto/crypto-utils'
import { KeyName, KeyPairName } from '../crypto/keypair-manager'
import { FilesystemStorage } from '../storage/storage'
import { LocalFsOperations } from '../storage/filesystem-storage'

function tmpDir(id?: string | undefined) {
    if (!id) id = randomUUID().toString()
    const dir = path.join(os.tmpdir(), id)
    fs.mkdirSync(dir, {recursive: true})
    return dir
}

describe('KeyManager', () => {
    const dir = tmpDir()
    const fileSystemStorage = new FilesystemStorage(dir, new LocalFsOperations())
    const keyManager = fileSystemStorage.KeyManager()
    
    describe('KeyPair', () => {
        let keyPair: KeyPair | undefined
        it ('must be created when not exists', async () => {
            await fileSystemStorage.readyFlag
            keyPair = await keyManager.ReadKeyPair(KeyPairName.login)
            expect(keyPair).toBeDefined()
            const keyPairString = fs.readFileSync(path.join(dir, 'keys', `${KeyPairName.login}.json`)).toString()
            expect(parse(keyPairString)).toEqual(keyPair)
        })
        it('must be consistently read KeyPair', async () => {
            const secondRead = await keyManager.ReadKeyPair(KeyPairName.login)
            expect(secondRead).toEqual(keyPair)
        })
    })
    
    describe('KeySpec', () => {
        let keySpec: KeySpec | undefined
        it ('must be created when not exists', async () => {
            await fileSystemStorage.readyFlag
            keySpec = await keyManager.ReadKey(KeyName.user)
            expect(keySpec).toBeDefined()
            const keyPairString = fs.readFileSync(path.join(dir, 'keys', `${KeyName.user}.json`)).toString()
            expect(parse(keyPairString)).toEqual(keySpec)
        })
        it('must be consistently read KeyPair', async () => {
            const secondRead = await keyManager.ReadKey(KeyName.user)
            expect(secondRead).toEqual(keySpec)
        })
    })
})