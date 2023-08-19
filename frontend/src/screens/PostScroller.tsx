import React, { useContext, useEffect, useState } from 'react'
import { PostMetadata } from '../../../interface/Model'
import { Loader } from '../loaders/loaders'
import Loading from '../components/Loading'
import * as luxon from 'luxon'
import './PostScroller.css'
import { Link } from 'react-router-dom'
import AuthContext from '../AuthContext'


const PostScroller: React.FC = () => {
  const auth = useContext(AuthContext)
  const [posts, setPosts] = useState<Array<PostMetadata>>()

  useEffect(() => {
      if (posts === undefined) {
        Loader(auth.currentUser()).ListPosts().then(rv => rv.splice(0, Math.min(rv.length, 3))).then(setPosts)
      }
  }, [posts, auth])

  if (posts === undefined) return <div className="PostScroller"><Loading/></div>
  if (posts.length === 0) return <div className="PostScroller">
    Hi. There is currently no content to display.<br/>
    Come back tomorrow and check again.
  </div>

  return (
    <div className="PostScroller">
      {posts.map(post => {return <div key={post.id} className="PostSynopsis">
        <Link to={`/posts/${post.id}`}>{post.title}</Link><br/>
        &nbsp;&nbsp;{luxon.DateTime.fromMillis(post.updatedTs).toISODate()}
        &nbsp;&nbsp;{post.contributors.map(c => <div key={c.id}>by: {c.name}</div>)}
      </div>})}
    </div>
  )
}

export default PostScroller