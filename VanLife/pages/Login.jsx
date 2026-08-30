import React from "react"
import {
    Link,
    useLoaderData,
    useNavigation,
    Form,
    redirect,
    useActionData
} from "react-router-dom"
import { loginUser } from "../api"

export function loader({ request }) {
    return new URL(request.url).searchParams.get("message")
}

export async function action({ request }) {
    const formData = await request.formData()

    const email = formData.get("email")
    const password = formData.get("password")
    const pathname = new URL(request.url).searchParams.get("redirectTo") || "/host"

    try {
        await loginUser({
            email,
            password
        })

        return redirect(pathname)
    } catch (error) {
        console.error("Login error:", error)

        if (
            error.code === "auth/invalid-credential" ||
            error.code === "auth/user-not-found" ||
            error.code === "auth/wrong-password"
        ) {
            return {
                error: "Invalid email or password."
            }
        }

        if (error.code === "auth/invalid-email") {
            return {
                error: "Please enter a valid email address."
            }
        }

        return {
            error: "Unable to log in. Please try again."
        }
    }
}

export default function Login() {
    const errorMessage = useActionData()
    const message = useLoaderData()
    const navigation = useNavigation()

    return (
        <div className="login-container">
            <h1>Sign in to your account</h1>
            {message && <h3 className="red">{message}</h3>}
            {errorMessage?.error && <h3 className="red">{errorMessage?.error}</h3>}

            <Form
                method="post"
                className="login-form"
                replace
            >
                <input
                    name="email"
                    type="email"
                    placeholder="Email address"
                />
                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                />
                <button
                    disabled={navigation.state === "submitting"}
                >
                    {navigation.state === "submitting"
                        ? "Logging in..."
                        : "Log in"
                    }
                </button>
            </Form>
            <p>
                Don't have an account?{" "}
                <Link to="/register">Create one</Link>
            </p>
        </div>
    )
}
