import { Route53Client, ListHostedZonesCommand, ListHostedZonesRequest } from "@aws-sdk/client-route-53"

// yeah, this isn't super clever.
// but it should work for a bunch of things
const domainNameEndingsToScan = [
    '.com',
    '.com.au',
    '.org.au',
    '.co.nz',
    '.co.uk',
    '.local',
]

export type HostedZoneInfo = {
    id: string,
    name: string,
}

export async function listDomainNames() : Promise<Array<HostedZoneInfo>> {
    const client = new Route53Client({})
    const input: ListHostedZonesRequest = {}
    const command = new ListHostedZonesCommand(input)
    const response = await client.send(command)
    if (!response.HostedZones) return []
    return response.HostedZones.map(hz => {
        let id = hz.Id!
        if (id.startsWith('/hostedzone/')) id = id.substring('/hostedzone/'.length)
        let name = hz.Name!
        if (name.endsWith('.')) name = name.substring(0, name.length - 1)
        return {id, name} as HostedZoneInfo})
}

export function fullyQualifiedApiDomainName(): string {
    return toFqdn(process.env.REACT_APP_API_ENDPOINT || '')
}

export function fullyQualifiedFrontendDomainName(): string {
    return toFqdn(process.env.PUBLIC_URL || '')
}

function toFqdn(fqdnUrl: string): string {
    if (fqdnUrl === '') return ''
    let fqdn = `${fqdnUrl}`
    if (fqdn.startsWith('http://')) {
        fqdn = fqdn.substring(7)
    } else if (fqdn.startsWith('https://')) {
        fqdn = fqdn.substring(8)
    } else {
        throw new Error('Unable to parse as url: ' + fqdn)
    }
    if (fqdn.indexOf('/') != -1) {
        fqdn = fqdn.substring(0, fqdn.indexOf('/'))
    }
    if (fqdn.includes(":")) fqdn = fqdn.substring(0, fqdn.indexOf(":"))
    return fqdn
}

export function extractDomainNameFromFQDN(fqdn: string) : string {
    for(let i = 0; i < domainNameEndingsToScan.length; i++) {
        const knownTldEnding = domainNameEndingsToScan[i]
        if (fqdn.endsWith(knownTldEnding)) {
            const hostname = fqdn.substring(0, fqdn.length - knownTldEnding.length)
            if (hostname.lastIndexOf('.') != -1) {
                return fqdn.substring(hostname.lastIndexOf('.') + 1)
            } else {
                return fqdn
            }
        }
    }
    throw new Error(`Unable to determine hosted zone name from ${fqdn}`)
}

// TODO: support heirarchical zones
export async function matchHostedZoneToDomainUrl(fqdn: string) : Promise<HostedZoneInfo | undefined> {
    const existingDomainNames = await listDomainNames()
    const tld = extractDomainNameFromFQDN(fqdn)
    for(let i = 0; i < existingDomainNames.length; i++) {
        let existingDomainName = existingDomainNames[i].name
        if (existingDomainName.endsWith('.')) existingDomainName = existingDomainName.substring(0, existingDomainName.length - 1)
        if (existingDomainName === tld) return existingDomainNames[i]
    }
    return undefined
}





