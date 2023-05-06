import React from 'react'
import { useRouteError } from 'react-router-dom'

// see https://reactrouter.com/en/main/start/tutorial#handling-not-found-errors

const RouterError: React.FC = () => {
    const error = useRouteError() as any
    return <div>
        <div>Error Occurred</div>
        <div>{error.statusText || error.message}</div>
    </div>
}

export default RouterError