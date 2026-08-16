"use client";

import Link from "next/link";
import { useState } from "react";

type NavLink = {
    label: string;
    href: string;
};

type MobileMenuProps = {
    navLinks: NavLink[];
};

export default function MobileMenu({
    navLinks,
}: MobileMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    const closeMenu = () => {
        setIsOpen(false);
    };

    return (
        <div className="md:hidden">
            {/* Menu Button */}
            <button
                type="button"
                onClick={() => setIsOpen((previous) => !previous)}
                className="relative z-50 flex size-10 items-center justify-center text-zinc-100 transition-colors duration-200 hover:text-orange-500"
                aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={isOpen}
                aria-controls="mobile-navigation"
            >
                {isOpen ? (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-6"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18 18 6M6 6l12 12"
                        />
                    </svg>
                ) : (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-6"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                        />
                    </svg>
                )}
            </button>

            {/* Mobile Menu */}
            <div
                id="mobile-navigation"
                className={`fixed inset-0 z-40 bg-zinc-950 transition-all duration-300 ease-in-out
                            ${isOpen ? "visible opacity-100" : "invisible opacity-0"}`}
            >
                <nav
                    className="flex h-full flex-col px-6 pb-10 pt-32"
                    aria-label="Mobile navigation"
                >
                    {/* Navigation Links */}
                    <div className="flex flex-col">
                        {navLinks.map((link, index) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={closeMenu}
                                className="border-b border-white/10 py-5 font-heading text-4xl font-medium tracking-tight text-zinc-100 transition-colors duration-200 hover:text-orange-500"
                            >
                                <span className="mr-4 text-sm text-zinc-600">
                                    0{index + 1}
                                </span>

                                {link.label}
                            </Link>
                        ))}

                        {/* Resume */}
                        <Link
                            href="/resume"
                            onClick={closeMenu}
                            className="mt-8 inline-flex w-fit items-center gap-2 border border-orange-500/60 px-5 py-3 font-sans text-sm font-medium text-orange-500 transition-colors duration-200 hover:bg-orange-500 hover:text-zinc-950"
                        >
                            Resume
                            <span aria-hidden="true">↗</span>
                        </Link>
                    </div>

                    {/* Bottom information */}
                    <div className="mt-auto">
                        <p className="font-sans text-xs uppercase tracking-[0.2em] text-zinc-600">
                            Full-Stack Developer
                        </p>
                    </div>
                </nav>
            </div>
        </div>
    );
}