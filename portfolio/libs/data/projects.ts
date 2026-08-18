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
        technicalDetails: {
            frontend: "React with TypeScript and CSS",
            other:
                "Vite, React Confetti, clsx, React state management, conditional rendering, and reusable components",
        },
        challenges: [
            "Managing the different states of the game as players make guesses.",
            "Tracking guessed letters and determining when a word has been completed.",
            "Progressively eliminating programming languages based on incorrect guesses.",
            "Providing clear visual feedback for active, winning, and losing game states.",
        ],
        screenshots: [
            {
                src: "/projects/assembly-endgame-main.png",
                alt: "Assembly Endgame gameplay interface",
                caption: "The main gameplay interface with the word board and on-screen keyboard.",
            },
            {
                src: "/projects/assembly-endgame-winning-state.png",
                alt: "Assembly Endgame winning state",
                caption: "Winning the game triggers a celebration state with a new-game option.",
            },
            {
                src: "/projects/assembly-endgame-losing-state.png",
                alt: "Assembly Endgame losing state",
                caption: "The game-over state displays the revealed word and allows the player to start again.",
            },
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
        image: "/projects/vanlife-hero-section.png",
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
        technicalDetails: {
            frontend: "React with React Router and CSS",
            backend: "MirageJS mock API",
            other:
                "React Router loaders, actions, nested routes, dynamic routes, protected routes, Firebase authentication, and Vite",
        },
        challenges: [
            "Structuring the application around React Router's data-router APIs.",
            "Managing nested routes for the host dashboard and individual van pages.",
            "Protecting host routes so authenticated functionality is separated from the public application.",
            "Using loaders and actions to coordinate data fetching and form-related interactions.",
            "Handling loading and error states across multiple routes.",
        ],
        screenshots: [
            {
                src: "/projects/vanlife-hero-section.png",
                alt: "VanLife homepage",
                caption: "The customer-facing landing page for discovering and renting vans.",
            },
            {
                src: "/projects/vanlife-individual-van.png",
                alt: "VanLife individual van details",
                caption: "A dynamic van detail page with specifications, pricing, and a rental action.",
            },
            {
                src: "/projects/vanlife-host-dashboard.png",
                alt: "VanLife host dashboard",
                caption: "The protected host dashboard for viewing income, reviews, and listed vans.",
            },
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
        technicalDetails: {
            frontend: "Next.js, React, TypeScript, and Tailwind CSS",
            backend: "Next.js Server Components and server-side data access",
            database: "SQLite using sqlite and sqlite3",
            other:
                "URL query parameters, search and sorting logic, pagination, Heroicons, and React Icons",
        },
        challenges: [
            "Separating database access from the presentation layer to keep the application maintainable.",
            "Using URL query parameters to represent search, sorting, and pagination state.",
            "Building server-side data fetching around the Next.js App Router.",
            "Implementing pagination while retrieving only the records required for the current page.",
            "Keeping search, sorting, category filtering, and pagination working together consistently.",
        ],
        screenshots: [
            {
                src: "/projects/print-forge-3dmodels.png",
                alt: "Print Forge 3D models catalogue",
                caption: "The main catalogue for browsing available 3D-printable models.",
            },
            {
                src: "/projects/print-forge-filtered-results.png",
                alt: "Print Forge filtered model results",
                caption: "Category filtering and sorting allow users to narrow down the model catalogue.",
            },
            {
                src: "/projects/print-forge-model-details.png",
                alt: "Print Forge model details",
                caption: "A dedicated model page presenting details about an individual 3D-printable model.",
            },
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
        technicalDetails: {
            frontend: "JavaScript-based storefront",
            backend: "Node.js and Express REST APIs",
            database: "SQLite using sqlite3 and sqlite",
            other:
                "Express Session, bcryptjs, HTTP-only cookies, Validator, dotenv, CRUD operations, and RESTful route organization",
        },
        challenges: [
            "Designing a clear REST API structure for products, authentication, users, and cart operations.",
            "Implementing session-based authentication while keeping session cookies HTTP-only.",
            "Hashing user passwords with bcryptjs rather than storing credentials directly.",
            "Managing shopping-cart operations including quantities, totals, additions, removals, and clearing the cart.",
            "Separating controllers, routes, middleware, database access, and SQL into a maintainable backend structure.",
        ],
        screenshots: [
            {
                src: "/projects/spiral-sounds-product-catalogue.png",
                alt: "Spiral Sounds vinyl catalogue",
                caption: "The storefront catalogue with vinyl records, genres, pricing, and cart actions.",
            },
            {
                src: "/projects/spiral-sounds-filtered-results.png",
                alt: "Spiral Sounds filtered catalogue",
                caption: "Products can be filtered by genre while browsing the vinyl catalogue.",
            },
            {
                src: "/projects/spiral-sounds-shopping-cart.png",
                alt: "Spiral Sounds shopping cart",
                caption: "The persistent shopping cart displays selected records, quantities, and the running total.",
            },
        ],
        githubUrl:
            "https://github.com/Kingz00/Full-Stack-Developer-Projects/tree/main/Spiral%20Sounds",
        liveUrl: "https://spiral-sounds-408t.onrender.com",
    },
]