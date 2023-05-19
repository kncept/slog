#!/home/ubuntu/.local_node/bin/ts-node
import * as path from 'path'
import { spawn } from 'child_process'
import EnvProperties, { EnvironmentName } from './property-loaders'

// maximum buffer size in # of lines
const maxBufferSize = 100

export default async function exec(envName: EnvironmentName, dir: string, command: string, args: Array<string>): Promise<string[]> {
    const env = EnvProperties(envName)
    // console.log('Running ' + envName + ' ' + dir + '/' + command + ' ' + JSON.stringify(args) + ' with env properties:', env)
    return new Promise((resolve, reject) => {
        const outputBuffer: Array<string> = []
        const writeChunk = (writer: NodeJS.WriteStream, chunk: any) => {
            chunk.toString().split(/\r?\n/).forEach((v: string) => {
                writer.write(dir)
                writer.write('/')
                writer.write(command)
                writer.write(': ')
                writer.write(v)
                writer.write('\n')
                outputBuffer.push(v)
            })
            if (maxBufferSize < outputBuffer.length) {
                outputBuffer.slice(outputBuffer.length - maxBufferSize)
            }
        }
        const child = spawn(command, args, {
            cwd: path.join(process.cwd(), dir),
            env
        })
        child.on('error', (err) => {
            reject({
                message: 'Received error',
                error: err
            })
            reject(err)
        })
        child.on('close', (code) => {
            if (code === 0) {
                resolve(outputBuffer)
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
