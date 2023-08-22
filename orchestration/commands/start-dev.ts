import CliCommand from '../cli-command'
import exec, {} from '../exec'
import { EnvironmentName } from '../property-loaders'
import { keygen } from './keygen'

export default class StartDevCommand implements CliCommand {
    command: () => string = () => `start`
    helpText: () => string = () => `Starts the stack in dev mode`
    exec: (args: string[]) => Promise<void> = () => startDev().then(() => {})

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