import React from 'react'
import {Post as BlogPost, Identified} from '../../../interface/Model'
import {GetPost} from '../loaders'
import { useParams } from 'react-router-dom'


const ViewPost: React.FC = () => {
  const { id } = useParams()
  const [blog, setBlog] = React.useState<BlogPost | null>(null)
  
  React.useEffect(() => {
    if (blog== null || blog.id !== id) {
      GetPost(id || "").then(setBlog)
    }
  }, [id, blog])
  

  if (blog == null) {
    return <div key='loading'>
      Blog Post Loading
    </div>
  }

  return (
    <div key={id} className="BlogPost">
      <header className="PostTitle">
        {id} {blog.title}
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

export default ViewPost