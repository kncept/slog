import { BlogProperties, HostnameProperties } from "../env-properties"

const properties : HostnameProperties & Partial<BlogProperties >= {
    publicUrl: 'https://localhost:3000/',
    reactAppApiEndpoint: 'https://localhost:8443/',
    blogName: 'SLog'
}

export default properties