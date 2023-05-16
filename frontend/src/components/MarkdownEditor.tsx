import React, { useMemo } from 'react'
import SimpleMDE, { SimpleMdeReact } from 'react-simplemde-editor'
import "easymde/dist/easymde.min.css"
// import MDEditor from '@uiw/react-md-editor'
import CatchErr from './CatchErr'
import { ReactMarkdown } from 'react-markdown/lib/react-markdown'
import { renderToString } from 'react-dom/server'


export enum MarkdownMode {
    EDIT = 'EDIT',
    VIEW = 'VIEW',
}

type Props = {
    value: string
    setValue: (value: string) => void
    mode: MarkdownMode,
}



// npm i react-simplemde-editor easymde
const useSimpleMde = true


// npm i @uiw/react-md-editor
const useReactMdEditor = false

const MarkdownEditor: React.FC<Props> = ({value, setValue, mode}) => {
    // const options: SimpleMDE.Options = {}
    const autofocusNoSpellcheckerOptions = useMemo(() => {
        return {
            previewRender: (text: string) => {
                return renderToString(<ReactMarkdown>{text}</ReactMarkdown>)
            },
            autofocus: true,
            spellChecker: false,
        } // as SimpleMDE.Options;
      }, [])

    if (useSimpleMde && mode === MarkdownMode.EDIT) return <CatchErr>
        <SimpleMdeReact 
        options={autofocusNoSpellcheckerOptions}
        value={value}
        onChange={setValue} />
    </CatchErr>
    if (useSimpleMde && mode === MarkdownMode.VIEW) return <CatchErr>
        <ReactMarkdown>{value}</ReactMarkdown>
    </CatchErr>

    // if (useReactMdEditor) return <CatchErr>
    //     <MDEditor value={value} onChange={(v) => {
    //         console.log('setting', v)
    //         setValue(v || '')
    //     }} />
    //     {/* <MDEditor.Markdown source={value} style={{ whiteSpace: 'pre-wrap' }} /> */}
    // </CatchErr>
    throw new Error("Unable to render MarkdownEditor")
}

export default MarkdownEditor