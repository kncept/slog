
export default interface CliCommand {
    command: () => string
    helpText: () => string
    exec: (args: string[]) => Promise<void>
}