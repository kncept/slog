import CliCommand from '../cli-command'
import exec, {} from '../exec'
import { EnvironmentName } from '../property-loaders'

export default class BuildCommand implements CliCommand {
    command: () => string = () => `build`
    helpText: () => string = () => `Builds the frontend`
    exec: (args: string[]) => Promise<void> = () => build().then(() => {})

}

async function build() {
    const envName = EnvironmentName.prod
    await exec(envName, 'frontend', 'npm', ['ci'])
    .then(async () => {
        await exec(envName, 'frontend', 'npm',['run', 'build'])
    })
}