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
    updatedTs: number // milliseconds UTC
    title: string
    attachments: Array<string>
    contributors: Array<Contributor>
}


export interface LoginProvider {
    name: string

    // type: string = oauth2 / oidc
    authorizeUrl: string
}