import { useEffect, useState } from 'react'

interface Hero {
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

function App() {
    const [message, setMessage] = useState('Connecting to the server...')
    const [heroes, setHeroes] = useState<Hero[]>([])

    useEffect(() => {
        async function loadGameData() {
            try {
                const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

                if (!apiBaseUrl) {
                    throw new Error(
                        'VITE_API_BASE_URL is not configured.',
                    )
                }

                const healthResponse = await fetch(`${apiBaseUrl}/health`,
                    {
                        credentials: 'include',
                    }
                )

                if (!healthResponse.ok) {
                    throw new Error(
                        `Health check failed with status ${healthResponse.status}.`,
                    )
                }

                const healthData = await healthResponse.json()

                if (healthData.status !== 'ok') {
                    throw new Error('The server reported an unhealthy status.')
                }

                const heroesResponse = await fetch(`${apiBaseUrl}/heroes`,
                    {
                        credentials: 'include',
                    }
                )

                if (!heroesResponse.ok) {
                    throw new Error(
                        `Loading heroes failed with status ${heroesResponse.status}.`,
                    )
                }

                const heroesData: HeroesResponse = await heroesResponse.json()

                setHeroes(heroesData.heroes)
                setMessage('Connected to the Dungeon Dice Duel server.')
            } catch (error) {
                if (error instanceof TypeError) {
                    setMessage(
                        'Unable to connect to the Dungeon Dice Duel server.',
                    )
                    return
                }

                if (error instanceof Error) {
                    setMessage(error.message)
                    return
                }

                setMessage('An unexpected error occurred.')
            }
        }

        void loadGameData()
    }, [])

    return (
        <main>
            <h1>Dungeon Dice Duel</h1>

            <p>{message}</p>

            {heroes.length > 0 && (
                <p>{heroes.length} heroes loaded from the server.</p>
            )}
        </main>
    )
}

export default App