import React, { FC, useContext, useEffect, useState } from 'react'
import AuthContext from '../AuthContext'
import { useNavigate } from 'react-router-dom'

enum AuthBarrierStatus {
    loading = 'loading',
    allowed = 'allowed',
    denied = 'denied',
}

const Authenticated: FC<{
    children?: React.ReactNode
    requireAdmin?: boolean
    redirect?: string | undefined
}> = ({children, requireAdmin, redirect}) => {
    const navigate = useNavigate()
    const auth = useContext(AuthContext)
    const isLoading = auth.isLoading
    const [status, setStatus] = useState(AuthBarrierStatus.loading)

    const userExists = auth.currentUser !== null
    const userIsAdmin = userExists && auth.currentUser!.admin()

    useEffect(() => {
        if (!isLoading) {
            if (requireAdmin && userExists && userIsAdmin) setStatus(AuthBarrierStatus.allowed)
            else if (userExists) setStatus(AuthBarrierStatus.allowed)
            else setStatus(AuthBarrierStatus.denied)

            if (status === AuthBarrierStatus.denied) {
                if (redirect) navigate(redirect)
                else navigate('/')
            }
        }
    }, [status, isLoading, redirect, navigate, requireAdmin, userExists, userIsAdmin])
   
    if (status === AuthBarrierStatus.allowed) return <>{children}</>
    return <></>
}

export default Authenticated