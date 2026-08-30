import { onAuthStateChanged } from "firebase/auth"
import { auth } from "./firebase"
import { redirect } from "react-router-dom"

function getCurrentUser() {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe()
            resolve(user)
        })
    })
}

export async function requireAuth(request) {
    const pathname = new URL(request.url).pathname
    const user = await getCurrentUser()

    if (!user) {
        throw redirect(
            `/login?message=You must log in first.&redirectTo=${pathname}`
        )
    }

    return user
}
