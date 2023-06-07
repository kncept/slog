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

describe('KeyPairManager', () => {
    const dir = tmpDir()
    const fileSystemStorage = new FilesystemStorage(dir, new LocalFsOperations())
    const keypairManager = fileSystemStorage.KeyPairManager()
    
    describe('KeyPair', () => {
        let keyPair: KeyPair | undefined
        it ('must be created when not exists', async () => {
            await fileSystemStorage.readyFlag
            keyPair = await keypairManager.ReadKeyPair(KeyPairName.login)
            expect(keyPair).toBeDefined()
            const keyPairString = fs.readFileSync(path.join(dir, 'keys', `${KeyPairName.login}.json`)).toString()
            expect(parse(keyPairString)).toEqual(keyPair)
        })
        it('must be consistently read KeyPair', async () => {
            const secondRead = await keypairManager.ReadKeyPair(KeyPairName.login)
            expect(secondRead).toEqual(keyPair)
        })
    })
    
    describe('KeySpec', () => {
        let keySpec: KeySpec | undefined
        it ('must be created when not exists', async () => {
            await fileSystemStorage.readyFlag
            keySpec = await keypairManager.ReadKey(KeyName.user)
            expect(keySpec).toBeDefined()
            const keyPairString = fs.readFileSync(path.join(dir, 'keys', `${KeyName.user}.json`)).toString()
            expect(parse(keyPairString)).toEqual(keySpec)
        })
        it('must be consistently read KeyPair', async () => {
            const secondRead = await keypairManager.ReadKey(KeyName.user)
            expect(secondRead).toEqual(keySpec)
        })
    })
})