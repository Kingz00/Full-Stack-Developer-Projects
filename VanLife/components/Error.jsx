import React from "react"
import { Link, useRouteError } from "react-router-dom"

export default function Error() {
    const error = useRouteError()

    console.error(error)

    const status = error?.status || 500

    let message = ''

    if (status === 401) {
        message = "You need to be logged in to view this page."
    } else if (status === 404) {
        message = "The page you're looking for doesn't exist."
    } else {
        message = "Something went wrong while loading this page."
    }

    return (
        <main className="error-page">
            <h1>Oops! Something went wrong.</h1>

            <p>{message}</p>

            {status === 401 && (
                <Link to="/login">
                    Log in
                </Link>
            )}

            {status === 404 && (
                <Link to="/vans">
                    Browse vans
                </Link>
            )}
        </main>
    )
}
