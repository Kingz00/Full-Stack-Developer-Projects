import React, { useEffect, useState } from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"
import { onAuthStateChanged } from "firebase/auth"
import Avatar_Icon from "../assets/images/avatar-icon.png"
import { auth } from "../firebase"
import { logoutUser } from "../api"

export default function Header() {
    const activeStyles = {
        fontWeight: "bold",
        textDecoration: "underline",
        color: "#161616"
    }

    // State
    const [user, setUser] = useState(null)
    const [authLoading, setAuthLoading] = useState(true)

    const navigate = useNavigate()

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser)
            setAuthLoading(false)
        })

        return unsubscribe
    }, [])

    async function handleLogout() {
        try {
            await logoutUser()
            navigate("/login")
        } catch (error) {
            console.error("Logout error:", error)
        }
    }

    return (
        <header>
            <Link className="site-logo" to="/">#VanLife</Link>
            <nav>
                {user && (
                    <NavLink
                        to="host"
                        style={({ isActive }) =>
                            isActive ? activeStyles : null
                        }
                    >
                        Host
                    </NavLink>
                )}

                <NavLink
                    to="about"
                    style={({ isActive }) =>
                        isActive ? activeStyles : null
                    }
                >
                    About
                </NavLink>

                <NavLink
                    to="vans"
                    style={({ isActive }) =>
                        isActive ? activeStyles : null
                    }
                >
                    Vans
                </NavLink>

                {!authLoading && (user ? (
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="logout-button"
                    >
                        Log out
                    </button>
                ) : (
                    <Link to="login" className="login-link">
                        <img
                            src={Avatar_Icon}
                            className="login-icon"
                            alt="Log in"
                        />
                    </Link>
                ))}
            </nav>
        </header>
    )
}