import React, { FC, useContext, useEffect, useState } from 'react'
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
    const isAdmin = auth.currentUser?.admin() || false
    const [allowed, setAllowed] = useState(false)
    const allow: () => void = () => {if (!allowed) setAllowed(true)}

    if (admin) {
        if (isAdmin) allow()
    } else {
        if (auth.currentUser !== null) allow()
    }

    useEffect(() => {
        if (!allowed) {
            if (redirect) navigate(redirect)
            else navigate('/')
        }
    }, [redirect, allowed])
   
    if (allowed) return <>{children}</>
    return <></>
}

export default Authenticated