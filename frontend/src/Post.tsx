import React from 'react'
import './App.css'
import {Post as BlogPost, Identified} from '../../interface/Model'
import {GetPost} from './loaders'


const Post: React.FC<{blogpost: BlogPost|Identified}> = ({blogpost}) => {
  const [blog, setBlog] = React.useState<BlogPost>(blogpost as BlogPost)
  const loading = Object.keys(blog).length === 1
  console.log("blog: ", blog)
  console.log('(not useEffect) loading: ' + loading)
  React.useEffect(() => {
    console.log('(in useEffect) loading: ' + loading)
    if (loading) {
      GetPost(blog.id).then(setBlog)
    }
  }, [loading, blog])
  
  if (loading) {
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
  );
}

export default Post;