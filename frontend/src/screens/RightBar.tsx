import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import ButtonLink from '../components/ButtonLink'
import AuthContext from '../AuthContext'


const RightBar: React.FC = () => {
    const auth = useContext(AuthContext)
    let isAdmin = auth.currentUser?.admin || false

  // if logged in show 'drafts'  
  return (
    <div className='RightBar'> 
        {isAdmin && <span>
            <ul>
                <li><ButtonLink text='Drafts and New Posts' to='/drafts'/></li>
            </ul>
        </span>}
        <span>
            <ul>
                <li><Link to={'/posts/000'}>000 post</Link></li>
                <li><Link to={'/posts/123'}>123 post</Link></li>
            </ul>
        </span>
    </div>
  )
}

export default RightBar;