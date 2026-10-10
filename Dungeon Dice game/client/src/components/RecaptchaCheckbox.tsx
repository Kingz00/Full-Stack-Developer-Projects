import { useEffect, useRef, useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'

interface RecaptchaCheckboxProps {
    resetKey: number
}

function RecaptchaCheckbox({ resetKey }: RecaptchaCheckboxProps) {
    const captchaRef = useRef<ReCAPTCHA>(null)
    const [token, setToken] = useState<string | null>(null)

    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY

    useEffect(() => {
        captchaRef.current?.reset()
        setToken(null)
    }, [resetKey])

    if (!siteKey) {
        return (
            <p className="auth-form__error" role="alert">
                CAPTCHA is not configured. Please try again later.
            </p>
        )
    }

    return (
        <div className="auth-form__captcha">
            <ReCAPTCHA
                ref={captchaRef}
                sitekey={siteKey}
                onChange={setToken}
                onExpired={() => setToken(null)}
                onErrored={() => setToken(null)}
            />

            <input
                type="hidden"
                name="recaptchaToken"
                value={token ?? ''}
            />
        </div>
    )
}

export default RecaptchaCheckbox
