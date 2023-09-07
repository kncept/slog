import React, { useContext } from 'react'
import './Contributors.css'
import { Contributor } from '../../../interface/Model'
import SimpleButton from './SimpleButton'
import AuthContext from '../AuthContext'

type Props = {
    contributors: Array<Contributor>
    removeContributor? : (id: string) => void
}

const Contributors: React.FC<Props> = ({contributors, removeContributor}) => {
    const auth = useContext(AuthContext)
    const userId = auth.currentUser()?.id() || ""
    if (contributors.length === 0) {
        return <div className='contributors'>
            <span>Anonymous</span>
        </div>
    }
    
    return <div className='contributors'>
        {contributors.map(contributor => <div key={contributor.id} className='contributor-row'>
            Author: {contributor.name} 

            {contributor.id === userId ? <>
                 <span>&nbsp;(me)</span>
            </>:<>{removeContributor && 
                <SimpleButton text='Delete' style={{color: 'red'}} onClick={() => removeContributor(contributor.id)} />
            }</>}
            </div>)}
    </div>
}

export default Contributors