import React, { useContext, useEffect, useState } from 'react'
import { Post } from '../../../interface/Model'
import { DeleteDraft, GetDraft, PublishDraft, SaveDraft, } from '../loaders'
import SimpleButton from '../components/SimpleButton'
import { useNavigate, useParams } from 'react-router-dom'
import './DraftList.css'
import Markdown, { MarkdownMode } from '../components/Markdown'
import FileUpload from '../components/FileUpload'
import AuthContext from '../AuthContext'



const DraftEdit: React.FC = () => {
  const { id } = useParams()
  const [draft, setDraft] = useState<Post>()
  const auth = useContext(AuthContext)
  const user = auth.currentUser
  const navigate = useNavigate()

  useEffect(() => {
    if (draft === undefined && user !== null) {
      GetDraft(user, id!).then(setDraft)
    }
  },
  [id, draft, user])

  if (draft === undefined) {
    return <div key='loading'>
      Draft Posts Loading
    </div>
  }

  const setMarkdown = (markdown: string) => {
    setDraft({...draft, markdown})
  }

  const saveDraft = () => {
    const updated = {...draft}
    SaveDraft(user!, updated)
    .then(() => setDraft(updated as Post))
  }
  const deleteDraft = () => {
    DeleteDraft(user!, id!)
    .then(() => navigate('/drafts'))
  }
  const publishDraft = () => {
    PublishDraft(user!, id!)
    .then((post) => navigate(`/posts/${post.id}`))
  }

  return <div>
    <form className='TitleEdit'>
      Title:
      <input name='title' value={draft.title} onChange={(e: React.ChangeEvent<any>) => {setDraft({...draft, title: e.target.value})}}/>
    </form>
    
    Content:
    <Markdown postId={draft.id} mode={MarkdownMode.EDIT} value={draft.markdown} setValue={setMarkdown} />

    Need a section to handle upload media references, and list uploaded files that are part of a post.
    
    <FileUpload draftId={draft.id}/>

    <SimpleButton text='Save' onClick={saveDraft} />
    <SimpleButton text='Delete' onClick={deleteDraft} />
    <SimpleButton text='PUBLISH' onClick={publishDraft} />

  </div>
}

export default DraftEdit