// DATES are ISO dates. 
// eg: Luxon's DateTime.toISO()
//

export interface Identified {
    id: string
}

export interface Contributor extends Identified {
    name: string
    email: string | undefined
}

export interface Post extends PostMetadata {
    markdown: string
}

export interface PostMetadata extends Identified {
    version: string //semver version
    updatedTs: number // milliseconds UTC
    title: string
    attachments: Array<string>
    contributors: Array<Contributor>
}

export type PostUpdatableFields = Pick<Post, 'markdown' | 'title'> & Identified

export interface LoginOptions {
    providers: Array<LoginProvider>
    verificationKeys: Array<string>
}

export interface LoginProvider {
    name: string

    // type: string = oauth2 / oidc
    authorizeUrl: string
}

export interface JwtAuthClaims {
    sub: string // JWT 'sub' claim (subject)
    tok?: string | undefined // upstream token
    iat: number // issued at
    iss: string // super-simple-blog

    name: string // display name
    admin: boolean // use is authenticated as an admin
    email: string
}
