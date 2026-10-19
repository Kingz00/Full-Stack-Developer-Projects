import { redirect, type ActionFunctionArgs } from 'react-router-dom'

interface RegisterActionData {
    fieldErrors?: {
        username?: string
        email?: string
        password?: string
        confirmPassword?: string
        form?: string
    }
}

export async function registerAction({ request }: ActionFunctionArgs): Promise<Response | RegisterActionData> {
    const formData = await request.formData()

    const username = formData.get('username')
    const email = formData.get('email')
    const password = formData.get('password')
    const confirmPassword = formData.get('confirmPassword')
    const recaptchaToken = formData.get('recaptchaToken')

    if (
        typeof username !== 'string' ||
        typeof email !== 'string' ||
        typeof password !== 'string' ||
        typeof confirmPassword !== 'string' ||
        !username.trim() ||
        !email.trim() ||
        !password ||
        !confirmPassword
    ) {
        return {
            fieldErrors: {
                form: 'Username, email, and password are required.',
            },
        }
    }

    const normalizedUsername = username.trim()
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

    if (password !== confirmPassword) {
        return {
            fieldErrors: {
                confirmPassword: 'Passwords do not match.'
            }
        }
    }

    if (
        typeof recaptchaToken !== 'string' ||
        !recaptchaToken
    ) {
        return {
            fieldErrors: {
                form: 'Complete the CAPTCHA before creating your account.',
            },
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
                username: normalizedUsername,
                email: normalizedEmail,
                password,
                recaptchaToken
            })
        }
    )


    if (!response.ok) {
        let message = 'Unable to create your account.'

        try {
            const data = await response.json()

            if (data && typeof data.error === 'string') {
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
            const normalizedMessage = message.toLowerCase()

            if (normalizedMessage.includes('email')) {
                return {
                    fieldErrors: {
                        email: message,
                    },
                }
            }

            if (normalizedMessage.includes('username')) {
                return {
                    fieldErrors: {
                        username: message,
                    },
                }
            }

            return {
                fieldErrors: {
                    form: message,
                },
            }
        }

        throw new Response(message, {
            status: response.status,
        })
    }

    const url = new URL(request.url)
    const heroId = url.searchParams.get('heroId')

    let emailStatus: 'sent' | 'failed' = 'sent'

    try {
        const verificationResponse = await fetch(`${apiBaseUrl}/auth/email-verification/request`,
            {
                method: 'POST',
                credentials: 'include',
            },
        )

        if (!verificationResponse.ok) {
            emailStatus = 'failed'
        }
    } catch {
        // Registration succeeded; email delivery must not block play.
        emailStatus = 'failed'
    }

    const confirmationParams = new URLSearchParams({
        email: normalizedEmail,
        emailStatus
    })

    if (heroId) {
        confirmationParams.set('heroId', heroId)
    }

    return redirect(`/check-email?${confirmationParams.toString()}`)
}