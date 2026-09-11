import React from "react"

export default function Footer() {
    const currentYear = new Date().getFullYear()
    return (
        <footer>&#169; {currentYear} #VANLIFE</footer>
    )
}
