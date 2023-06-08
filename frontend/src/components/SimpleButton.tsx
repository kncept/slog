import React from 'react'
import './SimpleButton.css'

type Props = {
    style?: React.CSSProperties
    text: string
    onClick: () => void
    disabled?: boolean,
}


const SimpleButton: React.FC<Props> = ({style, text, onClick, disabled}) => {
    if (disabled) {
        return <div style={style} className='DisabledSimpleButton'>{text}</div>
    }
    return <div style={style} className='SimpleButton' onClick={onClick}>{text}</div>
}

export default SimpleButton