import React, { useContext, useEffect, useState } from 'react'
import { Post } from '../../../interface/Model'
import { Loader } from '../loaders/loaders'
import SimpleButton from '../components/SimpleButton'
import { useNavigate, useParams } from 'react-router-dom'
import './DraftEdit.css'
import Markdown, { MarkdownMode } from '../components/Markdown'
import FileUpload from '../components/FileUpload'
import AuthContext from '../AuthContext'
import Loading from '../components/Loading'
import Contributors from '../components/Contributors'
import DraftMediaDisplay from '../components/DraftMediaDisplay'

const DraftEdit: React.FC = () => {
  const { id } = useParams()
  const [draft, setDraft] = useState<Post>()

  const [markdown, setMarkdown] = useState(draft?.markdown || '')
  const [title, setTitle] = useState(draft?.title || '')

  const auth = useContext(AuthContext)
  const navigate = useNavigate()

  const saveable = markdown !== (draft?.markdown || '') || title !== (draft?.title || '')
  const publishable = markdown !== '' && title !== '' && !saveable

  useEffect(() => {
    if (draft === undefined && !auth.isLoading()) {
      Loader(auth.currentUser()).GetDraft(id!).then(d => {
        setDraft(d)
        setTitle(d.title)
        setMarkdown(d.markdown)
      })
      .catch (e => {
        console.log("Error Loading draft", e)
      })
    }
  },
  [id, draft, auth])

  const onUpload = (filename: string) => {
    if (draft!.attachments.indexOf(filename) === -1) {
      draft!.attachments.push(filename)
      setDraft({...draft!})
    }
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
    Loader(auth.currentUser()).SaveDraft(updated.id, updated)
    .then(() => setDraft(updated))
  }

  const deleteDraft = () => {
    Loader(auth.currentUser()).DeleteDraft(id!)
    .then(() => navigate('/drafts'))
  }

  const publishDraft = () => {
    Loader(auth.currentUser()).PublishDraft(id!)
    .then((post) => navigate(`/posts/${post.id}`))
  }


  const insertAttachment = (attachment: string) => {
    // Hmm... cant use unknown url schemes... sigh
    setMarkdown(markdown + `\n![${attachment}](_/${attachment})`)
  }
  const deleteAttachment = (filename: string) => {
    Loader(auth.currentUser()).RemoveAttachment(id!, filename)
    draft.attachments = draft.attachments.filter(attachment => attachment !== filename)
    setDraft({...draft})
  }

  const removeContributor = (contributorId: string) => {
    console.log(`${auth.currentUser()?.id()} --> ${contributorId}  `)
    Loader(auth.currentUser()).RemoveContributor(id!, contributorId)
    draft.contributors = draft.contributors.filter(contributor => contributor.id !== contributorId)
    setDraft({...draft})
  }

  return <div>
    <form className='TitleEdit' onSubmit={e => {e.preventDefault(); return false;}}>
      Title:
      <input name='title' value={title} onChange={(e: React.ChangeEvent<any>) => {setTitle(e.target.value)}}/>
    </form>
    
    Content:
    <Markdown postId={draft.id} mode={MarkdownMode.EDIT} value={markdown} setValue={setMarkdown} />
    <Contributors contributors={draft?.contributors || []} removeContributor={removeContributor}/>

    <DraftMediaDisplay attachments={draft?.attachments || []} insertAttachment={insertAttachment} deleteAttachment={deleteAttachment}/>
    <FileUpload draftId={draft.id} onUpload={onUpload} />

    <div className='DraftControlButtons'>
    <SimpleButton text='Save' onClick={saveDraft} disabled={!saveable} style={{color: !saveable? 'red' : 'green'}}/>
    <SimpleButton text='Delete' onClick={deleteDraft} />
    <SimpleButton text='Publish' onClick={publishDraft} disabled={!publishable} style={{color: publishable? 'green' : 'red'}}/>
    </div>

  </div>
}

export default DraftEdit