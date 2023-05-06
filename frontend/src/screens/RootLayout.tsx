import React from 'react'
import './RootLayout.css'
import { Link, Outlet } from 'react-router-dom'
import VBox from '../components/VBox'
import HBox from '../components/HBox'

const RootLayout: React.FC = () => {
    const mainContentWidth = 80
    const marginWidth = (100-mainContentWidth)/2


    return <HBox>
        <div style={{width: `${marginWidth}%`}}></div>
        <VBox style={{width: `${mainContentWidth}%`}}>
            <div>
                <h1>Super Simple Blog</h1>
            </div>
            <div>

            </div>
            <HBox>
                <div style={{
                    width: "60%"
                }}><Outlet /></div>
                <div>&nbsp;</div>
                <div>
                    Rightbar Content (todo = componentize)
                    <span>
                        <ul>
                            <li><Link to={'/posts/000'}>000 post</Link></li>
                            <li><Link to={'/posts/123'}>123 post</Link></li>
                        </ul>
                    </span>
                </div>
            </HBox>
            <div>
            {/* <div style={{display: 'flex', justifyContent: 'flex-end'}}> */}
            <sub style={{marginLeft: 'auto', marginRight: '0'}}>Super Simple Blog provided by nicholas Krul</sub>
            {/* </div> */}
            </div>
        </VBox>
        <div style={{width: `${marginWidth}%`}}></div>
    </HBox>
}

export default RootLayout