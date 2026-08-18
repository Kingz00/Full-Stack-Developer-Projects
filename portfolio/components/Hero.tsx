import Image from "next/image"
import Link from "next/link"
import HERO_VISUAL_IMAGE from "@/public/hero_visual.png"

export default function Hero() {
    return (
        <section id="hero" className="relative flex min-h-screen items-center px-6">
            <div className="mx-auto grid w-full max-w-7xl items-center gap-12 py-24 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 mb-4">
                {/* Hero Content */}
                <div className="max-w-3xl">
                    {/* Eyebrow */}
                    <div className="mb-6 flex items-center gap-3 text-sm">
                        <span className="h-px w-8 bg-orange-500" />

                        <span className="font-medium uppercase tracking-[0.2em] text-orange-500">
                            Full-Stack Developer
                        </span>
                    </div>

                    {/* Main heading */}
                    <h1 className="text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl">
                        I build modern web
                        <span className="block text-white/40">
                            applications that work.
                        </span>
                    </h1>

                    {/* Description */}
                    <p className="mt-8 max-w-2xl text-lg leading-8 text-white/60 sm:text-xl">
                        Building practical, responsive applications with
                        React, TypeScript, Next.js, and Node.js — from polished
                        interfaces to full-stack systems.
                    </p>

                    {/* Tech stack */}
                    <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/40">
                        <span>React</span>
                        <span>TypeScript</span>
                        <span>Next.js</span>
                        <span>Node.js</span>
                    </div>

                    {/* CTAs */}
                    <div className="mt-10 flex flex-wrap items-center gap-6">
                        <Link
                            href="#projects"
                            className="group inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 font-medium text-black transition-colors hover:bg-orange-400"
                        >
                            View My Work

                            <span className="transition-transform duration-300 group-hover:translate-x-1">
                                →
                            </span>
                        </Link>

                        <Link
                            href="#contact"
                            className="group inline-flex items-center gap-2 font-medium text-white transition-colors hover:text-orange-400"
                        >
                            Get In Touch

                            <span className="transition-transform duration-300 group-hover:translate-x-1">
                                →
                            </span>
                        </Link>
                    </div>
                </div>

                {/* Hero Visual */}
                <div className="relative w-full lg:justify-self-end lg:max-w-[560px]">
                    <Image
                        src={HERO_VISUAL_IMAGE}
                        alt=""
                        aria-hidden="true"
                        className="h-auto w-full"
                        priority
                    />
                </div>
            </div>

            {/* Scroll Indicator */}
            <Link
                href="#projects"
                aria-label="Scroll to explore projects"
                className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 text-white/40 transition-colors hover:text-white/70"
            >
                <span className="text-xs font-medium uppercase tracking-[0.2em]">
                    Scroll to explore
                </span>

                <span className="scroll-indicator flex h-8 w-5 items-start justify-center rounded-full border border-white/20 p-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                </span>
            </Link>
        </section>
    )
}