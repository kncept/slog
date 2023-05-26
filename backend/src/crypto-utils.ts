import crypto from 'crypto'

interface KeyPair {
    privateKey: string
    publicKey: string
}

export async function currentKeyPair(): Promise<KeyPair> {
    if (process.env.KEY_PRIVATE === undefined || process.env.KEY_PRIVATE === '') {
        return generateKeyPair()
    }
    const privateKey = process.env.KEY_PRIVATE!!
    const publicKey = process.env.KEY_PUBLIC!!
    return {
        privateKey,
        publicKey,
    }
}

export function generateKeyPair(): Promise<KeyPair> {
    return new Promise((resolve, reject) => {
        crypto.generateKeyPair('rsa', {
            modulusLength: 2048, // RS512 has a minimum key size of 2k
            publicKeyEncoding: {
                type: 'pkcs1',
                format: 'pem',
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem'
            }

        }, (err: Error | null, publicKey: string, privateKey: string) => {
            if (err !== null) reject(err)
            resolve({
                publicKey, privateKey,
            })
        })
    })
}