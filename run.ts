#!/home/ubuntu/.local_node/bin/ts-node
import * as path from 'path'
import {spawn} from 'child_process'

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

async function exec(dir: string, command: string, args: Array<string>): Promise<void> {
    // const env = process.env

    return new Promise((resolve, reject) => {
        const writeChunk = (writer: NodeJS.WriteStream, chunk: any) => {
            chunk.toString().split(/\r?\n/).forEach((v: string) => {
                writer.write(dir)
                writer.write('/')
                writer.write(command)
                writer.write(': ')
                writer.write(v)
                writer.write('\n')
            })
        }
        const child = spawn(command, args, {
            cwd: path.join(process.cwd(), dir),
            // env,
            // env: {}
        })
        child.on('error', (err) => {
            // console.log('Error', {dir, command})
            // console.log(err)
            reject(err)
        })
        child.on('close', (code) => {
            if (code === 0) {
                resolve()
            } else {
                reject({
                    message: 'Non Zero Exit Code',
                    errno: code
                })
            }
        })
        child.stdout.on('data', function (chunk: any) {
            writeChunk(process.stdout, chunk)
         })
         child.stderr.on('data', function (chunk: any) {  
            writeChunk(process.stderr, chunk)
         })
    })
}

async function startDev() {
    let backend = exec('backend', 'npm', ['i'])
    .then(async () => {
        await exec('backend', 'npm', ['run', 'dev'])
    })

    let frontend = exec('frontend', 'npm', ['i'])
    .then(async () => {
        await exec('frontend', 'npm',['start'])
    })

    // and just wait till we're done
    await backend
    await frontend
}

async function build() {
    await exec('frontend', 'npm', ['i'])
    .then(async () => {
        await exec('frontend', 'npm',['run', 'build'])
    })
}

async function deploy() {
    await build()

    await exec('backend', 'npm', ['i'])
    .then(async () => {
        await exec('backend', 'npm',['run', 'cdk', 'deploy'])
    })
}