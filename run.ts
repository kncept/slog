#!/home/ubuntu/.local_node/bin/ts-node
import exec from './orchestration/exec'
import { EnvironmentName } from './orchestration/property-loaders'

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
if (args.length > 3) {
    console.log('Too many args')
    showHelp()
    process.exit(1)
}

switch(args[2].toLowerCase()) {
    case 'help':
        showHelp()
        break;
    case 'start':
    case 'dev':
        startDev()
        break;
    case 'deploy':
        deploy()
        break
    default:
        console.log('Unknown command: ' + args[2])
        showHelp()
        process.exit(1)
}

function showHelp() {
    console.log("  Usage:")
    console.log("    help:   Prints this message")
    console.log("    start:  Starts the stack in dev mode")
    console.log("    deploy: Builds and Deploys the stack")
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

async function build() {
    const envName = EnvironmentName.prod
    await exec(envName, 'frontend', 'npm', ['i'])
    .then(async () => {
        await exec(envName, 'frontend', 'npm',['run', 'build'])
    })
}

async function deploy() {
    await build()

    const envName = EnvironmentName.prod
    await exec(envName, 'backend', 'npm', ['i'])
    .then(async () => {
        await exec(envName, 'backend', 'npm',['run', 'cdk', 'deploy'])
    })
}