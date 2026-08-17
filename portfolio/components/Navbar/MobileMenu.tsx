"use client"
import Link from "next/link"

type NavigationItem = {
    number: string
    label: string
    href: string
}

type MobileMenuProps = {
    open: boolean
    navigation: NavigationItem[]
    onClose: () => void
}

export default function MobileMenu({
    open,
    navigation,
    onClose,
}: MobileMenuProps) {
    return (
        <div
            className={`absolute inset-x-0 top-20 border-b border-white/10 bg-black/95 backdrop-blur-md transition-all duration-300 md:hidden ${open
                ? "visible translate-y-0 opacity-100"
                : "invisible -translate-y-4 opacity-0"
                }`}
        >
            <div className="px-6 py-8">
                <div className="flex flex-col">
                    {navigation.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className="group flex items-center gap-4 border-b border-white/10 py-5 text-lg text-white/70 transition-colors hover:text-white"
                        >
                            <span className="text-xs text-orange-500">
                                {item.number}
                            </span>

                            <span>{item.label}</span>
                        </Link>
                    ))}

                    <Link
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={onClose}
                        className="mt-5 flex items-center gap-2 py-3 text-lg font-medium text-white"
                    >
                        Resume
                        <span>↗</span>
                    </Link>
                </div>
            </div>
        </div>
    )
}