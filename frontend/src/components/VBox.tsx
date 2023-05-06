import React from 'react'
import './VBox.css'

type Props = {
    children?: React.ReactNode
    style?: React.CSSProperties
  };

const VBox: React.FC<Props> = ({children, style}) => {
    return <div className='vertical' style={style}>
        {children}
    </div>
}

export default VBox