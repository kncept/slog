import { baseSlogName } from '../../backend/tools/name-tools'
import CliCommand from '../cli-command'
import exec, {} from '../exec'
import EnvProperties, { EnvironmentName } from '../property-loaders'
import BuildCommand from './build'

export default class DeployCommand implements CliCommand {
    command: () => string = () => `deploy`
    helpText: () => string = () => `Build and Deploy the stack`
    exec: (args: string[]) => Promise<void> = (args) => deploy(args).then(() => {})
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
        new BuildCommand().exec([]),
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

    await cdkDeploy(baseSlogName())
}
