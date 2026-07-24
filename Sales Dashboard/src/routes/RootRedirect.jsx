import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import { Navigate } from "react-router-dom"

const RootRedirect = () => {

    const { session } = useContext(AuthContext)

    if (session === undefined) {
        return <div>Loading...</div>
    }

    return session ? <Navigate to="/dashboard" /> : <Navigate to="/signin" />
}

export default RootRedirect