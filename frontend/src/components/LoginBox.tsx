import React, { useContext } from 'react'
import { OidcContext } from '../App'
import { LoginProvider } from '../../../orchestration/env-properties'
import { useAuth } from 'react-oidc-context'
import ButtonLink from './ButtonLink'

type Props = {
    style?: React.CSSProperties
}

function providers(): Array<LoginProvider>{
    if (process.env.REACT_APP_LOGIN_PROVIDERS !== undefined && process.env.REACT_APP_LOGIN_PROVIDERS !== "") {
        return JSON.parse(process.env.REACT_APP_LOGIN_PROVIDERS)
    }
    return []

}
const availableProviders = providers()

const LoginBox: React.FC<Props> = ({style}) => {
    const auth = useAuth()
    const oidcContext = useContext(OidcContext)
    console.log('available providers: ', availableProviders)

    if (availableProviders.length == 0) {
        return <div style={style}>
            <ButtonLink disabled={true}>Login Disabled</ButtonLink>
        </div>
    }

    // auth.isAuthenticated

    return <div style={style} onClick={() => {console.log('onclick')}}>
        [login box]
    </div>
}

export default LoginBox