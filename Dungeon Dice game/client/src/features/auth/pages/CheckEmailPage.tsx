import { Link, useSearchParams } from 'react-router-dom'

import logo from '../../../assets/branding/dungeon-dice-duel-logo.webp'
import './AuthPage.css'

function CheckEmailPage() {
    const [searchParams] = useSearchParams()

    const email = searchParams.get('email')
    const emailStatus = searchParams.get('emailStatus')
    const heroId = searchParams.get('heroId')

    const emailWasSent = emailStatus === 'sent'

    const gamePath = heroId
        ? `/game?heroId=${encodeURIComponent(heroId)}`
        : '/game'

    return (
        <main className="auth-page">
            <section
                className="auth-card ornate-frame confirmation-card"
                aria-labelledby="check-email-title"
            >
                <div className="auth-card__brand">
                    <img src={logo} alt="Dungeon Dice Duel" />
                </div>

                <div className="auth-card__divider" aria-hidden="true">
                    <span />
                </div>

                <div className="auth-card__header">
                    <p className="auth-card__eyebrow">
                        {emailWasSent ? 'One last step' : 'Your adventure awaits'}
                    </p>

                    <h1 id="check-email-title">
                        {emailWasSent
                            ? 'Check your email'
                            : 'Account created successfully'}
                    </h1>

                    {emailWasSent ? (
                        <>
                            <p role="status">
                                We've sent a verification email to:
                            </p>

                            {email && (
                                <p className="confirmation-card__email">
                                    {email}
                                </p>
                            )}
                        </>
                    ) : (
                        <p role="status">
                            Your account was created, but we couldn't send
                            the verification email. This may be due to a
                            temporary delivery issue, a sending limit, or
                            another problem.
                        </p>
                    )}
                </div>

                <div className="confirmation-card__details">
                    {emailWasSent && (
                        <>
                            <p>
                                Please check your inbox when the email arrives.
                                If you can't find it, check your spam or junk folder.
                            </p>

                            <p>
                                Your verification link is valid for{' '}
                                <strong>24 hours</strong>.
                            </p>
                        </>
                    )}

                    <p>
                        <strong>Email verification is optional.</strong>{' '}
                        You can continue playing without verifying your
                        email address.
                    </p>

                    {!emailWasSent && (
                        <p>
                            You can continue to the game now. Email
                            verification can be completed later if you
                            receive a valid verification link.
                        </p>
                    )}
                </div>

                <div className="confirmation-card__actions">
                    <Link
                        className="auth-form__submit confirmation-card__button-link"
                        to={gamePath}
                    >
                        Continue to the game
                    </Link>
                </div>
            </section>
        </main>
    )
}

export default CheckEmailPage