export type URL = string

export interface BlogProperties {
    adminUser: string

    // If you are hosting more than one instance of SuperSimpleBlog, you will need to name them all uniquely
    // default = SuperSimpleBlog
    blogName?: string

    // TODO: possibly roll our own oauth
    // because switching providers _should_ be easy
    // but apparently isn't
    // eg: https://tasoskakour.com/blog/react-use-oauth2
    //
    loginProviders: Array<LoginProvider>
  
}

export interface FrontendProperties {
    // Front end URI that the app will be hosted at.
    // eg: https://example.com/
    publicUrl: URL
    reactAppApiEndpoint: URL
}

export interface AwsAccessKeyProperties {
    awsAccessKeyId: string
    awsSecretAccessKey: string
    awsRegion: string
}



export type LoginProvider = OidcProvider | OAuth2Provider

// TODO: Support direct Oidc as well
interface OidcProvider {
    name: string
    type: 'oidc'

    baseUrl: string // config grabbed from /.well-known/openid-configuration

    clientId: string // the public client id?
}

interface OAuth2Provider {
    name: string
    type: 'oauth2'

    clientId: string
    clientSecret: string
    authorizeUrl: string // first GET redirect
    accessTokenUrl: string // swap for token
    userDetailsUrl: string // use token to get user info

    claims: string
}
