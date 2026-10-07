import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom'

import logo from '../assets/branding/dungeon-dice-duel-logo.png'
import './RouteErrorElement.css'

function RouteErrorElement() {
    const error = useRouteError()

    const isConnectionError =
        error instanceof Error &&
        error.name === 'ServerConnectionError'

    const isRouteResponse = isRouteErrorResponse(error)

    const isServerError = isRouteResponse && error.status >= 500

    const canRetry = isConnectionError || isServerError

    let title = 'Something Went Wrong'
    let message = 'An unexpected error occurred while loading this page.'

    if (isConnectionError) {
        title = 'The Dungeon Server Is Unreachable'
        message =
            'We couldn’t connect to the game server. It may be offline or temporarily unavailable. Check that the server is running, then try again.'
    } else if (isRouteResponse) {
        title = error.statusText || 'Unable to Load This Page'
        message =
            error.status === 404
                ? 'The page you requested could not be found. Return to the dungeon to continue your adventure.'
                : error.status >= 500
                    ? 'The server encountered a problem while processing your request. Please try again shortly.'
                    : 'The request could not be completed. Please return to the dungeon and try again.'
    } else if (error instanceof Error) {
        message = error.message
    }

    return (
        <main className="route-error">
            <section className="route-error__content">
                <div className="route-error__brand">
                    <img src={logo} alt="Dungeon Dice Duel" />
                </div>

                <div className="route-error__divider" aria-hidden="true">
                    <span />
                </div>

                <p className="route-error__eyebrow">
                    {isConnectionError
                        ? 'Connection Lost'
                        : 'Dungeon Alert'}
                </p>

                {isRouteResponse && (
                    <p className="route-error__status">
                        {error.status}
                    </p>
                )}

                <h1 className="route-error__title">{title}</h1>

                <p className="route-error__message">{message}</p>

                <div className="route-error__actions">
                    {canRetry ? (
                        <button
                            className="route-error__action"
                            type="button"
                            onClick={() => window.location.reload()}
                        >
                            Try Again
                        </button>
                    ) : (
                        <Link
                            className="route-error__action"
                            to="/"
                        >
                            Return to Dungeon
                        </Link>
                    )}
                </div>
            </section>
        </main>
    )
}

export default RouteErrorElement
