import React from 'react'
// import logo from './logo.svg'
import './App.css'
import ViewPost from './screens/ViewPost'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import RootLayout from './screens/RootLayout'
import RouterError from './screens/RouterError'
import PostScroller from './screens/PostScroller'
import Privacy from './screens/Privacy'
import DraftList from './screens/DraftList'
import DraftEdit from './screens/DraftEdit'
import { AuthProvider, AuthProviderCallback } from './AuthContext'
import Authenticated from './components/Authenticated'

// eslint-disable-next-line
declare namespace NodeJS {
  interface ProcessEnv {
    // NODE_ENV: 'development' | 'production' | 'test'
    // PUBLIC_URL: string
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
        path: 'callback/:providerId',
        element: <AuthProviderCallback />
      },
      {
        path: 'drafts',
        element: <Authenticated requireAdmin={true}><DraftList /></Authenticated>
      },
      {
        path: 'drafts/:id',
        element: <Authenticated requireAdmin={true}><DraftEdit /></Authenticated>
      },
      
      {
        path: "posts/:id",
        element: <ViewPost />
      },
      {
        path: "privacy",
        element: <Privacy />
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
      <AuthProvider>
        <RouterProvider router={router}/>
      </AuthProvider>

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
