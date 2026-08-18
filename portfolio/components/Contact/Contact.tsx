export default function Contact() {
    return (
        <section
            id="contact"
            className="scroll-mt-24 px-6 py-24 sm:py-32"
        >
            <div className="mx-auto max-w-7xl">
                <div className="border-t border-white/10 pt-12">
                    {/* Section label */}
                    <div className="mb-10 flex items-center gap-3 text-sm">
                        <span className="font-medium text-orange-500">
                            03
                        </span>

                        <span className="h-px w-8 bg-white/20" />

                        <span className="uppercase tracking-[0.2em] text-white/40">
                            Contact
                        </span>
                    </div>

                    <div className="grid gap-12 lg:grid-cols-[1.4fr_0.6fr] lg:items-end">
                        {/* CTA */}
                        <div>
                            <h2 className="max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
                                Let’s build something together.
                            </h2>

                            <p className="mt-8 max-w-xl text-lg leading-8 text-white/60">
                                I’m open to opportunities where I can contribute,
                                learn, and build meaningful products with a great team.
                            </p>
                        </div>

                        {/* Contact links */}
                        <div className="flex flex-col gap-5 lg:items-end">
                            <a
                                href="mailto:kingslex1995@gmail.com"
                                className="group inline-flex items-center gap-2 text-lg font-medium text-white transition-colors hover:text-orange-400"
                            >
                                Email me
                                <span className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1">
                                    ↗
                                </span>
                            </a>

                            <a
                                href="https://www.linkedin.com/in/kingsley-onwupeluonye-445361258"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex items-center gap-2 text-lg font-medium text-white/60 transition-colors hover:text-white"
                            >
                                LinkedIn
                                <span className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1">
                                    ↗
                                </span>
                            </a>

                            <a
                                href="https://github.com/Kingz00"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex items-center gap-2 text-lg font-medium text-white/60 transition-colors hover:text-white"
                            >
                                GitHub
                                <span className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1">
                                    ↗
                                </span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}