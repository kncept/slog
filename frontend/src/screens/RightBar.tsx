import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ButtonLink from '../components/ButtonLink'
import AuthContext from '../AuthContext'
import { PostMetadata } from '../../../interface/Model'
import Loading from '../components/Loading'
import { Loader } from '../loaders/loaders'


const RightBar: React.FC = () => {
    const auth = useContext(AuthContext)
    let admin = auth.currentUser?.admin() || false

    const [posts, setPosts] = useState<Array<PostMetadata>>()
    useEffect(() => {
        if (posts === undefined) {
            Loader(auth.currentUser).ListPosts().then(setPosts)
        }
    }, [posts, auth.currentUser])

  // if logged in show 'drafts'  
  return (
    <div className='RightBar'> 
        {admin && <span>
            <ul>
                <li><ButtonLink text='Drafts and New Posts' to='/drafts'/></li>
            </ul>
        </span>}
        {posts !== undefined && posts.length === 0 && <span>
            <ul>
                <li>
                    No Posts
                </li>
            </ul>
        </span>}
        {posts !== undefined && posts.length > 0 && <span>
            <ul>
                {posts.map(post => {return <li key={post.id}>
                    <Link to={`/posts/${post.id}`}>{post.title}</Link>
                </li>})}
            </ul>
        </span>}
        {posts === undefined && <span>
            <Loading />
        </span>}
    </div>
  )
}

export default RightBar;