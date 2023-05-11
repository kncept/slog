import React, { useContext } from 'react'
import { OidcContext } from '../App'
import { LoginProvider } from '../../../orchestration/env-properties'
import { useAuth } from 'react-oidc-context'
import ButtonLink from './ButtonLink'
import DropDownPicker from './DropDownPicker'

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

    const onSelectProvider = (providerName: string): void => {
        console.log('onSelectProvider ==> ' + providerName)
    }

    if (availableProviders.length == 0) {
        return <div style={style}>
            <DropDownPicker
            disabled={true}
            text='Login Disabled'
            values={[]}
            onSelect={onSelectProvider} />
            {/* <ButtonLink disabled={true}>Login Disabled</ButtonLink> */}
        </div>
    }

    // auth.isAuthenticated

   


    return <div style={style} onClick={() => {console.log('onclick')}}>
        <DropDownPicker
            text='Login'
            values={availableProviders.map(p => p.providerName)}
            // values={['Github', 'Google', 'Facebook', 'Twitter']}
            onSelect={onSelectProvider}
        />
    </div>
}

export default LoginBox