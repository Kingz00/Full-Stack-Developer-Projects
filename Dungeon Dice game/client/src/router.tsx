import { createBrowserRouter, Outlet } from 'react-router-dom'

import HeroSelectionPage from './features/heroes/pages/HeroSelectionPage'
import RouteErrorElement from './components/RouteErrorElement'
import { authLoader } from './features/auth/loaders/authLoader'
import { heroesLoader } from './features/heroes/loaders/heroesLoader'
import AuthErrorElement from './features/auth/components/AuthErrorElement'
import LoginPage from './features/auth/pages/LoginPage'
import RegisterPage from './features/auth/pages/RegisterPage'
import { loginAction } from './features/auth/actions/loginAction'
import { registerAction } from './features/auth/actions/registerAction'
import AppHeader from './components/AppHeader'
import { logoutAction } from './features/auth/actions/logoutAction'

function RootLayout() {
    return (
        <>
            <AppHeader />
            <Outlet />
        </>
    )
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
            {
                path: '/login',
                action: loginAction,
                element: <LoginPage />,
                errorElement: <AuthErrorElement />,
            },
            {
                path: '/register',
                action: registerAction,
                element: <RegisterPage />,
                errorElement: <AuthErrorElement />,
            },
            {
                path: '/logout',
                action: logoutAction,
            },
        ],
    }
])