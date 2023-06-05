import { generateKeyPair } from "./crypto-utils"


test('can generate keypairs', async () => {
    const keypair = await generateKeyPair()
    expect(keypair.publicKey).not.toBeNull()
    expect(keypair.privateKey).not.toBeNull()
})

test('generates PEM format', async () => {
    const keypair = await generateKeyPair()

    expect(keypair.publicKey.startsWith('-----BEGIN PUBLIC KEY-----\n')).toBe(true)
    expect(keypair.publicKey.endsWith('-----END PUBLIC KEY-----\n')).toBe(true)

    expect(keypair.privateKey.startsWith('-----BEGIN PRIVATE KEY-----\n')).toBe(true)
    expect(keypair.privateKey.endsWith('-----END PRIVATE KEY-----\n')).toBe(true)
})
