import { matchHostedZoneToDomainUrl } from "../backend/tools/domain-tools";


async function main() {
    const hostedZoneInfo = await matchHostedZoneToDomainUrl()
    if (hostedZoneInfo) {
        let domainName = hostedZoneInfo.name
        if (domainName.endsWith('.')) domainName = domainName.substring(0, domainName.length - 1)
            console.log(domainName)
    }
}

main()