import React from 'react'
import './RootLayout.css'
import { Link, Outlet } from 'react-router-dom'
import VBox from '../components/VBox'
import HBox from '../components/HBox'
import RightBar from './RightBar'
import LoginBox from '../components/LoginBox'

const RootLayout: React.FC = () => {
    const mainContentWidth = 80
    const marginWidth = (100-mainContentWidth)/2

    return <div data-testid="layout-root">
        <HBox>
            <div style={{width: `${marginWidth}%`}}></div>
            <VBox style={{width: `${mainContentWidth}%`}}>
                <div style={{display: "flex", justifyContent: 'space-around'}}>
                    <h1>SLog</h1>
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

                <div>
                    <Link to='/privacy'>Privacy</Link>
                    &nbsp;&nbsp;
                    <Link to='/'>Home</Link>
                </div>
                <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                    <sub style={{marginLeft: 'auto', marginRight: '0'}}>SLog provided by https://github.com/kncept/slog</sub>
                </div>
                </div>
            </VBox>
            <div style={{width: `${marginWidth}%`}}></div>
        </HBox>
    </div>
}

export default RootLayout