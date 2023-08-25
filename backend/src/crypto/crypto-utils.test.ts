import { generateKey, generateKeyPair, simpleDecode, simpleEncode } from "./crypto-utils"

describe('keypairs', () => {
    it('can be generated', async () => {
        const keypair = await generateKeyPair()
        expect(keypair.publicKey).not.toBeNull()
        expect(keypair.privateKey).not.toBeNull()
    })

    it('generates PEM format', async () => {
        const keypair = await generateKeyPair()
    
        expect(keypair.publicKey.startsWith('-----BEGIN PUBLIC KEY-----\n')).toBe(true)
        expect(keypair.publicKey.endsWith('-----END PUBLIC KEY-----\n')).toBe(true)
    
        expect(keypair.privateKey.startsWith('-----BEGIN PRIVATE KEY-----\n')).toBe(true)
        expect(keypair.privateKey.endsWith('-----END PRIVATE KEY-----\n')).toBe(true)
    })
})

describe('keys', () => {
    it('can be generated', async () => {
        const keyspec = await generateKey()
        expect(keyspec).not.toBeNull()
        expect(keyspec.iv).not.toBeNull()
        expect(keyspec.key).not.toBeNull()
    })
})

describe('symmetric encoding', () => {
    const keyspec = generateKey()
    it('should consistently encode and decode', async () => {

        // base62 uses 6 byte nibbles, so lets pad that out when needed
        const seed = 'Test string at ' + new Date().getTime()
        const pad = 'xxxxxx'
        for(let i = 0; i < pad.length; i++) {
            const original = seed + pad.substring(0, i)
            const encoded = simpleEncode(await keyspec, original)
            const decoded = simpleDecode(await keyspec, encoded)
            expect(decoded).toEqual(original)
        }
    })
})