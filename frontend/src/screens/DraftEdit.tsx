import React, { useContext, useEffect, useState } from 'react'
import { Post } from '../../../interface/Model'
import Loader from '../loaders/loaders'
import SimpleButton from '../components/SimpleButton'
import { useNavigate, useParams } from 'react-router-dom'
import './DraftEdit.css'
import Markdown, { MarkdownMode } from '../components/Markdown'
import FileUpload from '../components/FileUpload'
import AuthContext from '../AuthContext'
import Loading from '../components/Loading'
import Contributors from '../components/Contributors'

const DraftEdit: React.FC = () => {
  const { id } = useParams()
  const [draft, setDraft] = useState<Post>()

  const [markdown, setMarkdown] = useState(draft?.markdown || '')
  const [title, setTitle] = useState(draft?.title || '')

  const auth = useContext(AuthContext)
  const user = auth.currentUser
  const navigate = useNavigate()

  const saveable = markdown !== (draft?.markdown || '') || title !== (draft?.title || '')
  const publishable = markdown !== '' && title !== '' && !saveable

  useEffect(() => {
    if (draft === undefined && user !== null) {
      Loader.GetDraft(user, id!).then(d => {
        setDraft(d)
        setTitle(d.title)
        setMarkdown(d.markdown)
      })
    }
  },
  [id, draft, user])

  const onUpload = (fileName: string) => {
    draft!.attachments.push(fileName)
  }

  if (draft === undefined) {
    return <Loading />
  }

  const saveDraft = () => {
    const updated: Post = {
      ...draft,
      title,
      markdown,
    }
    Loader.SaveDraft(user!, updated.id, updated)
    .then(() => setDraft(updated))
  }

  const deleteDraft = () => {
    Loader.DeleteDraft(user!, id!)
    .then(() => navigate('/drafts'))
  }

  const publishDraft = () => {
    Loader.PublishDraft(user!, id!)
    .then((post) => navigate(`/posts/${post.id}`))
  }

  return <div>
    <form className='TitleEdit' onSubmit={e => {e.preventDefault(); return false;}}>
      Title:
      <input name='title' value={title} onChange={(e: React.ChangeEvent<any>) => {setTitle(e.target.value)}}/>
    </form>
    
    Content:
    <Markdown postId={draft.id} mode={MarkdownMode.EDIT} value={markdown} setValue={setMarkdown} />
    <Contributors contributors={draft.contributors} />

    Need a section to handle upload media references, and list uploaded files that are part of a post.
    
    <FileUpload draftId={draft.id} onUpload={onUpload}/>

    {/* <form className='NewDraft' onChange={setFormData} onSubmit={(e) => {console.log(e); return false;}}>
      <SimpleButton text="Draft New" onClick={() => createNew(formData.title)}/>
        <input name='title'/>
      </form> */}
    <div className='DraftControlButtons'>
    <SimpleButton text='Save' onClick={saveDraft} disabled={!saveable} style={{color: !saveable? 'red' : 'green'}}/>
    <SimpleButton text='Delete' onClick={deleteDraft} />
    <SimpleButton text='Publish' onClick={publishDraft} disabled={!publishable} style={{color: publishable? 'green' : 'red'}}/>
    </div>

  </div>
}

export default DraftEdit