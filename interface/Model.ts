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

export interface Post extends Identified {
    title: string
    postedMs: string // luxon ?
    updatedMs: string
    markdown: string // markdown content
    contributors: Array<Contributor>
}

export interface PostMetadata extends Identified {
    createdDate: string // yyyymmdd
    title: string
    attachments: Array<string>
}
