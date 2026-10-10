import { AppError } from '../errors/AppError.js'

interface GoogleRecaptchaResponse {
    success: boolean
    hostname?: string
    'error-codes'?: string[]
}

export class RecaptchaService {
    async verify(token: unknown): Promise<void> {
        if (typeof token !== 'string' || token.trim() === '') {
            throw new AppError(
                400,
                'Complete the CAPTCHA verification.',
            )
        }

        const secret = process.env.RECAPTCHA_SECRET_KEY

        if (!secret) {
            throw new AppError(
                503,
                'CAPTCHA verification is not configured.',
            )
        }

        const body = new URLSearchParams({
            secret,
            response: token
        })

        let response: Response

        try {
            response = await fetch('https://www.google.com/recaptcha/api/siteverify',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body,
                    signal: AbortSignal.timeout(5000),
                }
            )
        } catch {
            throw new AppError(
                503,
                'CAPTCHA verification is temporarily unavailable.'
            )
        }

        if (!response.ok) {
            throw new AppError(
                503,
                'CAPTCHA verification is temporarily unavailable.'
            )
        }

        let result: GoogleRecaptchaResponse

        try {
            result = await response.json() as GoogleRecaptchaResponse
        } catch {
            throw new AppError(
                503,
                'CAPTCHA verification is temporarily unavailable.',
            )
        }

        if (result.success !== true) {
            throw new AppError(
                400,
                'CAPTCHA verification failed. Please try again.'
            )
        }
    }
}
