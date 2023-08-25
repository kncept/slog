import { randomInt, randomUUID } from 'crypto'
import { generateKeyPair } from '../crypto/crypto-utils'
import { AsymetricJwtAuth, AuthResult } from './jwt-auth'
import jwt from 'jsonwebtoken'
import { KeyPairName } from '../crypto/keypair-manager'
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
const keyManager = fileSystemStorage.KeyManager()
const auth = new AsymetricJwtAuth(keyManager)

// const keyPairPromise = generateKeyPair()
const subject = randomUUID().toString()
const issuer = 'slog'
const algorithm = 'RS512'


test("can verify tokens", async () => {
    const privateKey = (await keyManager.ReadKeyPair(KeyPairName.login)).privateKey
    const jwtString = jwt.sign({}, privateKey, {
        algorithm,
        subject,
        issuer,
    })
    const authResult = await auth.ParseAuth(`${jwtString}`)
    expect(authResult.result).toBe(AuthResult.authorized)
    expect(authResult.claims?.sub).toBe(subject)
})

test("requires a known issuer", async () => {
    const privateKey = (await keyManager.ReadKeyPair(KeyPairName.login)).privateKey
    const jwtString = jwt.sign({}, privateKey, {
        algorithm,
        subject,
        issuer: 'anything else',
    })
    const authResult = await auth.ParseAuth(`${jwtString}`)
    expect(authResult.result).toBe(AuthResult.invalid)
})

test("requires the same keypair", async () => {
    const jwtString = jwt.sign({}, (await generateKeyPair()).privateKey, {
        algorithm,
        subject,
        issuer,
    })
    const authResult = await auth.ParseAuth(`${jwtString}`)
    expect(authResult.result).toBe(AuthResult.invalid)
})

describe("jwt userid encryption", () => {
    const userIdToEncode = "TestUsers:" + randomInt(32767)
    let encrypted = ''
    it('consistently encrypts', async () => {
        encrypted = await auth.EncodeUserId(userIdToEncode, undefined)
        expect(await auth.EncodeUserId(userIdToEncode, undefined)).toEqual(encrypted)
    })
    it('decrypts', async () => {
        expect(await auth.DecodeUserId(encrypted, undefined)).toEqual(userIdToEncode)
    })
})