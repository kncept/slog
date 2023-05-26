import React, { FC, useContext } from 'react'
import AuthContext from '../AuthContext'
import { useNavigate } from 'react-router-dom'

type Props = {
    children?: React.ReactNode
    admin?: boolean | undefined
    redirect?: string | undefined
}

const Authenticated: FC<Props> = ({children, admin, redirect}) => {
    const navigate = useNavigate()
    const auth = useContext(AuthContext)
    let isAdmin = auth.currentUser?.isAdmin || false

    if (admin) {
        if (isAdmin) return <>{children}</>
    } else {
        if (auth.currentUser !== null) return <>{children}</>
    }

    if (redirect) navigate(redirect)
    navigate('/')
    return <></>
}

export default Authenticated