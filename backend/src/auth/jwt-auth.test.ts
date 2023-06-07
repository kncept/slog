import { randomUUID } from 'crypto'
import { generateKeyPair } from '../crypto/crypto-utils'
import { AsymetricJwtAuth, AuthResult } from './jwt-auth'
import jwt from 'jsonwebtoken'
import { FilesystemKeyPairManager, KeyPairManager, KeyPairName } from '../crypto/keypair-manager'
import * as path from 'path'
import { FilesystemStorage } from '../storage/storage'
import * as os from 'os'
import * as fs from 'fs'
import { LocalFsOperations } from '../storage/filesystem-storage'

function tmpDir(id?: string | undefined) {
    if (!id) id = randomUUID().toString()
    const dir = path.join(os.tmpdir(), id)
    fs.mkdirSync(dir, {recursive: true})
    return dir
}

const fileSystemStorage = new FilesystemStorage(tmpDir(), new LocalFsOperations())
const keypairManager = fileSystemStorage.KeyPairManager()

// const keyPairPromise = generateKeyPair()
const subject = randomUUID().toString()
const issuer = 'super-simple-blog'
const algorithm = 'RS512'


test("can verify tokens", async () => {
    const auth = new AsymetricJwtAuth(keypairManager)
    const jwtString = jwt.sign({}, (await keypairManager.ReadKeyPair(KeyPairName.login)).privateKey, {
        algorithm,
        subject,
        issuer,
    })
    const authResult = await auth.ParseAuth(`Bearer ${jwtString}`, undefined)
    expect(authResult.result).toBe(AuthResult.authorized)
    expect(authResult.claims?.sub).toBe(subject)
})

test("requires a known issuer", async () => {
    const auth = new AsymetricJwtAuth(keypairManager)
    const jwtString = jwt.sign({}, (await keypairManager.ReadKeyPair(KeyPairName.login)).privateKey, {
        algorithm,
        subject,
        issuer: 'anything else',
    })
    const authResult = await auth.ParseAuth(`Bearer ${jwtString}`, undefined)
    expect(authResult.result).toBe(AuthResult.invalid)
})

test("requires the same keypair", async () => {
    const auth = new AsymetricJwtAuth(keypairManager)
    const jwtString = jwt.sign({}, (await generateKeyPair()).privateKey, {
        algorithm,
        subject,
        issuer,
    })
    const authResult = await auth.ParseAuth(`Bearer ${jwtString}`, undefined)
    expect(authResult.result).toBe(AuthResult.invalid)
})