import DateTime from 'luxon'

export interface Identified {
    id: string
}

export interface Contributor extends Identified {
    name: string
    email: string | undefined
}

export interface Post extends Identified {
    title: string
    created: DateTime
    updated: DateTime
    content: Array<PostPart>
    contributors: Array<Contributor>
}

export enum PostContentType {
    Markdown = "MD",
    Image = "Img",
}

export interface PostPart {
    type: PostContentType
    content: string
}