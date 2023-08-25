// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import { stringify } from 'querystring';

// import { ArrayBuffer, TextDecoder, TextEncoder, Uint8Array } from 'util';
import { TextDecoder, TextEncoder } from 'util';

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as any
// global.ArrayBuffer = ArrayBuffer
// global.Uint8Array = Uint8Array

jest.mock('@uiw/react-md-editor', () => {
    return {
        __esModule: true,
        ReactMarkdown: (arg: any) => {console.log('@uiw/react-md-editor mocking any:', arg); return ''},
        default: jest.fn(() => '@uiw/react-md-editor mocked baz'),
        foo: 'mocked foo',
      }
})

jest.mock('rehype-sanitize', () => {
    return {
        __esModule: true,
        rehypeSanitize: (arg: any) => {console.log('rehypeSanitize mocking any:', arg); return ''},
        default: jest.fn(() => 'rehypeSanitize mocked baz'),
        foo: 'mocked foo',
      }
})

// jest.mock('fetch-ponyfill', () => {
//     class Headers {
//         constructor(args: any) {
//         }
//     }
//     return {
//         __esModule: true,
//         default: () => { return {
//             fetch: () => Promise.resolve({
//                 ok: false,
//                 json: () => {}
//             }),
//             Headers,
//         }}
//       }
// })


