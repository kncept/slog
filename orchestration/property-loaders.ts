import path from 'path'
import fs from 'fs'
import { snakeCase, toUpper } from 'lodash'

export enum EnvironmentName {
    dev = 'dev',
    prod = 'prod',
}

export const getDefinedProperties: (environmentName: EnvironmentName) => Record<string, string> = (environmentName) => {
    return loadDefaultExportFromFile(path.join(__dirname, '..', environmentName + "Properties.ts"))
}

export const getDefaultProperties: (environmentName: EnvironmentName) => Record<string, string> = (environmentName) => {
    return loadDefaultExportFromFile(path.join(__dirname, 'default-properties', environmentName + "Properties.ts"))
}

function loadDefaultExportFromFile(path: string) : Record<string, string> {
    if (fs.existsSync(path)) {
        const envProperties = require(path)
        if (envProperties.default !== undefined) {
            return envProperties.default as Record<string, string>
        }
    }
    return {}
}

export default function EnvProperties (environmentName: EnvironmentName) : Record<string, string> {
    const properties = {...process.env} as Record<string, string>
    
    // overwrite with 'set' properties
    const definedProperties = getDefinedProperties(environmentName)
    Object.keys(definedProperties).forEach(key => {
        const envPropertyName = toEnvPropertyPattern(key)
        properties[envPropertyName] = unquotedStringify(definedProperties[key])
    })

    // fill any any missing properties with defaults
    const defaultProperties = getDefaultProperties(environmentName)
    Object.keys(defaultProperties).forEach(key => {
        const envPropertyName = toEnvPropertyPattern(key)
        if (properties[envPropertyName] === undefined) {
            properties[envPropertyName] = unquotedStringify(defaultProperties[key])
        }
    })

    // now some property name hacking (for aws)
    // if (properties['AWS_REGION']) {
    //     properties['AWS_DEFAULT_REGION'] = properties['AWS_REGION']
    // }

    return properties
}

export function unquotedStringify(val: any): string {
    if (val === null) {
        return ''
    }
    if (val === undefined) {
        return ''
    }
    if (typeof val === 'string') {
        return val
    }
    return JSON.stringify(val)
    
}

export function toEnvPropertyPattern(name: string): string {
    return toUpper(snakeCase(name))
}
