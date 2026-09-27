import { isRouteErrorResponse, useRouteError } from 'react-router-dom'

import './RouteErrorElement.css'

function RouteErrorElement() {
    const error = useRouteError()

    if (isRouteErrorResponse(error)) {
        return (
            <main className="route-error">
                <section className="route-error__content">
                    <p className="route-error__status">
                        {error.status}
                    </p>

                    <h1 className="route-error__title">
                        {error.statusText}
                    </h1>

                    <p className="route-error__message">
                        Something went wrong while loading this
                        page.
                    </p>
                </section>
            </main>
        )
    }

    return (
        <main className="route-error">
            <section className="route-error__content">
                <h1 className="route-error__title">
                    Something went wrong
                </h1>

                <p className="route-error__message">
                    An unexpected error occurred while loading
                    this page.
                </p>
            </section>
        </main>
    )
}

export default RouteErrorElement