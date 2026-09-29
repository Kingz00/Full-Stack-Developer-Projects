import { redirect, type ActionFunctionArgs } from 'react-router-dom'

interface LoginActionData {
    fieldErrors?: {
        username?: string
        password?: string
        form?: string
    }
}

export async function loginAction({ request }: ActionFunctionArgs): Promise<Response | LoginActionData> {
    const formData = await request.formData()

    const username = formData.get('username')
    const password = formData.get('password')

    if (
        typeof username !== 'string' ||
        typeof password !== 'string' ||
        !username.trim() ||
        !password
    ) {
        return {
            fieldErrors: {
                form: 'Username and password are required.',
            }
        }
    }

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

    if (!apiBaseUrl) {
        throw new Error('VITE_API_BASE_URL is not configured.')
    }

    const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username,
            password
        }),
    })

    if (response.status === 401) {
        return {
            fieldErrors: {
                username: 'We couldn’t find an account with those login details.'
            }
        }
    }

    if (!response.ok) {
        let message = 'Unable to sign in. Please try again.'

        try {
            const data = await response.json()

            if (
                data &&
                typeof data.error === 'string'
            ) {
                message = data.error
            }
        } catch {
            // Keep the fallback message.
        }

        throw new Response(message, {
            status: response.status
        })
    }

    const url = new URL(request.url)
    const heroId = url.searchParams.get('heroId')

    return redirect(
        heroId ? `/game?heroId=${encodeURIComponent(heroId)}` : '/game'
    )
}