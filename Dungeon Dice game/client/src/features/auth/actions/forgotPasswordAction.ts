import type { ActionFunctionArgs } from 'react-router-dom'

interface RecoveryActionData {
    submitted?: boolean
    message?: string
    fieldErrors?: {
        email?: string
        form?: string
    }
}

interface ApiResponse {
    error?: string
    message?: string
}

export async function forgotPasswordAction({ request }: ActionFunctionArgs): Promise<RecoveryActionData> {
    const formData = await request.formData()
    const email = formData.get('email')
    const recaptchaToken = formData.get('recaptchaToken')

    if (typeof email !== 'string' || !email.trim()) {
        return {
            fieldErrors: {
                email: 'Enter your email address.',
            },
        }
    }

    const normalizedEmail = email.trim().toLowerCase()

    if (
        normalizedEmail.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
        return {
            fieldErrors: {
                email: 'Enter a valid email address.',
            },
        }
    }

    if (
        typeof recaptchaToken !== 'string' ||
        !recaptchaToken.trim()
    ) {
        return {
            fieldErrors: {
                form: 'Complete the CAPTCHA verification.',
            },
        }
    }

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

    if (!apiBaseUrl) {
        return {
            fieldErrors: {
                form: 'Password recovery is temporarily unavailable.',
            },
        }
    }

    try {
        const response = await fetch(`${apiBaseUrl}/auth/forgot-password`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: normalizedEmail,
                    recaptchaToken,
                }),
            },
        )

        const data = await response.json().catch(() => null) as ApiResponse | null

        if (response.status === 202) {
            return {
                submitted: true,
                message:
                    typeof data?.message === 'string'
                        ? data.message
                        : 'If an account matches that email address, instructions will be sent to it.',
            }
        }

        if (
            response.status === 400 &&
            data?.error === 'A valid email address is required.'
        ) {
            return {
                fieldErrors: {
                    email: 'Enter a valid email address.',
                },
            }
        }

        if (
            response.status === 400 &&
            (
                data?.error === 'Complete the CAPTCHA verification.' ||
                data?.error === 'CAPTCHA verification failed. Please try again.'
            )
        ) {
            return {
                fieldErrors: {
                    form:
                        data.error === 'Complete the CAPTCHA verification.'
                            ? 'Complete the CAPTCHA verification.'
                            : 'CAPTCHA verification failed. Please complete it again.',
                },
            }
        }

        return {
            fieldErrors: {
                form:
                    typeof data?.error === 'string'
                        ? data.error
                        : 'We could not process your request right now. Please try again later.',
            },
        }
    } catch {
        return {
            fieldErrors: {
                form: 'We could not reach the server. Please try again later.'
            }
        }
    }
}
