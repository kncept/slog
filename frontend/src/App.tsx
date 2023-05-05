import React from 'react';
// import logo from './logo.svg';
import './App.css';
import Post from './Post';

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

const App: React.FC = () => {
  return (
    <div className="App">



      <pre>router here.</pre>

      <Post blogpost={{id:"0"}} />


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
  );
}

export default App;
