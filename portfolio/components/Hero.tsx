import Link from "next/link";

export default function Hero() {
    return (
        <section
            className="relative overflow-hidden px-6 pt-32 pb-20 lg:flex lg:min-h-[calc(100svh-5rem)] lg:items-center lg:px-8 lg:pt-20 lg:pb-20"
        >
            <div className="mx-auto w-full max-w-7xl">
                <div
                    className="grid items-center gap-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12"
                >
                    {/* Hero Content */}
                    <div>
                        {/* Availability */}
                        <div className="mb-8 flex items-center gap-3">
                            <span
                                className="size-2 rounded-full bg-accent"
                                aria-hidden="true"
                            />

                            <span
                                className="font-sans text-xs font-medium uppercase tracking-[0.2em] text-muted"
                            >
                                Available for opportunities
                            </span>
                        </div>

                        {/* Heading */}
                        <h1
                            className="font-heading text-6xl font-medium leading-[0.9] tracking-[-0.04em] text-foreground sm:text-7xl lg:text-8xl xl:text-9xl"
                        >
                            Full-Stack
                            <br />
                            <span className="text-accent">Developer</span>
                        </h1>

                        {/* Description */}
                        <p
                            className="mt-8 max-w-2xl font-sans text-base leading-relaxed text-muted sm:text-lg"
                        >
                            I build modern, responsive web applications
                            that solve real problems and deliver meaningful
                            user experiences.
                        </p>

                        {/* Actions */}
                        <div className="mt-10 flex flex-wrap items-center gap-4">
                            <Link
                                href="#work"
                                className="inline-flex items-center gap-2 bg-accent px-6 py-3 font-sans text-sm font-semibold text-zinc-950 transition-all duration-200 hover:brightness-110"
                            >
                                View Projects
                                <span aria-hidden="true">↓</span>
                            </Link>

                            <Link
                                href="https://github.com/Kingz00"
                                target="_blank"
                                rel="noopener noreferrer"
                                className=" inline-flex items-center gap-2 border border-border px-6 py-3 font-sans text-sm font-semibold text-foreground transition-colors duration-200 hover:border-zinc-500 hover:bg-surface"
                            >
                                GitHub
                                <span aria-hidden="true">↗</span>
                            </Link>
                        </div>
                    </div>

                    {/* Hero Visual */}
                    <div
                        className="relative mx-auto w-full max-w-lg lg:max-w-none"
                    >
                        <div
                            className="aspect-square border border-border bg-surface"
                        >
                            <div className="flex h-full items-center justify-center">
                                <span
                                    className="font-heading text-sm uppercase tracking-[0.3em] text-zinc-600"
                                >
                                    Visual
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div
                className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-3 lg:flex"
            >
                <span
                    className="font-sans text-[10px] font-medium uppercase tracking-[0.25em] text-zinc-600"
                >
                    Scroll to explore
                </span>

                <span
                    className="text-sm text-zinc-500"
                    aria-hidden="true"
                >
                    ↓
                </span>
            </div>
        </section>
    )
} 