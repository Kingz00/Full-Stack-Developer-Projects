'use client'

import Image from "next/image";
import PrintForgeLogo from '@/public/printforge-logo.svg'
import PrintForgeLogoIcon from '@/public/printforge-logo-icon.svg'
import Link from "next/link";
import { usePathname } from "next/navigation";

const Nav = () => {
    const pathName = usePathname()

    return (
        <header className="w-full bg-white">
            <nav className="flex justify-between px-6 py-4">
                <Link href='/'>
                    <div className="relative">
                        {/* Desktop logo */}
                        <Image
                            src={PrintForgeLogo}
                            alt="PrintForge Logo"
                            className="w-[200px] h-auto hidden md:block"
                        />
                        {/* Mobile logo */}
                        <Image
                            src={PrintForgeLogoIcon}
                            alt="PrintForge Logo"
                            className="w-[40px] h-auto block md:hidden"
                        />
                    </div>
                </Link>
                <ul className="flex items-center gap-2.5">
                    <li className={`text-sm uppercase cursor-pointer hover:underline hover:underline-offset-4 hover:text-[#F77429] ${pathName.startsWith("/3d-models") ? "underline underline-offset-4 text-[#F77429]" : null}`}>
                        <Link href="/3d-models">3D Models</Link>
                    </li>
                    <li className={`text-sm uppercase cursor-pointer hover:underline hover:underline-offset-4 hover:text-[#F77429] ${pathName === "/about" ? "underline underline-offset-4 text-[#F77429]" : null}`}>
                        <Link href="/about">About</Link>
                    </li>
                </ul>
            </nav>
        </header>
    )
}

export default Nav