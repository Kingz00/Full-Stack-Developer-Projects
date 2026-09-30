import { redirect, type ActionFunctionArgs } from 'react-router-dom'
// import type { GameRun } from '../types'


export async function startRunAction({ request }: ActionFunctionArgs) {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

    if (!apiBaseUrl) {
        throw new Error('VITE_API_BASE_URL is not configured.')
    }

    const url = new URL(request.url)
    const heroIdParam = url.searchParams.get('heroId')

    if (!heroIdParam) {
        return {
            error: 'A hero must be selected before starting a run.'
        }
    }

    const selectedHeroId = Number(heroIdParam)

    if (
        !Number.isInteger(selectedHeroId) ||
        selectedHeroId <= 0
    ) {
        return {
            error: 'The selected hero is invalid.'
        }
    }

    const response = await fetch(`${apiBaseUrl}/runs`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            selectedHeroId
        })
    })

    if (!response.ok) {
        let message = 'Unable to start your run. Please try again.'

        try {
            const data = await response.json()

            if (
                data &&
                typeof data.error === 'string'
            ) {
                message = data.error
            }
        } catch {
            // Keep the fallback message.
        }

        if (response.status === 400 || response.status === 404 || response.status === 409) {
            return {
                error: message
            }
        }

        throw new Response(message, {
            status: response.status
        })
    }

    // const data: { run: GameRun } = await response.json()

    return redirect(`/game`)
}