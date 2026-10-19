import type { ActionFunctionArgs } from 'react-router-dom'

interface ResetPasswordActionData {
    success?: boolean
    message?: string
    fieldErrors?: {
        password?: string
        confirmPassword?: string
        form?: string
    }
}

export async function resetPasswordAction({ request }: ActionFunctionArgs): Promise<ResetPasswordActionData> {
    const url = new URL(request.url)
    const token = url.searchParams.get('token')
    const formData = await request.formData()

    const password = formData.get('password')
    const confirmPassword = formData.get('confirmPassword')

    if (!token) {
        return {
            fieldErrors: {
                form: 'This password-reset link is missing its token. Request a new link.'
            }
        }
    }

    if (typeof password !== 'string' || !password) {
        return {
            fieldErrors: {
                password: 'Enter your new password.'
            }
        }
    }

    if (
        typeof confirmPassword !== 'string' ||
        !confirmPassword
    ) {
        return {
            fieldErrors: {
                confirmPassword: 'Confirm your new password.'
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
        return {
            fieldErrors: {
                form: 'Password recovery is temporarily unavailable.'
            }
        }
    }

    try {
        const response = await fetch(`${apiBaseUrl}/auth/reset-password`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, password }),
            },
        )

        const data = await response.json().catch(() => null)

        if (response.ok) {
            return {
                success: true,
                message:
                    typeof data?.message === 'string'
                        ? data.message
                        : 'Your password has been reset successfully.',
            }
        }

        return {
            fieldErrors: {
                form:
                    typeof data?.error === 'string'
                        ? data.error
                        : 'We could not reset your password. The link may be invalid or expired.',
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