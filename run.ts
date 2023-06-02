#!/home/ubuntu/.local_node/bin/ts-node
import { generateKeyPair } from './backend/src/crypto/crypto-utils'
import { stackNameForBackend, stackNameForFrontend, stackNameForFrontendCertificate, stackNameForHostedZone } from './backend/tools/name-tools'
import exec from './orchestration/exec'
import { EnvironmentName } from './orchestration/property-loaders'
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
    await Promise.all([
        exec(envName, 'backend', 'npm', ['i'])
        .then(async () => {
            await exec(envName, 'backend', 'npm', ['run', 'dev'])
        }),
        exec(envName, 'frontend', 'npm', ['i'])
        .then(async () => {
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
    const keypair = generateKeyPair()
    fs.writeFileSync('privateKey.pem', (await keypair).privateKey)
    fs.writeFileSync('publicKey.pem', (await keypair).publicKey)
    console.log('output to privateKey and publicKey pem files')
}

async function build() {
    const envName = EnvironmentName.prod
    await exec(envName, 'frontend', 'npm', ['i'])
    .then(async () => {
        await exec(envName, 'frontend', 'npm',['run', 'build'])
    })
}

// there are two parallel threads of execution here
// promise chaining is used for concurrency
async function deploy(args: Array<string>) {
    const envName = EnvironmentName.prod
    const cdkDeploy = (stackname: string): Promise<any> => {
        return exec(envName, 'backend', 'npm',['run', 'cdk', '--', 'deploy', '--output', `cdk.out.${stackname}`, stackname])
    }

    // if you pass in args, you better know what you're doing!
    if (args.length != 0) {
        // run all jobs in parallel
        await Promise.all(args.map(cdkDeploy))
        return
    }

    const frontendBuild = build()
    await exec(envName, 'backend', 'npm', ['i'])
    .then(async() => {
        // if there _is_ no top level hosted zone
        // create one in a seperate stack and process
        // this _should_ only run once (if needed)
        let hostedZoneNames = await exec(envName, 'orchestration', 'ts-node',['matchHostedZoneToDomainUrl.ts'])
        hostedZoneNames = hostedZoneNames.filter(row => row !== '')
        console.log('Found these hosted zone names:', hostedZoneNames)
        
        if (hostedZoneNames === undefined || hostedZoneNames.length == 0) {
            await cdkDeploy(stackNameForHostedZone())
        }
    })
    .then(async () => {
        const jobs: Array<Promise<any>> = []
        jobs.push(
            frontendBuild
            .then(async () => {
                await cdkDeploy(stackNameForFrontendCertificate())
            })
            .then(async () => {
                await cdkDeploy(stackNameForFrontend())
            })
        )
        
        // this _requires_ an existing hosted zone, but will look one up.
        jobs.push(
            Promise.resolve()
            .then(async () => {
                await cdkDeploy(stackNameForBackend())
            })
        )

        // wait for all jobs to finish
        await Promise.all(jobs)
    })
}

async function deployLs() {
    const envName = EnvironmentName.prod
    await exec(envName, 'backend', 'npm', ['i'])
    .then(async () => {
        await exec(envName, 'backend', 'npm',['run', 'cdk', 'ls'])
    })
}