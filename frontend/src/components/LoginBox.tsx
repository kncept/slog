import React, { useContext } from 'react'
import DropDownPicker from './DropDownPicker'
import SimpleButton from './SimpleButton'
import AuthContext from '../AuthContext'

type Props = {
    style?: React.CSSProperties
}

const LoginBox: React.FC<Props> = ({style}) => {
    const auth = useContext(AuthContext)

    const onSelectProvider = (providerName: string): void => {
        const provider = auth.providers().filter(p => p.name === providerName)[0]
        auth.login(provider)
    }

    const doLogout = () => {
        auth.currentUser()?.logout()
    }

    if (auth.isLoading()) {
        return <div style={style} key='loading'>
        <DropDownPicker
            disabled={true}
            text='Loading'
            values={[]}
            onSelect={() => {}}
        />
    </div>
    }

    if (auth.currentUser() !== null) {
        return <div style={style} key='logout'>
            {auth.currentUser()!.name()}
            <SimpleButton text='Logout' onClick={doLogout}/>
        </div>
    }

    // on a 500 this can end up as undefined (??)
    if (auth.providers() === undefined || auth.providers().length === 0) {
        return <div style={style} key='disabled'>
            <DropDownPicker
                disabled={true}
                text='Login Disabled'
                values={[]}
                onSelect={onSelectProvider}
            />
        </div>
    }

    if (auth.providers().length === 1) {
        return <div style={style} key='single'>
            <SimpleButton text='Login' onClick={() => onSelectProvider(auth.providers()![0].name)}/>
        </div>
    }

    return <div style={style} key='select'>
        <DropDownPicker
            text='Login'
            values={auth.providers()!.map(p => p.name)}
            onSelect={onSelectProvider}
        />
    </div>
}

export default LoginBox