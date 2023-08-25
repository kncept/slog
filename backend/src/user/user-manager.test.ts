import { KeyManager, KeyName } from "../crypto/keypair-manager"
import { KeySpec, simpleDecode, simpleEncode } from '../crypto/crypto-utils'
import { UserManager } from './user-manager'
import { FilesystemStorage } from "../storage/storage"
import { tmpdir } from "os"
import { LocalFsOperations } from "../storage/filesystem-storage"
import { randomInt } from "crypto"

describe("UserManager", () => {
    const fileSystemStorage = new FilesystemStorage(tmpdir(), new LocalFsOperations())
    const keyManager = fileSystemStorage.KeyManager()
    const userManager = new UserManager(keyManager)


    describe("User ID Obscure(Encrypt) and Recover(Decrypt)", () => {
        const userIdToEncode = "TestUsers:" + randomInt(32767)
        let encrypted = ''
        it('consistently encrypts', async () => {
            encrypted = await userManager.ObscureId(userIdToEncode)
            expect(await userManager.ObscureId(userIdToEncode)).toEqual(encrypted)
            expect(await userManager.ObscureId(userIdToEncode)).toEqual(encrypted)
        })
        it('decrypts', async () => {
            expect(await userManager.ProviderId(encrypted)).toEqual(userIdToEncode)
        })
    })
   
})