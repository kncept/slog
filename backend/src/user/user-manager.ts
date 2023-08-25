import { KeyManager, KeyName } from "../crypto/keypair-manager"
import { KeySpec, simpleDecode, simpleEncode } from '../crypto/crypto-utils'


export interface User {
    obscuredId: () => Promise<ObscuredId>
    providerId: () => Promise<string>

    // login count 

    // first seen
    // last seen

    // 3 types of users - Admin, Author, and Anyone else logged in (eg: commenter)
    isAdmin: () => boolean
    isAuthor: () => boolean
}

type ObscuredId = string

export class UserManager {
    userKey: Promise<KeySpec>

    constructor(keyManager: KeyManager){
        this.userKey = keyManager.ReadKey(KeyName.user)
    }

    ObscureId: (providerId: string) => Promise<ObscuredId> = async (providerId) => this.userKey.then(key => simpleEncode(key, reverseString(providerId)))
    ProviderId: (obscuredId: ObscuredId) => Promise<string> = async (obscuredId) => this.userKey.then(key => reverseString(simpleDecode(key, obscuredId)))

    GetUser: (obscuredId: ObscuredId) => Promise<User> = async (obscuredId) => {
        // gotta LOAD something perhaps? TODO
        const cache: any = {
            providerId: null
        }
        return {
            obscuredId: () => Promise.resolve(obscuredId),
            providerId: () => {
                if (cache.providerId == null) {
                    cache.providerId = this.ProviderId(obscuredId)
                }
                return cache.providerId
            },
            isAdmin: () => false,
            isAuthor: () => false,
        }
    }

    SaveUser: (user: User) => Promise<void> = async (user) => {
        // gotta SAVE something perhaps? TODO
    }

}

function reverseString(str: string): string {
    return str.split("").reverse().join("");
}
