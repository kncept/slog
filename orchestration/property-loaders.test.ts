import { expect, test} from '@jest/globals' // expect, jest, test
import { toEnvPropertyPattern, unquotedStringify } from './property-loaders'

test("CamelCase property to ENV_PROPERTY", () => {
    expect(toEnvPropertyPattern("test")).toBe('TEST')
    expect(toEnvPropertyPattern("camelCase")).toBe('CAMEL_CASE')
    expect(toEnvPropertyPattern("ProperCase")).toBe('PROPER_CASE')
    expect(toEnvPropertyPattern("reactAppApiEndpoint")).toBe('REACT_APP_API_ENDPOINT')
})

test("Env Property String Value Conversion", () => {
    expect(unquotedStringify(null)).toBe('')
    expect(unquotedStringify(undefined)).toBe('')
    
    expect(unquotedStringify('simple value')).toBe('simple value')
    
    expect(unquotedStringify({})).toBe('{}')
    expect(unquotedStringify({
        simpleKey: 'simpleValue'
    })).toBe('{"simpleKey":"simpleValue"}')

    expect(unquotedStringify([])).toBe('[]')
    expect(unquotedStringify(['string'])).toBe('["string"]')
})