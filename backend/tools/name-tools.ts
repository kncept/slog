import { startCase } from 'lodash'

export function baseSlogName(): string {
    let blogName = process.env.BLOG_NAME || 'SLog'
    blogName = startCase(blogName)
    blogName = blogName.replace(/\s/g,'')
    // blogName = snakeCase(blogName1)
    return blogName
  }
