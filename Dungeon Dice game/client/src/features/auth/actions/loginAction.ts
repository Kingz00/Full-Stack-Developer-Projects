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
    const recaptchaToken = formData.get('recaptchaToken')

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

    if (
        typeof username !== 'string' ||
        typeof password !== 'string' ||
        typeof recaptchaToken !== 'string' ||
        !username.trim() ||
        !password ||
        !recaptchaToken
    ) {
        return {
            fieldErrors: {
                form: 'Complete the CAPTCHA and enter your username and password.',
            },
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
            password,
            recaptchaToken
        }),
    })

    if (response.status === 400) {
        const data = await response.json().catch(() => null)

        if (
            data &&
            typeof data.error === 'string' &&
            data.error.toLowerCase().includes('captcha')
        ) {
            return {
                fieldErrors: {
                    form: data.error
                }
            }
        }
    }

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