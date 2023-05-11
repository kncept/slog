import React from 'react'
import './SimpleButton.css'

type Props = {
    text: string
    onClick: () => void
    disabled?: boolean,
}


const SimpleButton: React.FC<Props> = ({text, onClick, disabled}) => {
    if (disabled) {
        return <div className='DisabledSimpleButton'>{text}</div>
    }
    return <div className='SimpleButton' onClick={onClick}>{text}</div>
}

export default SimpleButton