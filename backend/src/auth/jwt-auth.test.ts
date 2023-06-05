import { randomUUID } from 'crypto'
import { generateKeyPair } from '../crypto/crypto-utils'
import { AsymetricJwtAuth, AuthResult } from './jwt-auth'
import jwt from 'jsonwebtoken'

const keyPairPromise = generateKeyPair()
const subject = randomUUID().toString()
const issuer = 'super-simple-blog'
const algorithm = 'RS512'


test("can verify tokens", async () => {
    const auth = new AsymetricJwtAuth(await keyPairPromise)
    const jwtString = jwt.sign({}, (await keyPairPromise).privateKey, {
        algorithm,
        subject,
        issuer,
    })
    const authResult = auth.ParseAuth(`Bearer ${jwtString}`, undefined)
    expect(authResult.result).toBe(AuthResult.authorized)
    expect(authResult.claims?.sub).toBe(subject)
})

test("requires a known issuer", async () => {
    const auth = new AsymetricJwtAuth(await keyPairPromise)
    const jwtString = jwt.sign({}, (await keyPairPromise).privateKey, {
        algorithm,
        subject,
        issuer: 'anything else',
    })
    const authResult = auth.ParseAuth(`Bearer ${jwtString}`, undefined)
    expect(authResult.result).toBe(AuthResult.invalid)
})

test("requires the same keypair", async () => {
    const auth = new AsymetricJwtAuth(await keyPairPromise)
    const jwtString = jwt.sign({}, (await generateKeyPair()).privateKey, {
        algorithm,
        subject,
        issuer,
    })
    const authResult = auth.ParseAuth(`Bearer ${jwtString}`, undefined)
    expect(authResult.result).toBe(AuthResult.invalid)
})