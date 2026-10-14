import { Outlet, useLocation } from 'react-router-dom'
import AppHeader from './AppHeader'

function RootLayout() {
    const { pathname } = useLocation()
    const isBattlePage = pathname === '/game/battle'

    return (
        <>
            {!isBattlePage && <AppHeader />}
            <Outlet />
        </>
    )
}

export default RootLayout
