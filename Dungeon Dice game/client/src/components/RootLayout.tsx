import { Outlet, useLocation, useNavigation } from 'react-router-dom'
import AppHeader from './AppHeader'

function RootLayout() {
    const { pathname } = useLocation()
    const navigation = useNavigation()

    const isBattlePage = pathname === '/game/battle'
    const isLoadingRoute = navigation.state === 'loading'

    return (
        <>
            {!isBattlePage && <AppHeader />}

            {isLoadingRoute && (
                <div
                    className="route-loading-indicator"
                    role="status"
                    aria-live="polite"
                >
                    <span
                        className="loading-spinner loading-spinner--small"
                        aria-hidden="true"
                    />
                    <span>Loading page...</span>
                </div>
            )}

            <Outlet />
        </>
    )
}

export default RootLayout
