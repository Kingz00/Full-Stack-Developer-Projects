import Link from "next/link"
import ProjectCard from "@/components/Projects/ProjectCard"
import { projects } from "@/libs/data/projects"

export const metadata = {
    title: "Projects",
    description:
        "Explore my full portfolio of frontend and full-stack development projects.",
}

export default function ProjectsPage() {
    return (
        <main className="min-h-screen px-6 pb-24 pt-32 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-7xl">
                <div className="mb-16 max-w-3xl">
                    <Link
                        href="/"
                        className="mb-8 inline-block text-sm text-zinc-400 transition-colors hover:text-orange-400"
                    >
                        ← Back to Home
                    </Link>

                    <p className="mb-5 text-sm uppercase tracking-[0.2em] text-orange-500">
                        Portfolio
                    </p>

                    <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                        All Projects
                    </h1>

                    <p className="text-lg leading-8 text-white/60">
                        Explore the applications I’ve built across frontend
                        and full-stack development, including the technologies,
                        features, and engineering decisions behind each project.
                    </p>
                </div>

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
        </main>
    )
}
