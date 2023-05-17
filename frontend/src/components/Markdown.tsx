import React, { useMemo } from 'react'
import { SimpleMdeReact } from 'react-simplemde-editor'
import 'easymde/dist/easymde.min.css'
import CatchErr from './CatchErr'
import { ReactMarkdown } from 'react-markdown/lib/react-markdown'
import { renderToString } from 'react-dom/server'

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
    setValue: (value: string) => void
    mode: MarkdownMode,
}



// npm i react-simplemde-editor easymde
const useSimpleMde = true


// npm i @uiw/react-md-editor
const useReactMdEditor = false

const Markdown: React.FC<Props> = ({postId, value, setValue, mode}) => {

    let imageBase = `${apiBase}/image/post/${postId}/`
    if (mode === MarkdownMode.EDIT) {
        imageBase = `${apiBase}/image/draft/${postId}/`
    }


    // const options: SimpleMDE.Options = {}
    const autofocusNoSpellcheckerOptions = useMemo(() => {
        return {
            previewRender: (text: string) => {
                return renderToString(<ReactMarkdown transformImageUri={src => src.startsWith("http") ? src : `${imageBase}${src}`}>{text}</ReactMarkdown>)
            },
            autofocus: true,
            spellChecker: false,
        } // as SimpleMDE.Options;
      }, [imageBase])

    if (useSimpleMde && mode === MarkdownMode.EDIT) return <CatchErr>
        <SimpleMdeReact 
        options={autofocusNoSpellcheckerOptions}
        value={value}
        onChange={setValue} />
    </CatchErr>
    if (useSimpleMde && mode === MarkdownMode.VIEW) return <CatchErr>
        <ReactMarkdown transformImageUri={src => src.startsWith("http") ? src : `${imageBase}${src}`}>{value}</ReactMarkdown>
    </CatchErr>
    
    throw new Error('Unable to render MarkdownEditor')
}

export default Markdown