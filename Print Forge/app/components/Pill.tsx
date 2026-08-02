import type { ReactNode } from "react"

type PillProps = {
    children: ReactNode
    role?: string
    className?: string
}

export default function Pill({ children, role, className = "" }: PillProps) {
    return (
        <span
            className={`inline-block bg-transparent border border-gray-400 rounded-full px-3 py-1 text-sm text-gray-800 ${className}`}
        >
            {children}
        </span>
    )
}
