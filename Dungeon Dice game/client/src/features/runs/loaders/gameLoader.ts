import { redirect, type LoaderFunctionArgs } from 'react-router-dom'

import type { Hero } from '../../heroes/loaders/heroesLoader'
import type { GameRun } from '../types'
import type { Battle } from '../../battles/types'

interface HeroesResponse {
    heroes: Hero[]
}

interface CurrentRunResponse {
    run: GameRun | null
}

export interface GameLoaderData {
    hero: Hero
    run: GameRun | null
    activeBattle: Battle | null
}

export async function gameLoader({ request }: LoaderFunctionArgs): Promise<GameLoaderData> {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

    if (!apiBaseUrl) {
        throw new Error('VITE_API_BASE_URL is not configured.')
    }

    const url = new URL(request.url)
    const heroIdParam = url.searchParams.get('heroId')

    const currentRunResponse = await fetch(`${apiBaseUrl}/runs/current`,
        {
            credentials: 'include'
        }
    )

    if (currentRunResponse.status === 401) {
        throw redirect('/login')
    }

    if (!currentRunResponse.ok) {
        throw new Error('Unable to determine the current run.')
    }

    const currentRunData: CurrentRunResponse = await currentRunResponse.json()

    const run = currentRunData.run

    /*
     * If an active run already exists, the backend is authoritative.
     * Ignore any heroId supplied in the URL.
     */
    if (run) {
        if (heroIdParam) {
            throw redirect('/game')
        }
    } else if (!heroIdParam) {
        /*
         * There is no active run and no hero has been selected
         * for a new run.
         */
        throw redirect('/')
    }

    const response = await fetch(`${apiBaseUrl}/heroes`)

    if (!response.ok) {
        throw new Error('Unable to load heroes.')
    }

    const data: HeroesResponse = await response.json()

    const selectedHeroId = run ? run.selectedHeroId : Number(heroIdParam)

    if (
        !Number.isInteger(selectedHeroId) ||
        selectedHeroId <= 0
    ) {
        throw redirect('/')
    }

    const hero = data.heroes.find((candidate) => candidate.id === selectedHeroId)

    if (!hero) {
        throw redirect('/')
    }

    if (!run) {
        return {
            hero,
            run: null,
            activeBattle: null
        }
    }

    const activeBattleResponse = await fetch(`${apiBaseUrl}/runs/${run.id}/battles/active`,
        {
            credentials: 'include'
        }
    )

    if (activeBattleResponse.status === 401) {
        throw redirect('/login')
    }

    if (!activeBattleResponse.ok) {
        throw new Error('Unable to determine the active battle.')
    }

    const activeBattleData: { battle: Battle | null } = await activeBattleResponse.json()

    return {
        hero,
        run,
        activeBattle: activeBattleData.battle
    }
}