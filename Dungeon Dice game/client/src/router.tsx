import { createBrowserRouter, Outlet } from 'react-router-dom'

import HeroSelectionPage from './features/heroes/pages/HeroSelectionPage'
import RouteErrorElement from './components/RouteErrorElement'
import { authLoader } from './features/auth/loaders/authLoader'
import { heroesLoader } from './features/heroes/loaders/heroesLoader'

function RootLayout() {
    return <Outlet />
}

export const router = createBrowserRouter([
    {
        id: 'root',
        loader: authLoader,
        element: <RootLayout />,
        errorElement: <RouteErrorElement />,
        children: [
            {
                path: '/',
                loader: heroesLoader,
                element: <HeroSelectionPage />,
            },
        ],
    }
])