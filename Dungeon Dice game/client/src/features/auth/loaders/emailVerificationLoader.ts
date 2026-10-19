import type { LoaderFunctionArgs } from 'react-router-dom'

export interface EmailVerificationResult {
    verified: boolean
    message: string
}

export async function emailVerificationLoader({ request }: LoaderFunctionArgs): Promise<EmailVerificationResult> {
    const url = new URL(request.url)
    const token = url.searchParams.get('token')

    if (!token) {
        return {
            verified: false,
            message: 'The verification link is missing its token.'
        }
    }

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

    if (!apiBaseUrl) {
        return {
            verified: false,
            message: 'Email verification is temporarily unavailable.'
        }
    }

    try {
        const response = await fetch(`${apiBaseUrl}/auth/email-verification/verify`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            },
        )

        if (response.ok) {
            const data = await response.json().catch(() => null)

            return {
                verified: true,
                message:
                    typeof data?.message === 'string'
                        ? data.message
                        : 'Your email address has been verified successfully.',
            }
        }

        let message = 'The verification link is invalid, expired, or has already been used.'

        try {
            const data = await response.json()

            if (typeof data?.error === 'string') {
                message = data.error
            }
        } catch {
            // Keep the fallback message.
        }

        return {
            verified: false,
            message
        }
    } catch {
        return {
            verified: false,
            message:
                'We could not contact the server to verify your email. Please try opening the link again.',
        }
    }
}