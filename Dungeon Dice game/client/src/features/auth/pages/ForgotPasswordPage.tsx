import { Form, Link, useActionData, useNavigation } from 'react-router-dom'

import RecaptchaCheckbox from '../../../components/RecaptchaCheckbox'
import logo from '../../../assets/branding/dungeon-dice-duel-logo.png'
import './AuthPage.css'

interface RecoveryActionData {
    submitted?: boolean
    message?: string
    fieldErrors?: {
        email?: string
        form?: string
    }
}

function ForgotPasswordPage() {
    const actionData = useActionData() as RecoveryActionData | undefined

    const navigation = useNavigation()
    const isSubmitting = navigation.state === 'submitting'

    return (
        <main className="auth-page">
            <section
                className="auth-card ornate-frame"
                aria-labelledby="forgot-password-title"
            >
                <div className="auth-card__brand">
                    <img src={logo} alt="Dungeon Dice Duel" />
                </div>

                <div className="auth-card__divider" aria-hidden="true">
                    <span />
                </div>

                <div className="auth-card__header">
                    <p className="auth-card__eyebrow">
                        Recover your account
                    </p>

                    <h1 id="forgot-password-title">
                        Forgot password?
                    </h1>

                    <p>
                        Enter the email address associated with your
                        account to request a password-reset link.
                    </p>
                </div>

                {actionData?.submitted && (
                    <p
                        className="confirmation-card__notice"
                        role="status"
                    >
                        {actionData.message}
                    </p>
                )}

                {!actionData?.submitted && (
                    <Form method="post" className="auth-form">
                        <div className="auth-form__field">
                            <label htmlFor="email">
                                Email address
                            </label>

                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                maxLength={254}
                                required
                                aria-invalid={Boolean(
                                    actionData?.fieldErrors?.email,
                                )}
                                aria-describedby={
                                    actionData?.fieldErrors?.email
                                        ? 'email-error'
                                        : undefined
                                }
                            />

                            {actionData?.fieldErrors?.email && (
                                <p
                                    id="email-error"
                                    className="auth-form__error"
                                    role="alert"
                                >
                                    {actionData.fieldErrors.email}
                                </p>
                            )}
                        </div>

                        {actionData?.fieldErrors?.form && (
                            <p
                                className="auth-form__error"
                                role="alert"
                            >
                                {actionData.fieldErrors.form}
                            </p>
                        )}

                        <RecaptchaCheckbox key={navigation.state} />

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
                                ? 'Submitting...'
                                : 'Request reset link'}
                        </button>
                    </Form>
                )}

                <p className="auth-card__footer">
                    Remember your password?{' '}
                    <Link to="/login">Sign in</Link>
                </p>
            </section>
        </main>
    )
}

export default ForgotPasswordPage
