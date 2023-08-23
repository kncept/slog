import React from 'react'
import 'easymde/dist/easymde.min.css'
import CatchErr from './CatchErr'
import MDEditor from '@uiw/react-md-editor'
import rehypeSanitize from 'rehype-sanitize'

let apiBase = process.env.REACT_APP_API_ENDPOINT || ""
while (apiBase.endsWith("/")) {
  apiBase = apiBase.slice(0, -1)
}

export enum MarkdownMode {
    EDIT = 'EDIT',
    VIEW = 'VIEW',
}

type Props = {
    postId: string
    value: string
    setValue?: (value: string) => void
    mode: MarkdownMode,
}

const Markdown: React.FC<Props> = ({postId, value, setValue, mode}) => {
    if (mode === MarkdownMode.EDIT && setValue === undefined) throw new Error('Must defined setValue when editing')

    const onChange = (v: string | undefined) => {
        // reset image list
        if (setValue) setValue(v || '')
    }

      
      const transformImageUri = (src: string) => {
        // console.log(`transformImageUri ${src}`)
        if (
            src.startsWith('http:') ||
            src.startsWith('https:')
        ) return src

        if (src.startsWith('_/')) {
        src = postId + src.substring(1)
        const imageBase = mode === MarkdownMode.EDIT ? `${apiBase}/image/draft/` : `${apiBase}/image/post/`
        return `${imageBase}${src}`
        } else {
        return `${apiBase}/image/post/${src}`
        }
      }

      if (mode === MarkdownMode.EDIT) return <CatchErr>
        <div data-color-mode='light'>
            <MDEditor
            value={value}
            onChange={onChange}
            previewOptions={{
                transformImageUri,
                rehypePlugins: [[rehypeSanitize]],
            }}
            />
        </div>
    </CatchErr>
      if (mode === MarkdownMode.VIEW) return <CatchErr>
        <div data-color-mode='light'>
            <MDEditor.Markdown
            source={value} 
            style={{ whiteSpace: 'pre-wrap' }}
            transformImageUri={transformImageUri}
            rehypePlugins={[rehypeSanitize]}
            />
        </div>
        </CatchErr>
    
    throw new Error('Unable to render MarkdownEditor')
}

export default Markdown