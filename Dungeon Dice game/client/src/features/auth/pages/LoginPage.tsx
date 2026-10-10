import { Form, Link, useNavigation, useSearchParams, useActionData, useRouteLoaderData, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import RecaptchaCheckbox from '../../../components/RecaptchaCheckbox'
import type { AuthUser } from '../loaders/authLoader'

import logo from '../../../assets/branding/dungeon-dice-duel-logo.png'
import './AuthPage.css'

interface LoginActionData {
    fieldErrors?: {
        username?: string
        password?: string
        form?: string
    }
}

function LoginPage() {
    const navigation = useNavigation()
    const [searchParams] = useSearchParams()
    const actionData = useActionData() as LoginActionData | undefined
    const user = useRouteLoaderData('root') as AuthUser | null
    const [captchaResetKey, setCaptchaResetKey] = useState(0)

    useEffect(() => {
        if (navigation.state === 'idle' && actionData) {
            setCaptchaResetKey((key) => key + 1)
        }
    }, [navigation.state, actionData])

    const heroId = searchParams.get('heroId')
    const isSubmitting = navigation.state === 'submitting'

    const registerPath = heroId
        ? `/register?heroId=${encodeURIComponent(heroId)}`
        : '/register'

    if (user) {
        return <Navigate to="/" replace />
    }

    return (
        <main className="auth-page">
            <section className="auth-card" aria-labelledby="login-title">
                <div className="auth-card__brand">
                    <img
                        src={logo}
                        alt="Dungeon Dice Duel"
                    />
                </div>

                <div className="auth-card__divider" aria-hidden="true">
                    <span />
                </div>

                <div className="auth-card__header">
                    <p className="auth-card__eyebrow">
                        Enter the dungeon
                    </p>

                    <h1 id="login-title">Welcome back</h1>

                    <p>
                        Sign in to continue your adventure.
                    </p>
                </div>

                <Form method="post" className="auth-form">
                    <div className="auth-form__field">
                        <label htmlFor="username">Username</label>

                        <input
                            id="username"
                            name="username"
                            type="text"
                            autoComplete="username"
                            required
                            aria-invalid={Boolean(
                                actionData?.fieldErrors?.username
                            )}
                            aria-describedby={
                                actionData?.fieldErrors?.username
                                    ? 'username-error'
                                    : undefined
                            }
                        />

                        {actionData?.fieldErrors?.username && (
                            <p
                                id="username-error"
                                className="auth-form__error"
                            >
                                {actionData.fieldErrors.username}
                            </p>
                        )}
                    </div>

                    <div className="auth-form__field">
                        <label htmlFor="password">Password</label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    {actionData?.fieldErrors?.form && (
                        <p className="auth-form__error" role="alert">
                            {actionData.fieldErrors.form}
                        </p>
                    )}

                    <RecaptchaCheckbox resetKey={captchaResetKey} />

                    <button
                        type="submit"
                        className="auth-form__submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Signing in...' : 'Sign in'}
                    </button>
                </Form>

                <p className="auth-card__footer">
                    Don't have an account?{' '}
                    <Link to={registerPath}>Create one</Link>
                </p>
            </section>
        </main>
    )
}

export default LoginPage