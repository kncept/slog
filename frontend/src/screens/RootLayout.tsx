import React, { useContext } from 'react'
import './RootLayout.css'
import { Outlet } from 'react-router-dom'
import VBox from '../components/VBox'
import HBox from '../components/HBox'
import RightBar from './RightBar'
import { AuthProvider } from 'react-oidc-context'
import { OidcContext } from '../App'
import LoginBox from '../components/LoginBox'

const RootLayout: React.FC = () => {
    const mainContentWidth = 80
    const marginWidth = (100-mainContentWidth)/2

    //oidc with callback
    const oidcContext = useContext(OidcContext)

    return <div data-testid="layout-root">
        <AuthProvider {...oidcContext.config}>
            <HBox>
                <div style={{width: `${marginWidth}%`}}></div>
                <VBox style={{width: `${mainContentWidth}%`}}>
                    <div style={{display: "flex", justifyContent: 'space-around'}}>
                        <h1>Super Simple Blog</h1>
                    </div>
                    <div style={{display: "flex", justifyContent: 'flex-end'}}>
                        <LoginBox />
                    </div>
                    <HBox>
                        <div style={{
                            width: "60%"
                        }}><Outlet /></div>
                        <div>&nbsp;</div>
                        <RightBar />
                    </HBox>
                    <div>
                    {/* <div style={{display: 'flex', justifyContent: 'flex-end'}}> */}
                    <sub style={{marginLeft: 'auto', marginRight: '0'}}>Super Simple Blog provided by https://github.com/kncept/super-simple-blog</sub>
                    {/* </div> */}
                    </div>
                </VBox>
                <div style={{width: `${marginWidth}%`}}></div>
            </HBox>
        </AuthProvider>
    </div>
}

export default RootLayout