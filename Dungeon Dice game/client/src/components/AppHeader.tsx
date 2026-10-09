import { Form, Link, useNavigation, useRouteLoaderData } from 'react-router-dom'

import type { AuthUser } from '../features/auth/loaders/authLoader'
import logo from '../assets/branding/dungeon-dice-duel-logo.png'

import './AppHeader.css'

function AppHeader() {
    const user = useRouteLoaderData('root') as AuthUser | null
    const navigation = useNavigation()

    if (!user) {
        return null
    }

    const isLoggingOut =
        navigation.state === 'submitting' &&
        navigation.formMethod === 'POST' &&
        navigation.formAction === '/logout'


    return (
        <header className="app-header">
            <div className="app-header__content">
                <Link
                    className="app-header__brand"
                    to="/"
                    aria-label="Dungeon Dice Duel home"
                >
                    <img
                        className="app-header__logo"
                        src={logo}
                        alt="Dungeon Dice Duel"
                    />
                </Link>

                <nav
                    className="app-header__nav"
                    aria-label="Main navigation"
                >
                    <span className="app-header__username">
                        {user.username}
                    </span>

                    <Link
                        className="app-header__stats"
                        to="/about"
                    >
                        About
                    </Link>

                    <span
                        className="app-header__separator"
                        aria-hidden="true"
                    />

                    <Link
                        className="app-header__stats"
                        to="/statistics"
                    >
                        Stats
                    </Link>

                    <span
                        className="app-header__separator"
                        aria-hidden="true"
                    />

                    <Form
                        method="post"
                        action="/logout"
                    >
                        <button
                            className="app-header__logout"
                            type="submit"
                            disabled={isLoggingOut}
                        >
                            {isLoggingOut
                                ? 'Signing out...'
                                : 'Sign out'}
                        </button>
                    </Form>
                </nav>
            </div>
        </header>
    )
}

export default AppHeader