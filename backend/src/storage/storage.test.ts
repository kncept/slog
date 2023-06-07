import { randomUUID } from 'crypto'
import * as os from 'os'
import * as fs from 'fs'
import * as path from 'path'
import { LocalFsOperations } from './filesystem-storage'
import { FilesystemStorage } from './storage'

function tmpDir(id?: string | undefined) {
    if (!id) id = randomUUID().toString()
    const dir = path.join(os.tmpdir(), id)
    fs.mkdirSync(dir, {recursive: true})
    return dir
}

test('FilesystemStorage', async () => {
    const fileSystemStorage = new FilesystemStorage(tmpDir(), new LocalFsOperations())
    expect(fileSystemStorage).toBeDefined()
    
})
