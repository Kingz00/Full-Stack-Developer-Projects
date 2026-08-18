"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import MobileMenu from "@/components/Navbar/MobileMenu"

const navigation = [
    {
        number: "01",
        label: "Work",
        href: "/#projects",
    },
    {
        number: "02",
        label: "About",
        href: "/#about",
    },
    {
        number: "03",
        label: "Contact",
        href: "/#contact",
    },
]

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false)

    useEffect(() => {
        if (!menuOpen) return

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setMenuOpen(false)
            }
        }

        document.addEventListener("keydown", handleKeyDown)

        return () => {
            document.removeEventListener("keydown", handleKeyDown)
        }
    }, [menuOpen])

    return (
        <header className="fixed inset-x-0 top-0 z-50">
            <nav className="border-b border-white/10 bg-black/80 backdrop-blur-md">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="text-sm font-semibold tracking-[0.2em] text-white"
                    >
                        KINGSLEY
                    </Link>

                    {/* Desktop navigation */}
                    <div className="hidden items-center gap-8 md:flex">
                        {navigation.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="group flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
                            >
                                <span className="text-xs text-orange-500/80">
                                    {item.number}
                                </span>

                                <span>{item.label}</span>
                            </Link>
                        ))}

                        <span className="h-5 w-px bg-white/10" />

                        <Link
                            href="/resume.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-2 text-sm font-medium text-white transition-colors hover:text-orange-400"
                        >
                            Resume

                            <span className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                                ↗
                            </span>
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        type="button"
                        aria-label={menuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={menuOpen}
                        aria-controls="mobile-navigation"
                        onClick={() => setMenuOpen((open) => !open)}
                        className="relative z-50 flex h-10 w-10 items-center justify-center text-white md:hidden"
                    >
                        <span className="text-xl">
                            {menuOpen ? "×" : "☰"}
                        </span>
                    </button>
                </div>
            </nav>

            {/* Mobile navigation */}
            <MobileMenu
                open={menuOpen}
                navigation={navigation}
                onClose={() => setMenuOpen(false)}
            />
        </header>
    )
}