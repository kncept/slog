import CliCommand from '../cli-command'
import exec, {} from '../exec'
import { EnvironmentName } from '../property-loaders'

export default class TestCommand implements CliCommand {
    command: () => string = () => `test`
    helpText: () => string = () => `Runs Tests`
    exec: (args: string[]) => Promise<void> = () => test().then(() => {})

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