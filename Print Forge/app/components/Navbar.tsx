import Image from "next/image";
import PrintForgeLogo from '@/public/printforge-logo.svg'
import PrintForgeLogoIcon from '@/public/printforge-logo-icon.svg'
import Link from "next/link";

const Nav = () => {
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
                    <li className="text-sm uppercase cursor-pointer hover:underline hover:underline-offset-4 hover:text-[#F77429]">
                        <Link href="/3d-models">3D Models</Link>
                    </li>
                    <li className="text-sm uppercase cursor-pointer hover:underline hover:underline-offset-4 hover:text-[#F77429]">
                        <Link href="/about">About</Link>
                    </li>
                </ul>
            </nav>
        </header>
    )
}

export default Nav