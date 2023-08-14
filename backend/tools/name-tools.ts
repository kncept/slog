import { startCase } from 'lodash'

export function stackNameForBackend() {
  return `${superSimpleBaseBlogName()}-Backend`
}
export function stackNameForHostedZone() {
  return `${superSimpleBaseBlogName()}-HostedZone`
}
export function stackNameForFrontendCertificate() {
  return `${superSimpleBaseBlogName()}-FrontendCert`
}
export function stackNameForFrontend() {
  return `${superSimpleBaseBlogName()}-Frontend`
}

export function superSimpleBaseBlogName(): string {
    let blogName = process.env.BLOG_NAME || 'SLog'
    blogName = startCase(blogName)
    blogName = blogName.replace(/\s/g,'')
    // blogName = snakeCase(blogName1)
    return blogName
  }
