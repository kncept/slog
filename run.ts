#!/usr/bin/env ts-node
import BuildCommand from './orchestration/commands/build'
import StartDevCommand from './orchestration/commands/start-dev'
import KeygenCommand from './orchestration/commands/keygen'
import TestCommand from './orchestration/commands/test'
import DeployCommand from './orchestration/commands/deploy'
import CliCommand from './orchestration/cli-command'

// ensure that we don't have any background promises fail without a real error
process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled rejection at ', promise, `reason: ${reason}`)
    process.exit(1)
})

async function execCli() {
    const commands = [
        new BuildCommand(),
        new StartDevCommand(),
        new KeygenCommand(),
        new TestCommand(),
        new DeployCommand(),
    ]

    const args = process.argv
    // args[0] = node binary
    // args[1] = run.ts
    if (args.length <=2) {
        console.log('Please supply an arg')
        showHelp(commands)
        process.exit(1)
    }

    const remainingArgs = args.length == 3 ? [] : args.slice(3)
    const matchingCommand = commands.filter(v => v.command() === args[2])
    if (matchingCommand.length == 1) {
        matchingCommand[0].exec(remainingArgs)
    } else {
        showHelp(commands)
    }
}
execCli()


function showHelp(commands: CliCommand[]) {
    console.log("Usage:")
    commands.forEach(command => console.log(`  ${command.command()}  ${command.helpText()}`))
}
