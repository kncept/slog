export type URL = string

export interface BlogProperties {
    adminUser: string

    // If you are hosting more than one instance of SuperSimpleBlog, you will need to name them all uniquely
    // default = SuperSimpleBlog
    blogName?: string

    reactAppLoginProviders?: Array<LoginProvider>
  
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
    clientId: string
    scopes: string, // space seperated list of scopes.
}
