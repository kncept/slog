import React from 'react'
import { Link } from 'react-router-dom'


const RightBar: React.FC = () => {

  // if logged in show 'drafts'
  
  return (
    <div className='RightBar'> 
        <span>
            <ul>
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