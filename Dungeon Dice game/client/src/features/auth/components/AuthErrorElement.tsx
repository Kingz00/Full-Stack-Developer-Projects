import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom'

import './AuthErrorElement.css'

function AuthErrorElement() {
    const error = useRouteError()

    let message = 'Something went wrong.'

    if (isRouteErrorResponse(error)) {
        message =
            typeof error.data === 'string'
                ? error.data
                : `${error.status} ${error.statusText}`
    } else if (error instanceof Error) {
        message = error.message
    }

    return (
        <main className="auth-error">
            <section className="auth-error__card">
                <p className="auth-error__eyebrow">
                    Authentication
                </p>

                <h1>Unable to continue</h1>

                <p>{message}</p>

                <Link to="/">Back to Heroes</Link>
            </section>
        </main>
    )
}

export default AuthErrorElement