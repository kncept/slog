import React from "react"

type Props = {
    children?: React.ReactNode
}

// see https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
class CatchErr extends React.Component<Props,{hasError: boolean}> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: any) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error: any, info: any) {
        // Example "componentStack":
        //   in ComponentThatThrows (created by App)
        //   in ErrorBoundary (created by App)
        //   in div (created by App)
        //   in App
        // logErrorToMyService(error, info.componentStack);

        console.log('caught', error, info)
      }

      render() {
        if (this.state.hasError) {
          // You can render any custom fallback UI
          return <div>
                Error occured
          </div>
        }
    
        return this.props.children;
      }
}

export default CatchErr