
export default class PathExtractor {
    path: string
    parent: PathExtractor
    constructor(path: string) {
        if (!path.startsWith('/')) {
            throw new Error('Path element must start with a leading slash: ' + path)
        }
        this.path = path // path.substring(1)
    }

    current(): string {
        const slashIndex = this.path.indexOf("/", 1) // path
        const hashIndex = this.path.indexOf('#') // anchor
        const queIndex = this.path.indexOf('?') // params

        let endIndex = this.path.length

        if (slashIndex != -1) {
            endIndex = Math.min(endIndex, slashIndex)
        }
        if (hashIndex != -1) {
            endIndex = Math.min(endIndex, hashIndex)
        }
        if (queIndex != -1) {
            endIndex = Math.min(endIndex, queIndex)
        }
        return this.path.substring(1, endIndex)
    }

    hasMorePath(): boolean {
        return this.rest() !== ''
    }

    rest(): string {
        const prefix = this.current()
        const rest = this.path.substring(prefix.length + 1)

        // hiding '/' is part of the point
        if (rest === "/" || rest.startsWith('/#') || rest.startsWith('/?') || rest.startsWith('#') || rest.startsWith('?')) {
            return ''
        }

        return rest
    }

    next(): PathExtractor {
        const rest = this.rest()
        if (rest === '') {
            throw new Error('No Next PathElement to extract')
        }
        const child = new PathExtractor(rest)
        child.parent = this
        return child
    }

    
}
