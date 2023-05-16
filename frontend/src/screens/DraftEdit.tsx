import React, { useEffect, useReducer, useState } from 'react'
import { Identified, Post } from '../../../interface/Model'
import { CreateDraft, GetDraft, ListDrafts } from '../loaders'
import ButtonLink from '../components/ButtonLink'
import SimpleButton from '../components/SimpleButton'
import { useNavigate, useParams } from 'react-router-dom'
import './DraftList.css'
import MarkdownEditor, { MarkdownMode } from '../components/MarkdownEditor'



const DraftEdit: React.FC = () => {
  const { id } = useParams()
  const [draft, setDraft] = useState<Post>()
  const [markdown, setMarkdown] = useState<string>('')
  const navigate = useNavigate()

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