import React from 'react'
import './App.css'
import {Post as BlogPost, Identified} from '../../interface/Model'
import {GetPost} from './loaders'
import { useParams } from 'react-router-dom'


const Post: React.FC = () => {
  const { id } = useParams()
  const [blog, setBlog] = React.useState<BlogPost | null>(null)
  
  React.useEffect(() => {
    if (blog== null) {
      // setInitializing(false)
      GetPost(id || "").then(setBlog)
    }
  }, [id, blog])
  

  if (blog == null) {
    return <div>
      Blog Post Loading
    </div>
  }

  return (
    <div className="BlogPost">
      <header className="PostTitle">
        {blog.title}
      </header>
      <div className="PostContent">

        ++ body content ++

      </div>
      {blog.contributors.map((contributor, index) => {
        return <div className="Author" key={index}>
          {contributor.name}
      </div>
      })}

      
    </div>
  )
}

export default Post;