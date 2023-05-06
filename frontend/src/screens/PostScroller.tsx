import React from 'react'
import {Post as BlogPost, Identified} from '../../../interface/Model'
import {GetPost} from '../loaders'
import { useParams } from 'react-router-dom'


const PostScroller: React.FC = () => {
  
  return (
    <div className="PostScroller">
      Todo - grab last N headlines<br/>
      Also - possible pagination?
    </div>
  )
}

export default PostScroller