import React from 'react'
import { useNavigate } from 'react-router-dom'
import SimpleButton from './SimpleButton'

type Props = {
    text: string
    to: string,
    disabled?: boolean,
}


const ButtonLink: React.FC<Props> = ({text, to, disabled}) => {
    const navigate = useNavigate()
    return <SimpleButton disabled={disabled} text={text} onClick={() => {navigate(to)}}/>
}

export default ButtonLink