import React, { useContext, useEffect, useState } from 'react'
import DropDownPicker from './DropDownPicker'
import SimpleButton from './SimpleButton'
import AuthContext from '../AuthContext'

type Props = {
    style?: React.CSSProperties
}

const LoginBox: React.FC<Props> = ({style}) => {
    const authContext = useContext(AuthContext)
    console.log('LoginBox rendering', authContext.currentUser)

    const onSelectProvider = (providerName: string): void => {
        const provider = authContext.providers.filter(p => p.name === providerName)[0]
        authContext.login(provider)
    }

    if (authContext.isLoading) {
        return <div style={style} key='loading'>
        <DropDownPicker
            disabled={true}
            text='Loading'
            values={[]}
            onSelect={() => {}}
        />
    </div>
    }

    if (authContext.currentUser !== null) {
        return <div style={style} key='logout'>
            {authContext.currentUser.name}
            <SimpleButton text='Logout' onClick={authContext.logout}/>
        </div>
    }

    if (authContext.providers.length === 0) {
        return <div style={style} key='disabled'>
            <DropDownPicker
                disabled={true}
                text='Login Disabled'
                values={[]}
                onSelect={onSelectProvider}
            />
        </div>
    }

    if (authContext.providers.length === 1) {
        return <div style={style} key='single'>
            <SimpleButton text='Login' onClick={() => onSelectProvider(authContext.providers[0].name)}/>
        </div>
    }

    return <div style={style} key='select'>
        <DropDownPicker
            text='Login'
            values={authContext.providers.map(p => p.name)}
            onSelect={onSelectProvider}
        />
    </div>
}

export default LoginBox