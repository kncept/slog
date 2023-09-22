import CliCommand from '../cli-command'
import exec, {} from '../exec'
import { EnvironmentName } from '../property-loaders'

export default class BuildCommand implements CliCommand {
    command: () => string = () => `build`
    helpText: () => string = () => `Builds the frontend`
    exec: (args: string[]) => Promise<void> = () => build().then(() => {})

}

async function build() {
    const feBuild = exec(EnvironmentName.prod, 'frontend', 'npm', ['ci'])
    .then(async () => {
        await exec(EnvironmentName.prod, 'frontend', 'npm',['run', 'build'])
    })
    const beBuild = await exec(EnvironmentName.prod, 'backend', 'npm', ['ci'])
    await Promise.all([feBuild, beBuild])
}