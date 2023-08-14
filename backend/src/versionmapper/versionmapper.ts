const semverGt = require('semver/functions/gt')

type MappedVersion<T> = {
    version: string,
    value: T,
}

export default class VersionMapper<T> {
    data: Array<MappedVersion<T>> = []

    AddVersion(version: string, value: T) {
        this.data.push({
            version,
            value,
        })
    }

    GetVersion(version: string | undefined): T {
        // when version is undefined, use the latest version
        if (!version) {
            return this.data[this.data.length - 1].value
        }

        let last: MappedVersion<T> = this.data[0]
        for (let i = 0; i < this.data.length && !semverGt(this.data[i].version, version); i++) {
            last = this.data[i]
        }
        return last.value
    }

}
