#!/usr/bin/env ts-node
import { generateKeyPair } from './backend/src/crypto/crypto-utils'
import { matchHostedZoneToDomainUrl } from './backend/tools/domain-tools'
import { superSimpleBaseBlogName } from './backend/tools/name-tools'
import exec from './orchestration/exec'
import EnvProperties, { EnvironmentName } from './orchestration/property-loaders'
import * as fs from 'fs'

// ensure that we don't have any background promises fail without a real error
process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled rejection at ', promise, `reason: ${reason}`)
    process.exit(1)
})

const args = process.argv
// args[0] = node binary
// args[1] = run.ts
if (args.length <=2) {
    console.log('Please supply an arg')
    showHelp()
    process.exit(1)
}

switch(args[2].toLowerCase()) {
    case 'help':
        showHelp()
        break
    case 'start':
    case 'dev':
        startDev()
        break
    case 'build':
        build()
        break
    case 'deploy':
        deploy(args.length == 3 ? [] : args.slice(3))
        break
    case 'test':
        test()
        break
    case 'keygen':
        keygen()
        break
    case 'deploy-ls':
        deployLs()
        break
    default:
        console.log('Unknown command: ' + args[2])
        showHelp()
        process.exit(1)
}

function showHelp() {
    console.log("  Usage:")
    console.log("    help:      Prints this message")
    console.log("    start:     Starts the stack in dev mode")
    console.log("    deploy:    Builds and Deploys the stack")
    console.log("  Tools:")
    console.log("    build:      Builds the frontend")
    console.log("    keygen:     Generates a pair of pem file keys")
    console.log("    deploy-ls:  Lists CDK stack names")
    console.log("    deploy [x]: Parallel Deploy (only) of all [x] stacks (see deploy-ls output)")
}

async function startDev() {
    const envName = EnvironmentName.dev
    const generateSslCerts = keygen()
    await Promise.all([
        exec(envName, 'backend', 'npm', ['i'])
        .then(async () => {
            await generateSslCerts
            await exec(envName, 'backend', 'npm', ['run', 'dev'])
        }),
        exec(envName, 'frontend', 'npm', ['i'])
        .then(async () => {
            await generateSslCerts
            await exec(envName, 'frontend', 'npm',['start'])
        })
    ])
}

async function test() {
    const envName = EnvironmentName.dev
    await exec(envName, '.', 'npm', ['test'])
    await exec(envName, 'frontend', 'npm', ['i'])
    .then(async () => {
        await exec(envName, 'frontend', 'npm',['test', '--', '--watchAll=false'])
    })
    await exec(envName, 'backend', 'npm', ['i'])
    .then(async () => {
        await exec(envName, 'backend', 'npm',['test'])
    })
}

async function keygen() {
    // const keypair = generateKeyPair()
    // fs.writeFileSync('privateKey.pem', (await keypair).privateKey)
    // fs.writeFileSync('publicKey.pem', (await keypair).publicKey)
    // console.log('output to privateKey and publicKey pem files')

    // ensure .data dir exists
    if (!fs.existsSync('.data')) fs.mkdirSync('.data')

    // create new key _if required_
    if (!fs.existsSync('../.data/server.key') || !fs.existsSync('../.data/server.cert')) {
        // openssl req -nodes -new -x509 -keyout server.key -out server.cert
        // -subj "/C=US/ST=Denial/L=Springfield/O=Dis/CN=www.example.com"
        // exec(EnvironmentName.dev, '.', 'openssl', "req -nodes -new -x509 -keyout .data/server.key -out .data/server.cert".split(" "))
        exec(EnvironmentName.dev, '.', 'openssl', [
            "req",
            "-nodes",
            "-new",
            "-x509",
            "-keyout", ".data/server.key",
            "-subj", "/C=AU/ST=Victoria/L=Melbourne/O=Kncept/CN=127.0.0.1",
            "-out", ".data/server.cert",
        ])
    }
}

async function build() {
    const envName = EnvironmentName.prod
    await exec(envName, 'frontend', 'npm', ['ci'])
    .then(async () => {
        await exec(envName, 'frontend', 'npm',['run', 'build'])
    })
}

// there are two parallel threads of execution here
// promise chaining is used for concurrency
async function deploy(args: Array<string>) {
    const envName = EnvironmentName.prod

    // SET env properties into the current process... IF undefined (only)
    const env = EnvProperties(envName)
    Object.keys(env).forEach(key => {
        if (process.env[key] === undefined) process.env[key] = env[key]
    })

    // build frontend and prepare backend
    await Promise.all([
        build(),
        exec(envName, 'backend', 'npm', ['ci'])
    ])

    const cdkDeploy = (stackname: string): Promise<any> => {
        return exec(envName, 'backend', 'npm',['run', 'cdk', '--', 'deploy', '--output', `cdk.out.${stackname}`, stackname])
    }

    // if you pass in args, you better know what you're doing!
    if (args.length != 0) {
        // run all jobs in parallel
        await Promise.all(args.map(cdkDeploy))
        return
    }

    await cdkDeploy(superSimpleBaseBlogName())
}

// heh - now that we have a nested stack approach, this should work 
async function deployLs() {
    const envName = EnvironmentName.prod
    await exec(envName, 'backend', 'npm', ['i'])
    .then(async () => {
        await exec(envName, 'backend', 'npm',['run', 'cdk', 'ls'])
    })
}