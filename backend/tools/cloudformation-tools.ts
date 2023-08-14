import { CloudFormationClient, DescribeStacksCommand, DescribeStacksInput } from "@aws-sdk/client-cloudformation"

export async function lookupOutputs(stackName: String) : Promise<Record<string, string> | undefined> {
    const client = new CloudFormationClient({})
    const input: DescribeStacksInput = {
        StackName: `${stackName}`,
      }
    return client.send(new DescribeStacksCommand(input))
    .then(res => {
        if (res && res.Stacks && res.Stacks.length === 1) {
            const stack = res.Stacks[0]
            const outputs: Record<string, string> = {}
            stack.Outputs?.forEach(output => outputs[output.ExportName || output.OutputKey || ''] = output.OutputValue || '')
            return outputs
        }
        return undefined
    }).catch(e => {
        return undefined
    })
}





