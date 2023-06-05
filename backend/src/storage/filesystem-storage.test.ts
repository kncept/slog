import * as os from 'os'
import * as fs from 'fs'
import * as path from 'path'
import { randomUUID } from 'crypto'
import { LocalFsOperations } from './filesystem-storage'

function tmpDir(id?: string | undefined) {
    if (!id) id = randomUUID().toString()
    const dir = path.join(os.tmpdir(), id)
    fs.mkdirSync(dir, {recursive: true})
    return dir
}

test('should list an empty directory', async () => {
    const localFs = new LocalFsOperations()
    const entries = await localFs.list(tmpDir())
    expect(entries).toBeDefined()
    expect(entries.length).toBe(0)
})

test('can write and read', async () => {
    const localFs = new LocalFsOperations()
    const dir = tmpDir()
    const data = randomUUID().toString()
    await localFs.write(path.join(dir, 'file'), data)
    const read = await localFs.read(path.join(dir, 'file'))
    expect(read.toString()).toBe(data)
})