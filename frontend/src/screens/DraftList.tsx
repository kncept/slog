import React, { useContext, useEffect, useReducer, useState } from 'react'
import { PostMetadata } from '../../../interface/Model'
import Loader from '../loaders/loaders'
import ButtonLink from '../components/ButtonLink'
import SimpleButton from '../components/SimpleButton'
import { useNavigate } from 'react-router-dom'
import './DraftList.css'
import AuthContext from '../AuthContext'
import Loading from '../components/Loading'

const formReducer = (state: any, event: React.ChangeEvent<any>) => {
  return {
    ...state,
    [event.target.name]: event.target.value
  }
 }

const DraftList: React.FC = () => {
  const [drafts, setDrafts] = useState<Array<PostMetadata>>()
  const [formData, setFormData] = useReducer(formReducer, {})
  const navigate = useNavigate()
  const auth = useContext(AuthContext)
  const user = auth.currentUser!

  useEffect(() => {
    if (drafts === undefined) {
      Loader.ListDrafts(user).then(setDrafts)
    }
  },
  [drafts, user])

  const createNew = (title: string) => {
    if (title === undefined || title.trim() === '') {
      // TODO: input validation feedback
    } else {
      Loader.CreateDraft(user, title.trim()).then(draft => navigate(`/drafts/${draft.id}`))
    }
  }
  
  if (drafts === undefined) {
    return <Loading />
  }

  return <div>
      {drafts.map((draft, index) => {return <div key={index}>
        <form className='NewDraft'>
        <ButtonLink to={`/drafts/${draft.id}`} text='Edit Draft' />{draft.title}
        </form>
      </div>})}
      {drafts.length === 0 && <div>
        No Drafts yet
      </div>}
      {drafts.length < 5 && <div>
        <form className='NewDraft' onChange={setFormData} onSubmit={(e) => {
          e.preventDefault();
          const form = e.target as any
          createNew(form.title.value)
          return false
          }}>
        <SimpleButton text="Draft New" onClick={() => createNew(formData.title)}/>
          <input name='title'/>
        </form>
        
      </div>}
      {drafts.length >= 5 && <div>
        Please complete a draft before starting any new ones
      </div>}

  </div>
}

export default DraftList