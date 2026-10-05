import { Form, Link, useNavigation, useSearchParams, useActionData, useRouteLoaderData, Navigate } from 'react-router-dom'
import type { AuthUser } from '../loaders/authLoader'

import logo from '../../../assets/branding/dungeon-dice-duel-logo.png'
import './AuthPage.css'

interface RegisterActionData {
    fieldErrors?: {
        username?: string
        password?: string
        confirmPassword?: string
        form?: string
    }
}

function RegisterPage() {
    const navigation = useNavigation()
    const [searchParams] = useSearchParams()
    const actionData = useActionData() as RegisterActionData | undefined
    const user = useRouteLoaderData('root') as AuthUser | null

    if (user) {
        return <Navigate to="/" replace />
    }

    const heroId = searchParams.get('heroId')
    const isSubmitting = navigation.state === 'submitting'

    const loginPath = heroId
        ? `/login?heroId=${encodeURIComponent(heroId)}`
        : '/login'

    return (
        <main className="auth-page">
            <section className="auth-card" aria-labelledby="register-title">
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
                        Begin your quest
                    </p>

                    <h1 id="register-title">
                        Create your account
                    </h1>

                    <p>
                        Join the duel and begin your adventure.
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
                                role="alert"
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
                            autoComplete="new-password"
                            required
                        />
                    </div>

                    <div className="auth-form__field">
                        <label htmlFor="confirmPassword">
                            Confirm password
                        </label>

                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            required
                            aria-invalid={Boolean(
                                actionData?.fieldErrors?.confirmPassword
                            )}
                            aria-describedby={
                                actionData?.fieldErrors?.confirmPassword
                                    ? 'confirm-password-error'
                                    : undefined
                            }
                        />

                        {actionData?.fieldErrors?.confirmPassword && (
                            <p
                                id="confirm-password-error"
                                className="auth-form__error"
                                role="alert"
                            >
                                {actionData.fieldErrors.confirmPassword}
                            </p>
                        )}
                    </div>

                    {actionData?.fieldErrors?.form && (
                        <p className="auth-form__error" role="alert">
                            {actionData.fieldErrors.form}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="auth-form__submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? 'Creating account...'
                            : 'Create account'}
                    </button>
                </Form>

                <p className="auth-card__footer">
                    Already have an account?{' '}
                    <Link to={loginPath}>Sign in</Link>
                </p>
            </section>
        </main>
    )
}

export default RegisterPage