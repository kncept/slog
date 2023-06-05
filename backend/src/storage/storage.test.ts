import { randomUUID } from 'crypto'
import { FilesystemStorage, KeyPairName } from './storage'
import * as os from 'os'
import * as fs from 'fs'
import * as path from 'path'
import { LocalFsOperations } from './filesystem-storage'
import { parse } from '@supercharge/json/dist'
import { KeyPair } from '../crypto/crypto-utils'

function tmpDir(id?: string | undefined) {
    if (!id) id = randomUUID().toString()
    const dir = path.join(os.tmpdir(), id)
    fs.mkdirSync(dir, {recursive: true})
    return dir
}

test('FilesystemStorage', async () => {
    const fileSystemStorage = new FilesystemStorage(tmpDir(), new LocalFsOperations())
    expect(fileSystemStorage).toBeDefined()
    
})


describe('KeyPairManager', () => {
    const dir = tmpDir()
    const fileSystemStorage = new FilesystemStorage(dir, new LocalFsOperations())
    const keypairManager = fileSystemStorage.KeyPairManager()
    let keyPair: KeyPair | undefined
    it ('must create a keypair when none exists', async () => {
        await fileSystemStorage.readyFlag
        keyPair = await keypairManager.ReadKeyPair(KeyPairName.login)
        expect(keyPair).toBeDefined()
        const keyPairString = fs.readFileSync(path.join(dir, 'keys', `${KeyPairName.login}.json`)).toString()
        expect(parse(keyPairString)).toEqual(keyPair)
    })
    it('must consistently read KeyPair', async () => {
        const secondRead = await keypairManager.ReadKeyPair(KeyPairName.login)
        expect(secondRead).toEqual(keyPair)
    })
})