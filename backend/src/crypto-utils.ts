import crypto from 'crypto'

export interface KeyPair {
    privateKey: string
    publicKey: string
}

export async function currentKeyPair(): Promise<KeyPair> {
    if (process.env.PRIVATE_KEY === undefined || process.env.PRIVATE_KEY === '') {
        return generateKeyPair()
    }
    const privateKey = process.env.PRIVATE_KEY!!
    const publicKey = process.env.PUBLIC_KEY!!
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
                type: 'spki',
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