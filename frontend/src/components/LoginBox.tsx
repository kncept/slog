import React, { useContext } from 'react'
import { OidcContext } from '../App'
import { LoginProvider } from '../../../orchestration/env-properties'
import { useAuth } from 'react-oidc-context'
import DropDownPicker from './DropDownPicker'
import SimpleButton from './SimpleButton'

type Props = {
    style?: React.CSSProperties
}

export function providers(): Array<LoginProvider>{
    // TODO this is the desired state
    // if (process.env.REACT_APP_LOGIN_PROVIDERS !== undefined && process.env.REACT_APP_LOGIN_PROVIDERS !== "") {
    //     return JSON.parse(process.env.REACT_APP_LOGIN_PROVIDERS)
    // }

    // TODO: remove REACT_APP_LOGIN_PROVIDER for multi-provider support
    if (process.env.REACT_APP_LOGIN_PROVIDER !== undefined && process.env.REACT_APP_LOGIN_PROVIDER !== "") {
        return [JSON.parse(process.env.REACT_APP_LOGIN_PROVIDER)]
    }

    return []

}
const availableProviders = providers()

const LoginBox: React.FC<Props> = ({style}) => {
    const auth = useAuth()
    const oidcContext = useContext(OidcContext)

    console.log('auth:', auth)
    console.log('oidcContext.config:', oidcContext.config)

    const onSelectProvider = (providerName: string): void => {
        const provider = availableProviders.filter(p => p.providerName === providerName)[0]
        oidcContext.setConfig(provider)
        // auth.settings.client_id
        auth.clearStaleState().then(() => {
            console.log('auth stale state cleared:', auth)
            auth.signinRedirect()
        })
        // now trigger login??
    }

    if (availableProviders.length === 0) {
        return <div style={style}>
            <DropDownPicker
            disabled={true}
            text='Login Disabled'
            values={[]}
            onSelect={onSelectProvider} />
            {/* <ButtonLink disabled={true}>Login Disabled</ButtonLink> */}
        </div>
    }

    // 
    if (availableProviders.length === 1) {
        return <div style={style}>
            <SimpleButton text='Login' onClick={() => onSelectProvider(availableProviders[0].providerName)}/>
        </div>
    }

    // if loading use loading placeholder?

   
    // if authenticated...


    return <div style={style}>
        <DropDownPicker
            text='Login'
            values={availableProviders.map(p => p.providerName)}
            // values={['Github', 'Google', 'Facebook', 'Twitter']}
            onSelect={onSelectProvider}
        />
    </div>
}

export default LoginBox