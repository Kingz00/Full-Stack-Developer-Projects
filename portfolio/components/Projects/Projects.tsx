import ProjectCard from "./ProjectCard"
import { projects } from "@/libs/data/projects"

export default function Projects() {
    return (
        <section
            id="projects"
            className="px-6 py-24"
        >
            <div className="mx-auto max-w-7xl">
                {/* Section heading */}
                <div className="mb-12 max-w-2xl">
                    <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-orange-500">
                        Featured Work
                    </p>

                    <h2 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                        Projects I've Built
                    </h2>

                    <p className="text-lg leading-8 text-white/60">
                        A selection of projects I've built while developing my
                        skills across frontend and full-stack web development.
                    </p>
                </div>

                {/* Projects grid */}
                <div className="grid gap-8 md:grid-cols-2">
                    {projects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}