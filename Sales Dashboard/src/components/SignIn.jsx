import { useActionState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";


const SignIn = () => {

    const { signInUser } = useContext(AuthContext);

    const navigate = useNavigate()

    const signInAction = async (prevState, formData) => {

        //1. Extract form data
        const email = formData.get('email')
        const password = formData.get('password')

        //2. Call our sign-in function
        const {
            success,
            data,
            error: signInError,
        } = await signInUser(email, password);

        //3. Handle known errors 
        if (signInError) {
            return {
                message: signInError
            }
        }
        //4. Handle success
        if (success && data?.session) {
            //Navigate to /dashboard
            navigate('/dashboard')
            return null;
        }
        //5. Handle any other cases (safety net)
        return null;
    }

    const [error, submitAction, isPending] = useActionState(signInAction, null)

    return (
        <>
            <h1 className="landing-header">Paper Like A Boss</h1>
            <div className="sign-form-container">
                <form
                    action={submitAction}
                    aria-label="Sign in form"
                    aria-describedby="form-description"
                >
                    <div id="form-description" className="sr-only">
                        Use this form to sign in to your account. Enter your email and
                        password.
                    </div>

                    <h2 className="form-title">Sign in</h2>
                    <p>
                        Don't have an account yet?{' '}
                        <Link to={'/signup'} className="form-link">
                            Sign up
                        </Link>
                    </p>

                    <label htmlFor="email">Email</label>
                    <input
                        className="form-input"
                        type="email"
                        name="email"
                        id="email"
                        placeholder=""
                        required
                        aria-required="true"
                        aria-invalid={error ? 'true' : 'false'}
                        aria-describedby={error ? 'signin-error' : undefined}
                        disabled={isPending}
                    />

                    <label htmlFor="password">Password</label>
                    <input
                        className="form-input"
                        type="password"
                        name="password"
                        id="password"
                        placeholder=""
                        required
                        aria-required="true"
                        aria-invalid={error ? 'true' : 'false'}
                        aria-describedby={error ? 'signin-error' : undefined}
                        disabled={isPending}
                    />

                    <button
                        type="submit"
                        className="form-button"
                        disabled={isPending}
                        aria-busy={isPending}
                    >
                        {isPending ? 'Signing in...' : 'Sign In'}
                    </button>

                    {error && (
                        <div
                            id="signin-error"
                            role="alert"
                            className="sign-form-error-message"
                        >
                            {error.message}
                        </div>
                    )}
                </form>
            </div>
        </>
    );
};

export default SignIn;