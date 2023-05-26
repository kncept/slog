import React, { FC, useContext, useEffect, useState } from 'react'
import AuthContext from '../AuthContext'
import { useNavigate } from 'react-router-dom'

const Authenticated: FC<{
    children?: React.ReactNode
    requireAdmin?: boolean | undefined
    redirect?: string | undefined
}> = ({children, requireAdmin, redirect}) => {
    const navigate = useNavigate()
    const auth = useContext(AuthContext)
    const userIsAdmin = auth.currentUser?.admin() || false
    const [allowed, setAllowed] = useState(false)
    const allow: () => void = () => {if (!allowed) setAllowed(true)}
    const disallow: () => void = () => {if (allowed) setAllowed(false)}

    if (requireAdmin) {
        if (userIsAdmin) allow()
        else disallow()
    } else {
        if (auth.currentUser !== null) allow()
        else disallow()
    }

    useEffect(() => {
        if (!allowed) {
            if (redirect) navigate(redirect)
            else navigate('/')
        }
    }, [redirect, allowed, navigate])
   
    if (allowed) return <>{children}</>
    return <></>
}

export default Authenticated