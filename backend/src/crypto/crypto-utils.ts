import { Console } from 'console'
import crypto, { randomBytes } from 'crypto'

export interface KeyPair {
    privateKey: string
    publicKey: string
}

export interface KeySpec {
    key: string
    iv: string
}


interface KeyPairOptions {
    modulusLength ?: number | undefined
}
export function generateKeyPair(options?: KeyPairOptions): Promise<KeyPair> {
    const modulusLength = options?.modulusLength || 2048 // Math.pow(2, 11) = 2048
    return new Promise((resolve, reject) => {
        crypto.generateKeyPair('rsa', {
            modulusLength, // RS512 has a minimum key size of 2k
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

interface KeySpecOptions {
    keySize ?: number | undefined
    ivSize ?: number | undefined
}
export function generateKey(options?: KeySpecOptions): KeySpec {
    const keySize = options?.keySize || 32
    const ivSize = options?.ivSize || 12
    const key = randomBytes(keySize)
    const iv = randomBytes(ivSize)

    return {
        key: Buffer.from(key).toString('base64'),
        iv: Buffer.from(iv).toString('base64'),
    }
}

export function simpleEncode(keyspec: KeySpec, value: string): string {
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(keyspec.key, 'base64'), Buffer.from(keyspec.iv, 'base64'))
    const encoded = Buffer.concat([
        cipher.update(value, 'utf8'),
        cipher.final(),
    ])
    const authTag = cipher.getAuthTag()
    return `${authTag.toString('base64')}:${encoded.toString('base64')}` 
}

export function simpleDecode(keyspec: KeySpec, value: string): string {
    const components = value.split(':')
    const cipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(keyspec.key, 'base64'), Buffer.from(keyspec.iv, 'base64'))
    cipher.setAuthTag(Buffer.from(components[0], 'base64'))
    const decoded = Buffer.concat([
        cipher.update(Buffer.from(components[1], 'base64')),
        cipher.final(),
    ])
    return decoded.toString('utf8')
}