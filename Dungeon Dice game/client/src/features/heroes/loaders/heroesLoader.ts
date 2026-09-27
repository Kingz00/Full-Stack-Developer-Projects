export interface Hero {
    id: number
    name: string
    description: string
    imageUrl: string
    health: number
    attack: number
    defense: number
}

interface HeroesResponse {
    heroes: Hero[]
}

export async function heroesLoader(): Promise<Hero[]> {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

    if (!apiBaseUrl) {
        throw new Error('VITE_API_BASE_URL is not configured.')
    }

    const response = await fetch(`${apiBaseUrl}/heroes`)

    if (!response.ok) {
        throw new Error('Unable to load heroes.')
    }

    const data: HeroesResponse = await response.json()

    return data.heroes
}