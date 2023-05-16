import React, { useEffect, useState } from 'react'
import { Post } from '../../../interface/Model'
import { CreateDraft, GetDraft, SaveDraft, } from '../loaders'
import SimpleButton from '../components/SimpleButton'
import { useParams } from 'react-router-dom'
import './DraftList.css'
import MarkdownEditor, { MarkdownMode } from '../components/MarkdownEditor'



const DraftEdit: React.FC = () => {
  const { id } = useParams()
  const [draft, setDraft] = useState<Post>()
  const [markdown, setMarkdown] = useState<string>('')

  useEffect(() => {
    if (draft === undefined) {
      GetDraft(id || '').then(draft => {setDraft(draft); setMarkdown('post.value??')})
    }
  },
  [id, draft])

  if (draft === undefined) {
    return <div key='loading'>
      Draft Posts Loading
    </div>
  }

  const save = () => {
    const updated = {...draft}
    SaveDraft(updated).then(() => setDraft(updated as Post))
  }

  return <div>
    <form className='TitleEdit'>
      Title:
      <input name='title' value={draft.title} onChange={(e: React.ChangeEvent<any>) => {setDraft({...draft, title: e.target.value})}}/>
    </form>
    
    Content:
    <MarkdownEditor mode={MarkdownMode.EDIT} value={markdown} setValue={setMarkdown} />

    Need a section to upload media references

    <SimpleButton text='Save' onClick={() => save()} />

  </div>
}

export default DraftEdit