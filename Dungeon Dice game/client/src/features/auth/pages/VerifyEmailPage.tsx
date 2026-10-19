import { Link, useLoaderData } from 'react-router-dom'

import type { EmailVerificationResult } from '../loaders/emailVerificationLoader'
import logo from '../../../assets/branding/dungeon-dice-duel-logo.png'
import './AuthPage.css'

function VerifyEmailPage() {
    const result = useLoaderData() as EmailVerificationResult

    return (
        <main className="auth-page">
            <section
                className="auth-card ornate-frame confirmation-card"
                aria-labelledby="verify-email-title"
            >
                <div className="auth-card__brand">
                    <img src={logo} alt="Dungeon Dice Duel" />
                </div>

                <div className="auth-card__divider" aria-hidden="true">
                    <span />
                </div>

                <div className="auth-card__header">
                    <p className="auth-card__eyebrow">
                        Account verification
                    </p>

                    <h1 id="verify-email-title">
                        {result.verified
                            ? 'Email verified'
                            : 'Verification unsuccessful'}
                    </h1>

                    <p role="status">{result.message}</p>
                </div>

                <div className="confirmation-card__details">
                    {result.verified ? (
                        <p>
                            Your email address is confirmed. You're ready
                            to continue your adventure.
                        </p>
                    ) : (
                        <p>
                            Email verification is optional. You can still
                            continue playing without verifying your address.
                        </p>
                    )}
                </div>

                <div className="confirmation-card__actions">
                    <Link
                        className="auth-form__submit confirmation-card__button-link"
                        to="/game"
                    >
                        Continue to the game
                    </Link>
                </div>
            </section>
        </main>
    )
}

export default VerifyEmailPage