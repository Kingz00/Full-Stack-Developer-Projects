import Link from "next/link";
import MobileMenu from "@/components/Navbar/MobileMenu";

const navLinks = [
    { label: "Work", href: "/#work" },
    { label: "About", href: "/#about" },
    { label: "Contact", href: "/#contact" },
];

export default function Navbar() {
    return (
        <header className="fixed inset-x-0 top-0 z-50">
            <nav
                className="mx-auto flex h-20 max-w-7xl items-center justify-between border-b border-white/10 px-6 lg:px-8"
                aria-label="Main navigation"
            >
                {/* Logo */}
                <Link
                    href="/"
                    className="font-heading text-xl font-semibold tracking-tight text-zinc-100 transition-colors hover:text-orange-500"
                >
                    KINGSLEY
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden items-center gap-8 md:flex">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="font-sans text-sm font-medium text-zinc-400 transition-colors duration-200 hover:text-zinc-100"
                        >
                            {link.label}
                        </Link>
                    ))}

                    {/* Resume */}
                    <Link
                        href="/resume"
                        className="ml-2 inline-flex items-center gap-1.5 border border-orange-500/60 px-4 py-2 font-sans text-sm font-medium text-orange-500 transition-all duration-200 hover:bg-orange-500 hover:text-zinc-950"
                    >
                        Resume
                        <span aria-hidden="true">↗</span>
                    </Link>
                </div>

                {/* Mobile Navigation */}
                <MobileMenu navLinks={navLinks} />
            </nav>
        </header>
    );
}