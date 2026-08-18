export type Project = {
    id: string
    title: string
    slug: string
    number?: string
    description: string
    longDescription: string
    image: string
    technologies: string[]
    featuredTechnologies: string[]
    technicalDetails: {
        frontend?: string
        backend?: string
        database?: string
        other?: string
    }
    features: string[]
    highlights: string[]
    challenges: string[]
    screenshots: ProjectScreenshot[]
    githubUrl: string
    liveUrl?: string
}

export type ProjectScreenshot = {
    src: string
    alt: string
    caption: string
}