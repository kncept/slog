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
    // till then, just use ONE LoginProvider
    reactAppLoginProvider: LoginProvider
    // reactAppLoginProviders?: Array<LoginProvider>
  
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
    awsDefaultRegion: string
}


export interface LoginProvider { //ugh - react app prefix
    providerName: string,

    authority: URL // eg: https://github.com/login (from https://github.com/login/oauth)
    clientId: string
    redirectUri: URL
    // scopes: string // space seperated list of scopes.
}
