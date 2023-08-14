import crypto, { randomBytes } from 'crypto'
import VersionMapper from '../versionmapper/versionmapper'
const base62 = require('@fry/base62')
import { parse, stringify} from '@supercharge/json'

export interface KeyPair {
    privateKey: string
    publicKey: string
}

export interface KeySpec {
    key: string
    iv: string
}

interface VersionedEncoder {
    simpleEncode(keyspec: KeySpec, value: string): string
    simpleDecode(keyspec: KeySpec, value: string): string
}

const encoderVersionMapper: VersionMapper<VersionedEncoder> = new VersionMapper()

encoderVersionMapper.AddVersion('1.0.0', {
    simpleEncode: (keyspec: KeySpec, value: string) => {
        const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(keyspec.key, 'base64'), Buffer.from(keyspec.iv, 'base64'))
        const encoded = Buffer.concat([
            cipher.update(value, 'utf8'),
            cipher.final(),
        ])
        const authTag = cipher.getAuthTag()
        return `${authTag.toString('base64')}:${encoded.toString('base64')}`
    },
    simpleDecode: (keyspec: KeySpec, value: string) => {
        const components = value.split(':')
        const cipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(keyspec.key, 'base64'), Buffer.from(keyspec.iv, 'base64'))
        cipher.setAuthTag(Buffer.from(components[0], 'base64'))
        const decoded = Buffer.concat([
            cipher.update(Buffer.from(components[1], 'base64')),
            cipher.final(),
        ])
        return decoded.toString('utf8')
    },
})
encoderVersionMapper.AddVersion('1.0.1', {
    simpleEncode: (keyspec: KeySpec, value: string) => {
        const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(keyspec.key, 'base64'), Buffer.from(keyspec.iv, 'base64'))
        const encoded = Buffer.concat([
            cipher.update(value, 'utf8'),
            cipher.final(),
        ])
        const authTag = cipher.getAuthTag()
        const wireBuffer = Buffer.concat([
            // too much maths to 'infix' lengths, just write it as a 'header'
            Buffer.from([encoded.length, authTag.length]),
            encoded,
            authTag
        ])
        return base62.encode(wireBuffer.toJSON().data)
    },
    simpleDecode: (keyspec: KeySpec, value: string) => {
        const wireBuffer = base62.decode(value) as Buffer
        const encoded = wireBuffer.subarray(2, 2 + wireBuffer.at(0)!)
        const authTag = wireBuffer.subarray(2 + wireBuffer.at(0)!, 2 + wireBuffer.at(0)! + wireBuffer.at(1)!)
        // NB. base62 can have run on bytes
        // so we encode length at the start in the first 2 bytes
        const cipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(keyspec.key, 'base64'), Buffer.from(keyspec.iv, 'base64'))
        cipher.setAuthTag(authTag)
        const decoded = Buffer.concat([
            cipher.update(encoded),
            cipher.final(),
        ])
        return decoded.toString('utf8')
    },
})


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

export function simpleEncode(keyspec: KeySpec, value: string, version: string | undefined): string {
    return encoderVersionMapper.GetVersion(version).simpleEncode(keyspec, value)
    
}

export function simpleDecode(keyspec: KeySpec, value: string, version: string | undefined): string {
    return encoderVersionMapper.GetVersion(version).simpleDecode(keyspec, value)
    
}

