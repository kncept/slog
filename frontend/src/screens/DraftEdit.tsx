import React, { useEffect, useReducer, useState } from 'react'
import { Identified, Post } from '../../../interface/Model'
import { CreateDraft, GetDraft, ListDrafts } from '../loaders'
import ButtonLink from '../components/ButtonLink'
import SimpleButton from '../components/SimpleButton'
import { useNavigate, useParams } from 'react-router-dom'
import './DraftList.css'



const DraftEdit: React.FC = () => {
  const { id } = useParams()
  const [draft, setDraft] = useState<Post | undefined>()
  const navigate = useNavigate()

  useEffect(() => {
    if (draft === undefined) {
      GetDraft(id || '').then(setDraft)
    }
  },
  [id, draft])

  if (draft === undefined) {
    return <div key='loading'>
      Draft Posts Loading
    </div>
  }

  return <div>
     
     Got draft to edit: {JSON.stringify(draft)}

  </div>
}

export default DraftEdit