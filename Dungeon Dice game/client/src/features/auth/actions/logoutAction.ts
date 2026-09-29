import { redirect } from 'react-router-dom'

export async function logoutAction() {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

    if (!apiBaseUrl) {
        throw new Error(
            'VITE_API_BASE_URL is not configured.',
        )
    }

    const response = await fetch(`${apiBaseUrl}/auth/logout`,
        {
            method: 'POST',
            credentials: 'include'
        }
    )

    if (!response.ok) {
        let message = 'Unable to sign out.'

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

    return redirect('/')
}