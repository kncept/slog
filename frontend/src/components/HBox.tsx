import React from 'react'
import './HBox.css'

type Props = {
    children?: React.ReactNode
    style?: React.CSSProperties
  };

const HBox: React.FC<Props> = ({children, style}) => {
    return <div className='horizontal' style={style}>
        {children}
    </div>
}

export default HBox