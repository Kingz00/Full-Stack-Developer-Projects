export default function About() {
    return (
        <section
            id="about"
            className="scroll-mt-24 px-6 py-24 sm:py-32"
        >
            <div className="mx-auto max-w-7xl">
                {/* Section heading */}
                <div className="mb-16 flex items-center gap-3 text-sm">
                    <span className="font-medium text-orange-500">
                        02
                    </span>

                    <span className="h-px w-8 bg-white/20" />

                    <span className="uppercase tracking-[0.2em] text-white/40">
                        About
                    </span>
                </div>

                <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20">
                    {/* Introduction */}
                    <div>
                        <h2 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                            I'm a full-stack developer who enjoys building
                            things for the web.
                        </h2>

                        <div className="mt-8 max-w-2xl space-y-5 text-lg leading-8 text-white/60">
                            <p>
                                I'm a developer focused on building modern,
                                responsive web applications with JavaScript,
                                TypeScript, React, and Next.js.
                            </p>

                            <p>
                                I enjoy turning ideas into functional
                                experiences, from polished user interfaces
                                to full-stack applications backed by APIs
                                and databases.
                            </p>

                            <p>
                                I'm continually expanding my skills by
                                building real-world projects and exploring
                                new technologies across the web development
                                ecosystem.
                            </p>
                        </div>
                    </div>

                    {/* Skills */}
                    <div className="lg:pt-2">
                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1">
                            <div>
                                <h3 className="mb-4 text-sm font-medium uppercase tracking-[0.15em] text-orange-500">
                                    Frontend
                                </h3>

                                <div className="flex flex-wrap gap-x-4 gap-y-2 text-white/70">
                                    <span>React</span>
                                    <span>Next.js</span>
                                    <span>TypeScript</span>
                                    <span>JavaScript</span>
                                    <span>Tailwind CSS</span>
                                </div>
                            </div>

                            <div>
                                <h3 className="mb-4 text-sm font-medium uppercase tracking-[0.15em] text-orange-500">
                                    Backend
                                </h3>

                                <div className="flex flex-wrap gap-x-4 gap-y-2 text-white/70">
                                    <span>Node.js</span>
                                    <span>Express</span>
                                    <span>REST APIs</span>
                                    <span>SQLite</span>
                                    <span>Supabase</span>
                                </div>
                            </div>

                            <div>
                                <h3 className="mb-4 text-sm font-medium uppercase tracking-[0.15em] text-orange-500">
                                    Tools
                                </h3>

                                <div className="flex flex-wrap gap-x-4 gap-y-2 text-white/70">
                                    <span>Git</span>
                                    <span>GitHub</span>
                                    <span>Vite</span>
                                    <span>VS Code</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}