import type { Project } from "@/libs/types/project"

export const projects: Project[] = [
    {
        id: "assembly-endgame",
        title: "Assembly Endgame",
        slug: "assembly-endgame",
        description:
            "A word-guessing game where players try to save the programming world before all eight programming languages are eliminated.",
        longDescription:
            "Assembly Endgame is an interactive word-guessing game built with React. Players attempt to reveal a hidden word while incorrect guesses progressively eliminate programming languages from the game. The application includes visual game states, keyboard interaction, win and loss conditions, and a new-game flow.",
        image: "/projects/assembly-endgame.png",
        technologies: [
            "React",
            "TypeScript",
            "Vite",
            "CSS",
            "React Confetti",
            "clsx",
        ],
        featuredTechnologies: ["React", "TypeScript", "Vite", "CSS"],
        features: [
            "Interactive word guessing",
            "On-screen keyboard",
            "Progressive language elimination",
            "Win and loss states",
            "New game functionality",
            "Confetti celebration on victory",
            "Responsive interface",
        ],
        highlights: [
            "React state management",
            "Conditional rendering",
            "Reusable components",
            "Interactive game logic",
            "Dynamic UI states",
        ],
        githubUrl:
            "https://github.com/Kingz00/Full-Stack-Developer-Projects/tree/210511a19f5c3aff945cb640162d91a5b8ceeeb2/Assembly%20Endgame%20-%20TypeScript",
        liveUrl: "https://kingz-assembly-endgame-project.netlify.app/"
    },

    {
        id: "vanlife",
        title: "VanLife",
        slug: "vanlife",
        description:
            "A responsive van-rental application with customer browsing, authentication, dynamic van pages, and a protected host dashboard.",
        longDescription:
            "VanLife is a responsive van-rental web application built with React and React Router. It provides a customer-facing experience for browsing and exploring vans alongside an authenticated host dashboard for managing van information. The project focuses heavily on React Router's data APIs, nested routes, dynamic routes, loaders, actions, protected routes, and error handling.",
        image: "/projects/vanlife.png",
        technologies: [
            "React",
            "React Router",
            "JavaScript",
            "Vite",
            "CSS",
            "MirageJS",
            "Firebase",
        ],
        featuredTechnologies: ["React", "React Router", "Firebase", "CSS"],
        features: [
            "Browse van listings",
            "Search and filter vans",
            "Dynamic van detail pages",
            "User login",
            "Protected host routes",
            "Host dashboard",
            "Host van management",
            "Loading and error states",
            "Responsive interface",
        ],
        highlights: [
            "React Router data APIs",
            "Nested routes",
            "Dynamic routes",
            "Route loaders and actions",
            "Protected routes",
            "Authentication flow",
            "Mock API integration",
        ],
        githubUrl:
            "https://github.com/Kingz00/Full-Stack-Developer-Projects/tree/main/VanLife",
        liveUrl: "https://kingz-vanlife-project.netlify.app/",
    },

    {
        id: "print-forge",
        title: "Print Forge",
        slug: "print-forge",
        description:
            "A full-stack 3D-printing model discovery platform with search, sorting, categories, pagination, and SQLite-powered data.",
        longDescription:
            "Print Forge is a full-stack 3D-printing model discovery platform built with Next.js, TypeScript, Tailwind CSS, and SQLite. Users can browse a catalog of printable models, search and sort results, filter models by category, navigate paginated results, and view individual model information.",
        image: "/projects/print-forge.png",
        technologies: [
            "Next.js",
            "React",
            "TypeScript",
            "Tailwind CSS",
            "SQLite",
            "sqlite3",
            "Heroicons",
            "React Icons",
        ],
        featuredTechnologies: ["Next.js", "TypeScript", "Tailwind CSS", "SQLite"],
        features: [
            "Browse 3D-printable models",
            "Search models",
            "Sort model results",
            "Category browsing",
            "Pagination",
            "Individual model pages",
            "URL-based search parameters",
            "Server-side data fetching",
            "Responsive interface",
        ],
        highlights: [
            "Next.js App Router",
            "Server Components",
            "SQLite integration",
            "TypeScript",
            "URL query parameters",
            "Search and sorting logic",
            "Pagination",
            "Separation of data access and presentation",
        ],
        githubUrl:
            "https://github.com/Kingz00/Full-Stack-Developer-Projects/tree/main/Print%20Forge",
        liveUrl: "https://kingz-print-forge.netlify.app/",
    },

    {
        id: "spiral-sounds",
        title: "Spiral Sounds",
        slug: "spiral-sounds",
        description:
            "A full-stack vinyl record store with a product catalog, search, genre filtering, authentication, and persistent shopping cart.",
        longDescription:
            "Spiral Sounds is a full-stack online vinyl record store built with Node.js, Express, SQLite, and JavaScript. The application exposes REST-style APIs for products, authentication, user information, and shopping-cart operations while providing a storefront for browsing and purchasing vinyl records.",
        image: "/projects/spiral-sounds.png",
        technologies: [
            "Node.js",
            "Express",
            "JavaScript",
            "SQLite",
            "REST APIs",
            "Express Session",
            "bcryptjs",
            "Validator",
        ],
        featuredTechnologies: ["Node.js", "Express", "JavaScript", "SQLite"],
        features: [
            "Browse vinyl records",
            "Product search",
            "Genre filtering",
            "User registration",
            "User login and logout",
            "Session-based authentication",
            "Password hashing",
            "Shopping cart",
            "Cart quantity management",
            "Cart totals",
        ],
        highlights: [
            "REST API design",
            "Express routing",
            "SQLite database integration",
            "Authentication",
            "Password hashing",
            "Session management",
            "HTTP-only cookies",
            "CRUD operations",
            "Shopping-cart logic",
        ],
        githubUrl:
            "https://github.com/Kingz00/Full-Stack-Developer-Projects/tree/main/Spiral%20Sounds",
        liveUrl: "https://spiral-sounds-408t.onrender.com",
    },
]