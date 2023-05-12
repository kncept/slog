import React, { useEffect, useState } from 'react'
import {Post} from '../../../interface/Model'
import {ListDrafts} from '../loaders'
import ButtonLink from '../components/ButtonLink'


const DraftList: React.FC = () => {
  const [drafts, setDrafts] = useState<Array<Post> | undefined>()

  useEffect(() => {
    if (drafts === undefined) {
      ListDrafts().then(setDrafts)
    }
  },
  [drafts])
  
  if (drafts === undefined) {
    return <div key='loading'>
      Draft Posts Loading
    </div>
  }

  return <div>
      {drafts.map((draft, index) => {return <div key={index}>
        <ButtonLink to={`/drafts/${draft.id}`}>Edit</ButtonLink> {draft.title}
      </div>})}
      {drafts.length === 0 && <div>
        No Drafts yet
      </div>}
      <div>
        <ButtonLink to='/drafts'>New Post</ButtonLink>
      </div>

  </div>
}

export default DraftList