import { redirect, type ActionFunctionArgs } from 'react-router-dom'

interface RegisterActionData {
    fieldErrors?: {
        username?: string
        password?: string
        confirmPassword?: string
        form?: string
    }
}

export async function registerAction({ request }: ActionFunctionArgs): Promise<Response | RegisterActionData> {
    const formData = await request.formData()

    const username = formData.get('username')
    const password = formData.get('password')
    const confirmPassword = formData.get('confirmPassword')

    if (
        typeof username !== 'string' ||
        typeof password !== 'string' ||
        typeof confirmPassword !== 'string' ||
        !username.trim() ||
        !password ||
        !confirmPassword
    ) {
        return {
            fieldErrors: {
                form: 'Username and password are required.'
            }
        }
    }

    if (password !== confirmPassword) {
        return {
            fieldErrors: {
                confirmPassword: 'Passwords do not match.'
            }
        }
    }

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

    if (!apiBaseUrl) {
        throw new Error('VITE_API_BASE_URL is not configured.')
    }

    const response = await fetch(`${apiBaseUrl}/auth/register`,
        {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                password
            })
        }
    )

    if (!response.ok) {
        let message = 'Unable to create your account.'

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

        /*
         * Registration validation errors are expected form
         * failures, so return them to the form instead of
         * sending them to AuthErrorElement.
         */
        if (response.status === 400 || response.status === 409) {
            return {
                fieldErrors: {
                    username: message
                }
            }
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