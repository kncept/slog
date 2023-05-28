import React, { useMemo } from 'react'
import { SimpleMdeReact } from 'react-simplemde-editor'
import 'easymde/dist/easymde.min.css'
import CatchErr from './CatchErr'
import ReactMarkdown from 'react-markdown'
import { renderToString } from 'react-dom/server'
import rehypeSanitize from "rehype-sanitize"
import MDEditor from '@uiw/react-md-editor'

enum MarkdownImplementation {
    'react-markdown' = 'react-markdown',
    'react-md-editor' = 'react-md-editor',
}
let impl: MarkdownImplementation = MarkdownImplementation['react-md-editor']

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

    

    // const options: SimpleMDE.Options = {}
    const autofocusNoSpellcheckerOptions = useMemo(() => {
        const imageBase = mode === MarkdownMode.EDIT ? `${apiBase}/image/draft/${postId}/` : `${apiBase}/image/post/${postId}/`
        const transformImageUri = (src: string) => src.startsWith("http") ? src : `${imageBase}${src}`
        return {
            previewRender: (text: string) => {
                return renderToString(<ReactMarkdown transformImageUri={transformImageUri}>{text}</ReactMarkdown>)
            },
            autofocus: true,
            spellChecker: false,
        } // as SimpleMDE.Options;
      }, [ mode, postId ])

      const imageBase = mode === MarkdownMode.EDIT ? `${apiBase}/image/draft/${postId}/` : `${apiBase}/image/post/${postId}/`
      const transformImageUri = (src: string) => src.startsWith("http") ? src : `${imageBase}${src}`

      if (impl === MarkdownImplementation['react-md-editor']) {
      if (mode === MarkdownMode.EDIT) return <div data-color-mode='light'>
        <MDEditor
          value={value}
          onChange={(v) => setValue!(v || '')}
          previewOptions={{
              transformImageUri,
              rehypePlugins: [[rehypeSanitize]],
          }}
          />
        </div>
      if (mode === MarkdownMode.VIEW) return <div data-color-mode='light'>
        <MDEditor.Markdown
          source={value} 
          style={{ whiteSpace: 'pre-wrap' }}
          transformImageUri={transformImageUri}
          rehypePlugins={[rehypeSanitize]}
          />
          </div>
    }
    if (impl === MarkdownImplementation['react-markdown']) {
    if (mode === MarkdownMode.EDIT) return <CatchErr>
        <SimpleMdeReact 
        options={autofocusNoSpellcheckerOptions}
        value={value}
        onChange={setValue} />
    </CatchErr>
    if (mode === MarkdownMode.VIEW) return <CatchErr>
        <ReactMarkdown transformImageUri={transformImageUri}>{value}</ReactMarkdown>
    </CatchErr>
    }
    
    throw new Error('Unable to render MarkdownEditor')
}

export default Markdown