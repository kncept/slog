import path from 'path'
import fs from 'fs'
import {snakeCase, toUpper} from 'lodash'

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
        properties[toEnvPropertyPattern(key)] = definedProperties[key]
    })

    // fill any any missing properties with defaults
    const defaultProperties = getDefaultProperties(environmentName)
    Object.keys(defaultProperties).forEach(key => {
        if (properties[toEnvPropertyPattern(key)] === undefined) {
            properties[toEnvPropertyPattern(key)] = defaultProperties[key]
        }
    })

    return properties
}

function toEnvPropertyPattern(name: string): string {
    return toUpper(snakeCase(name))
}
