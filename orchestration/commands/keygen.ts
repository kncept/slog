import { fullyQualifiedApiDomainName } from '../../backend/tools/domain-tools'
import CliCommand from '../cli-command'
import exec, {} from '../exec'
import { EnvironmentName } from '../property-loaders'
import * as fs from 'fs'

export default class KeygenCommand implements CliCommand {
    command: () => string = () => `keygen`
    helpText: () => string = () => `Generates sets of pem key files`
    exec: (args: string[]) => Promise<void> = (args) => {
        if (args.length === 0) {
            return keygen().then(() => {})
        } 
        return Promise.all(args.map(arg => certForCN(arg))).then(() => {})
    }

}

export function certnameForCN(cn: string): {key: string, cert: string} {
    return {
        key: `server.${cn}.key`,
        cert: `server.${cn}.cert`,
    }
}
export async function certForCN(cn: string): Promise<{key: string, cert: string}> {
    // ensure .data dir exists
    if (!fs.existsSync('../.data')) fs.mkdirSync('../.data')

    // create new key _if required_
    if (!fs.existsSync(`../.data/server.${cn}.key`) || !fs.existsSync(`../.data/server.${cn}.cert`)) {
        // openssl req -nodes -new -x509 -keyout server.key -out server.cert
        // -subj "/C=US/ST=Denial/L=Springfield/O=Dis/CN=www.example.com"
        // exec(EnvironmentName.dev, '.', 'openssl', "req -nodes -new -x509 -keyout .data/server.key -out .data/server.cert".split(" "))
        await exec(EnvironmentName.dev, '.', 'openssl', [
            "req",
            "-nodes",
            "-new",
            "-x509",
            "-keyout", `../.data/server.${cn}.key`,
            "-subj", `/C=AU/ST=Victoria/L=Melbourne/O=Kncept/CN=${cn}`,
            "-out", `../.data/server.${cn}.cert`,
        ])
    }
    return certnameForCN(cn)
}


export async function keygen() {
    // const keypair = generateKeyPair()
    // fs.writeFileSync('privateKey.pem', (await keypair).privateKey)
    // fs.writeFileSync('publicKey.pem', (await keypair).publicKey)
    // console.log('output to privateKey and publicKey pem files')

    await Promise.all([
        certForCN('127.0.0.1'),
        certForCN('localhost'),
    ])
}