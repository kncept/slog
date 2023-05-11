import React, { useContext } from 'react'
import './ButtonLink.css'
import { Link } from 'react-router-dom'

type Props = {
    children?: React.ReactNode
    to?: string,
    disabled?: boolean,
}


const ButtonLink: React.FC<Props> = ({children, to, disabled}) => {
    if (disabled) {
        return <span className='ButtonLink'>{children}</span>
    }
    return <Link to={to || ''} aria-disabled={true} className='ButtonLink'>{children}</Link>
}

export default ButtonLink