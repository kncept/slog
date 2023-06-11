import React from 'react'
import { Post as BlogPost } from '../../../interface/Model'
import Loader from '../loaders/loaders'
import { useParams } from 'react-router-dom'
import Markdown, { MarkdownMode } from '../components/Markdown'
import Loading from '../components/Loading'
import Contributors from '../components/Contributors'


const ViewPost: React.FC = () => {
  const { id } = useParams()
  const [blog, setBlog] = React.useState<BlogPost | null>(null)
  
  React.useEffect(() => {
    if (blog== null || blog.id !== id) {
      Loader.GetPost(id!).then(setBlog)
    }
  }, [id, blog])
  

  if (blog == null) {
    return <Loading />
  }

  return (
    <div key={id} className="BlogPost">
      <header className="PostTitle">
        <h2>{blog.title}</h2>
      </header>
      <div className="PostContent">
        <Markdown postId={id!} mode={MarkdownMode.VIEW} value={blog.markdown} />
        <br/>
      </div>
      <Contributors contributors={blog.contributors} />
    </div>
  )
}

export default ViewPost