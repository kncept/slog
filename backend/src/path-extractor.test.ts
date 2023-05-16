import { expect, test } from '@jest/globals' // expect, jest, test
import PathExtractor from './path-extractor'

test('trims off leading path slash', () => {
    expect(new PathExtractor('/').current()).toBe('')
    expect(new PathExtractor('/with').current()).toBe('with')
})

test('errors when no leading slash', () => {
    try {
        new PathExtractor('none').current()
        expect(false).toBe(true) // did not throw error, fail test
    } catch (err) { }
})

test('trims off trailing slash', () => {
    expect(new PathExtractor('/notrail').current()).toBe('notrail')
    expect(new PathExtractor('/trailing/').current()).toBe('trailing')
})

test ('rest or url is blank irrespective of trailing slash', () => {
    expect(new PathExtractor('/notrail').rest()).toBe('')
    expect(new PathExtractor('/trailing/').rest()).toBe('')
})

test('able to token walk url', () => {
    const extractor = new PathExtractor('/url/path/to/walk')
    
    expect(extractor.current()).toBe('url')
    expect(extractor.current()).toBe('url')

    expect(extractor.rest()).toBe('/path/to/walk')
    expect(extractor.next()!.current()).toBe('path')
    expect(extractor.next()!.rest()).toBe('/to/walk')
})




