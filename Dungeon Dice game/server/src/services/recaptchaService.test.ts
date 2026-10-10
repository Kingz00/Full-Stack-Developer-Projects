import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RecaptchaService } from './recaptchaService.js'

describe('RecaptchaService', () => {
    const originalSecret = process.env.RECAPTCHA_SECRET_KEY
    const service = new RecaptchaService()

    beforeEach(() => {
        process.env.RECAPTCHA_SECRET_KEY = 'test-secret'
    })

    afterEach(() => {
        if (originalSecret === undefined) {
            delete process.env.RECAPTCHA_SECRET_KEY
        } else {
            process.env.RECAPTCHA_SECRET_KEY = originalSecret
        }

        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    function mockFetch(response: Partial<Response>) {
        const fetchMock = vi.fn().mockResolvedValue(response)
        vi.stubGlobal('fetch', fetchMock)
        return fetchMock
    }

    it('rejects a missing token', async () => {
        await expect(service.verify(undefined))
            .rejects.toMatchObject({
                statusCode: 400,
                message: 'Complete the CAPTCHA verification.',
            })
    })

    it('rejects an empty token', async () => {
        await expect(service.verify('  '))
            .rejects.toMatchObject({
                statusCode: 400,
            })
    })

    it('rejects verification when the secret is not configured', async () => {
        delete process.env.RECAPTCHA_SECRET_KEY

        const fetchMock = vi.fn()
        vi.stubGlobal('fetch', fetchMock)

        await expect(service.verify('test-token'))
            .rejects.toMatchObject({
                statusCode: 503,
                message: 'CAPTCHA verification is not configured.',
            })

        expect(fetchMock).not.toHaveBeenCalled()
    })

    it('accepts a successful Google verification response', async () => {
        const fetchMock = mockFetch({
            ok: true,
            json: vi.fn().mockResolvedValue({
                success: true,
                hostname: 'localhost',
            }),
        })

        await expect(service.verify('test-token'))
            .resolves.toBeUndefined()

        expect(fetchMock).toHaveBeenCalledWith('https://www.google.com/recaptcha/api/siteverify',
            expect.objectContaining({
                method: 'POST',
                body: expect.any(URLSearchParams),
            })
        )

        const options = fetchMock.mock.calls[0][1] as RequestInit
        const body = options.body as URLSearchParams

        expect(body.get('secret')).toBe('test-secret')
        expect(body.get('response')).toBe('test-token')
    })

    it('rejects an unsuccessful Google verification response', async () => {
        mockFetch({
            ok: true,
            json: vi.fn().mockResolvedValue({
                success: false,
                'error-codes': ['invalid-input-response'],
            }),
        })

        await expect(service.verify('invalid-token'))
            .rejects.toMatchObject({
                statusCode: 400,
                message: 'CAPTCHA verification failed. Please try again.',
            })
    })

    it('fails closed when fetch rejects', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockRejectedValue(new Error('Network failure')),
        )

        await expect(service.verify('test-token'))
            .rejects.toMatchObject({
                statusCode: 503,
                message: 'CAPTCHA verification is temporarily unavailable.',
            })
    })

    it('fails closed when Google returns a non-success HTTP response', async () => {
        mockFetch({ ok: false, status: 500 })

        await expect(service.verify('test-token'))
            .rejects.toMatchObject({
                statusCode: 503,
            })
    })

    it('fails closed when Google returns malformed JSON', async () => {
        mockFetch({
            ok: true,
            json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
        })

        await expect(service.verify('test-token'))
            .rejects.toMatchObject({
                statusCode: 503,
            })
    })

    it('fails closed when the response does not contain success: true', async () => {
        mockFetch({
            ok: true,
            json: vi.fn().mockResolvedValue({}),
        })

        await expect(service.verify('test-token'))
            .rejects.toMatchObject({
                statusCode: 400,
            })
    })
})
