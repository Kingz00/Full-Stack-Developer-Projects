import { Form, Link, redirect, useActionData, useNavigation } from "react-router-dom"

import { registerUser } from "../api"

export async function action({ request }) {
    const formData = await request.formData()

    const name = formData.get("name")
    const email = formData.get("email")
    const password = formData.get("password")
    const confirmPassword = formData.get("confirmPassword")

    if (!name || !email || !password || !confirmPassword) {
        return {
            error: "Please fill in all fields."
        }
    }

    if (password !== confirmPassword) {
        return {
            error: "Passwords do not match."
        }
    }

    if (password.length < 6) {
        return {
            error: "Password must be at least 6 characters."
        }
    }

    try {
        await registerUser({
            name,
            email,
            password
        })

        return redirect("/host")
    } catch (error) {
        console.error("Registration error:", error)

        if (error.code === "auth/email-already-in-use") {
            return {
                error: "An account with this email already exists."
            }
        }

        if (error.code === "auth/invalid-email") {
            return {
                error: "Please enter a valid email address."
            }
        }

        if (error.code === "auth/weak-password") {
            return {
                error: "Please choose a stronger password."
            }
        }

        return {
            error: error.message || "Unable to create your account. Please try again."
        }
    }
}

export default function Register() {
    const actionData = useActionData()
    const navigation = useNavigation()

    const isSubmitting = navigation.state === "submitting"

    return (
        <main className="register-page">
            <h1>Create your account</h1>

            <Form method="post">
                <label htmlFor="name">Name</label>
                <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                />

                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                />

                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                />

                <label htmlFor="confirmPassword">Confirm password</label>
                <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                />

                {actionData?.error && (
                    <p role="alert">{actionData.error}</p>
                )}

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating account..." : "Create account"}
                </button>
            </Form>

            <p>
                Already have an account?{" "}
                <Link to="/login">Log in</Link>
            </p>
        </main>
    )
}