import { redirect } from 'react-router-dom'

import type { StatisticsLoaderData } from '../types'

export async function statisticsLoader(): Promise<StatisticsLoaderData> {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

    if (!apiBaseUrl) {
        throw new Error('VITE_API_BASE_URL is not configured.')
    }

    const response = await fetch(`${apiBaseUrl}/stats`, {
        credentials: 'include'
    })

    if (response.status === 401) {
        throw redirect('/login')
    }

    if (!response.ok) {
        let message = 'Unable to load player statistics.'

        try {
            const data = await response.json()

            if (
                data &&
                typeof data.error === 'string'
            ) {
                message = data.error
            }
        } catch {
            // Keep the default message.
        }

        throw new Error(message)
    }

    const data = await response.json() as StatisticsLoaderData

    return data
}