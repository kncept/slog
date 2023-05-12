import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ButtonLink from '../components/ButtonLink'


const RightBar: React.FC = () => {
  const navigate = useNavigate()

  // if logged in show 'drafts'
  
  return (
    <div className='RightBar'> 
        <span>
            <ul>
                <li><ButtonLink text='Drafts and New Posts' to='/drafts'/></li>
                <li><Link to={'/drafts'}>Drafts and New Posts</Link></li>
            </ul>
        </span>
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