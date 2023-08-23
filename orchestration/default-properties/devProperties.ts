import { BlogProperties, HostnameProperties } from "../env-properties"

const properties : HostnameProperties & Partial<BlogProperties >= {
    publicUrl: 'htto:localhost:3000/',
    reactAppApiEndpoint: 'http://localhost:8080/',
    blogName: 'SLog'
}

export default properties