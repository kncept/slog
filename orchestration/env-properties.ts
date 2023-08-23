export type URL = string

export interface BlogProperties {
    adminUsers: Array<string>

    // If you are hosting more than one instance of Slog, you will need to name them all uniquely
    // default = Slog
    blogName?: string

    loginProviders: Array<LoginProvider>
  
}

export interface HostnameProperties {
    // Front end URI that the app will be hosted at.
    // eg: https://example.com/
    publicUrl: URL
    // Front end URI that the app will be hosted at.
    // eg: https://example.com/
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
