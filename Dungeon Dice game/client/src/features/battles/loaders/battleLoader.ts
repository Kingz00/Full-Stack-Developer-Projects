import { redirect, type LoaderFunctionArgs } from 'react-router-dom'

import type { Hero } from '../../heroes/loaders/heroesLoader'
import type { Battle } from '../types'

interface HeroesResponse {
    heroes: Hero[]
}

export interface BattleLoaderData {
    battle: Battle
    hero: Hero
}

export async function battleLoader({ request }: LoaderFunctionArgs): Promise<BattleLoaderData> {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

    if (!apiBaseUrl) {
        throw new Error('VITE_API_BASE_URL is not configured.')
    }

    const url = new URL(request.url)
    const battleIdParam = url.searchParams.get('battleId')

    if (!battleIdParam) {
        throw redirect('/game')
    }

    const battleId = Number(battleIdParam)

    if (!Number.isInteger(battleId) || battleId <= 0) {
        throw redirect('/game')
    }

    const battleResponse = await fetch(`${apiBaseUrl}/battles/${battleId}`,
        {
            credentials: 'include'
        }
    )

    if (battleResponse.status === 401) {
        throw redirect('/login')
    }

    if (battleResponse.status === 404) {
        throw redirect('/game')
    }

    if (!battleResponse.ok) {
        throw new Error('Unable to load the battle.')
    }

    const battleData: { battle: Battle } = await battleResponse.json()

    const heroesResponse = await fetch(`${apiBaseUrl}/heroes`)

    if (!heroesResponse.ok) {
        throw new Error('Unable to load the hero.')
    }

    const heroesData: HeroesResponse = await heroesResponse.json()

    const hero = heroesData.heroes.find(candidate => candidate.id === battleData.battle.heroId)

    if (!hero) {
        throw redirect('/game')
    }

    return {
        battle: battleData.battle,
        hero
    }
}