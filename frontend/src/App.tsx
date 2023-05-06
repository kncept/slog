import React from 'react'
// import logo from './logo.svg'
import './App.css'
import Post from './screens/Post'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import RootLayout from './screens/RootLayout'
import RouterError from './screens/RouterError'
import PostScroller from './screens/PostScroller'

// eslint-disable-next-line
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test'
    PUBLIC_URL: string
    REACT_APP_API_ENDPOINT: string
  }
}
interface Window { // eslint-disable-line
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <RouterError />,
    children: [
      {
        path: "posts/:id",
        element: <Post />
      },
      {
        path: '/',
        element: <PostScroller />
      }
    ]
  },
])

const App: React.FC = () => {
  return (
    <div className="App">
      <RouterProvider router={router}/>

      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header> */}
    </div>
  )
}

export default App
