import ProjectCard from "./ProjectCard"
import { projects } from "@/libs/data/projects"

export default function Projects() {
    return (
        <section
            id="projects"
            className="px-6 py-24 sm:py-32"
        >
            <div className="mx-auto max-w-7xl">
                {/* Section heading */}
                <div className="mb-16 max-w-3xl">
                    <div className="mb-5 flex items-center gap-3 text-sm">
                        <span className="font-medium text-orange-500">
                            01
                        </span>

                        <span className="h-px w-8 bg-white/20" />

                        <span className="uppercase tracking-[0.2em] text-white/40">
                            Selected Work
                        </span>
                    </div>

                    <h2 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                        Projects I’ve Built
                    </h2>

                    <p className="max-w-2xl text-lg leading-8 text-white/60">
                        A selection of applications I’ve built across
                        frontend and full-stack development, with a focus on
                        responsive interfaces, practical functionality, and
                        modern web technologies.
                    </p>
                </div>

                {/* Projects */}
                <div className="grid gap-x-8 gap-y-20 md:grid-cols-2">
                    {projects.map((project, index) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            number={String(index + 1).padStart(2, "0")}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}