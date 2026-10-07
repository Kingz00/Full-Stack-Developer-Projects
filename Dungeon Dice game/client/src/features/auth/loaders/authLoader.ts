import { redirect, type LoaderFunctionArgs } from 'react-router-dom'

export interface AuthUser {
    id: number
    username: string
    createdAt: string
}

interface AuthResponse {
    user: AuthUser
}

export async function authLoader(request: LoaderFunctionArgs): Promise<AuthUser | null> {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

    if (!apiBaseUrl) {
        throw new Error('VITE_API_BASE_URL is not configured.')
    }


    let response: Response

    try {
        response = await fetch(`${apiBaseUrl}/auth/me`, {
            credentials: 'include',
        })
    } catch {
        const error = new Error(
            'The game server could not be reached. It may be offline or temporarily unavailable.'
        )

        error.name = 'ServerConnectionError'
        throw error
    }

    if (response.status === 401) {
        const url = new URL(request.url)

        if (url.pathname === '/game') {
            const heroId = url.searchParams.get('heroId')

            if (heroId) {
                throw redirect(
                    `/login?heroId=${encodeURIComponent(heroId)}`
                )
            }

            throw redirect('/login')
        }

        return null
    }

    if (!response.ok) {
        throw new Error('Unable to determine the current authentication state.')
    }

    const data: AuthResponse = await response.json()

    return data.user
}