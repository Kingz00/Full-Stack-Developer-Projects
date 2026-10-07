import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom'

import logo from '../../../assets/branding/dungeon-dice-duel-logo.png'
import './AuthErrorElement.css'

function AuthErrorElement() {
    const error = useRouteError()

    const isConnectionError =
        error instanceof Error &&
        (
            error.name === 'ServerConnectionError' ||
            error instanceof TypeError
        )

    let message = 'Something went wrong. Please try again.'

    if (isConnectionError) {
        message =
            'We couldn’t connect to the game server. It may be offline or temporarily unavailable. Check that the server is running, then try again.'
    } else if (isRouteErrorResponse(error)) {
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
                <div className="auth-error__brand">
                    <img src={logo} alt="Dungeon Dice Duel" />
                </div>

                <div className="auth-error__divider" aria-hidden="true">
                    <span />
                </div>

                <p className="auth-error__eyebrow">
                    {isConnectionError
                        ? 'Connection Lost'
                        : 'Authentication Alert'}
                </p>

                <h1>
                    {isConnectionError
                        ? 'The Dungeon Server Is Unreachable'
                        : 'Unable to Continue'}
                </h1>

                <p className="auth-error__message">{message}</p>

                <Link className="auth-error__action" to="/">
                    Back to Heroes
                </Link>
            </section>
        </main>
    )
}

export default AuthErrorElement