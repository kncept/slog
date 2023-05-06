import React from 'react'
import { Link } from 'react-router-dom'


const RightBar: React.FC = () => {
  
  return (
    <div className='RightBar'>
        Rightbar Content (todo = componentize)<br/>
        <Link to='/'>Home</Link>
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