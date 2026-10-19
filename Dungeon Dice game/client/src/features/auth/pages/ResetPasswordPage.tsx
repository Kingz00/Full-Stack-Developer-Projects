import { Form, Link, useActionData, useNavigation, useSearchParams } from 'react-router-dom'

import logo from '../../../assets/branding/dungeon-dice-duel-logo.png'
import './AuthPage.css'

interface ResetPasswordActionData {
    success?: boolean
    message?: string
    fieldErrors?: {
        password?: string
        confirmPassword?: string
        form?: string
    }
}

function ResetPasswordPage() {
    const actionData = useActionData() as ResetPasswordActionData | undefined

    const navigation = useNavigation()
    const [searchParams] = useSearchParams()

    const token = searchParams.get('token')
    const isSubmitting = navigation.state === 'submitting'

    const hasInvalidLink = !token && !actionData?.success

    return (
        <main className="auth-page">
            <section
                className="auth-card ornate-frame"
                aria-labelledby="reset-password-title"
            >
                <div className="auth-card__brand">
                    <img src={logo} alt="Dungeon Dice Duel" />
                </div>

                <div className="auth-card__divider" aria-hidden="true">
                    <span />
                </div>

                <div className="auth-card__header">
                    <p className="auth-card__eyebrow">
                        Account recovery
                    </p>

                    <h1 id="reset-password-title">
                        {actionData?.success
                            ? 'Password reset'
                            : hasInvalidLink
                                ? 'Invalid reset link'
                                : 'Choose a new password'}
                    </h1>

                    <p>
                        {actionData?.success
                            ? actionData.message ??
                            'Your password has been reset successfully.'
                            : hasInvalidLink
                                ? 'This page needs a valid password-reset link. You can request a new one below.'
                                : 'Enter your new password. The reset link is valid for one hour.'}
                    </p>
                </div>

                {actionData?.success ? (
                    <div className="confirmation-card__actions">
                        <Link
                            className="auth-form__submit confirmation-card__button-link"
                            to="/login"
                        >
                            Sign in with your new password
                        </Link>
                    </div>
                ) : hasInvalidLink ? (
                    <div className="confirmation-card__actions">
                        <Link
                            className="auth-form__submit confirmation-card__button-link"
                            to="/forgot-password"
                        >
                            Request a new reset link
                        </Link>
                    </div>
                ) : (
                    <Form method="post" className="auth-form">
                        <div className="auth-form__field">
                            <label htmlFor="password">
                                New password
                            </label>

                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                aria-invalid={Boolean(
                                    actionData?.fieldErrors?.password,
                                )}
                                aria-describedby={
                                    actionData?.fieldErrors?.password
                                        ? 'password-error'
                                        : undefined
                                }
                            />

                            {actionData?.fieldErrors?.password && (
                                <p
                                    id="password-error"
                                    className="auth-form__error"
                                    role="alert"
                                >
                                    {actionData.fieldErrors.password}
                                </p>
                            )}
                        </div>

                        <div className="auth-form__field">
                            <label htmlFor="confirmPassword">
                                Confirm new password
                            </label>

                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                aria-invalid={Boolean(
                                    actionData?.fieldErrors?.confirmPassword,
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
                            aria-busy={isSubmitting}
                        >
                            {isSubmitting && (
                                <span
                                    className="loading-spinner loading-spinner--small"
                                    aria-hidden="true"
                                />
                            )}

                            {isSubmitting
                                ? 'Resetting password...'
                                : 'Reset password'}
                        </button>
                    </Form>
                )}

                {!actionData?.success && (
                    <p className="auth-card__footer">
                        <Link to="/login">Return to sign in</Link>
                    </p>
                )}
            </section>
        </main>
    )
}

export default ResetPasswordPage