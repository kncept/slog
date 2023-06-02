import crypto from 'crypto'
import { KeyPair, generateKeyPair } from './crypto-utils'
import * as path from 'path'
import * as fs from 'fs'

const dataDir = path.join(__dirname, '..', '..', '..', '.data')

// moved to the 'data dir' in order for stability
// otherwise the keypair was regenerated every time there was a data load
export const devKeyPair: () => Promise<KeyPair> = () => new Promise(async (resolve, reject) => {
    fs.mkdirSync(dataDir, {recursive: true})
    const direntries = fs.readdirSync(dataDir)
    if (!direntries.includes('privateKey.pem') || !direntries.includes('publicKey.pem')) {
        console.log('GENERATING new keypair into ' + dataDir)
        const pair = generateKeyPair()
        fs.writeFileSync(path.join(dataDir, 'privateKey.pem'), (await pair).privateKey)
        fs.writeFileSync(path.join(dataDir, 'publicKey.pem'), (await pair).publicKey)
    }
    resolve({
        privateKey: fs.readFileSync(path.join(dataDir, 'privateKey.pem')).toString(),
        publicKey: fs.readFileSync(path.join(dataDir, 'publicKey.pem')).toString(),
    })
})