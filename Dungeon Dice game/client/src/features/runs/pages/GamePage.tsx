import { Form, useNavigate, useLoaderData, useRouteLoaderData, useActionData, useNavigation } from 'react-router-dom'
import { useState } from 'react'

import type { AuthUser } from '../../auth/loaders/authLoader'
import type { GameLoaderData } from '../loaders/gameLoader'
import type { GameRun } from '../types'
// import type { Battle } from '../../battles/types'

import './GamePage.css'

interface StartRunActionData {
    run?: GameRun
    error?: string
}

function GamePage() {
    const { hero, run, activeBattle } = useLoaderData() as GameLoaderData

    const actionData = useActionData() as StartRunActionData | undefined

    const navigation = useNavigation()

    const navigate = useNavigate()

    const user = useRouteLoaderData('root') as AuthUser

    const hasActiveRun = run !== null

    const runId = run?.id

    const isStartingRun = navigation.state === 'submitting' && navigation.formMethod === 'POST'

    const [isStartingBattle, setIsStartingBattle] = useState(false)

    const [battleError, setBattleError] = useState<string | null>(null)

    async function handleBattleEntry() {
        if (!runId) {
            return
        }

        setBattleError(null)

        if (activeBattle) {
            navigate(`/game/battle?battleId=${activeBattle.id}`)

            return
        }

        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

        if (!apiBaseUrl) {
            setBattleError('VITE_API_BASE_URL is not configured.')
            return
        }

        setIsStartingBattle(true)

        try {
            const response = await fetch(`${apiBaseUrl}/runs/${runId}/battles`,
                {
                    method: 'POST',
                    credentials: 'include'
                }
            )

            if (!response.ok) {
                let message = 'Unable to start the battle.'

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

                setBattleError(message)
                return
            }

            const data = await response.json()

            navigate(`/game/battle?battleId=${data.battle.id}`)
        } catch {
            setBattleError(
                'Unable to connect to the server. Please try again.'
            )
        } finally {
            setIsStartingBattle(false)
        }
    }

    return (
        <main className="game-page">
            <header className="game-page__header">
                <p className="game-page__eyebrow">
                    Welcome, {user.username}
                </p>

                <h1 className="game-page__title">
                    Prepare for the Dungeon
                </h1>

                <p className="game-page__subtitle">
                    Your chosen hero is ready for battle.
                </p>
            </header>

            <section
                className="game-page__hero"
                aria-labelledby="selected-hero"
            >
                <div className="game-page__image-wrapper">
                    <img
                        className="game-page__image"
                        src={hero.imageUrl}
                        alt={hero.name}
                    />
                </div>

                <div className="game-page__content">
                    <p className="game-page__label">
                        Selected Hero
                    </p>

                    <h2
                        className="game-page__hero-name"
                        id="selected-hero"
                    >
                        {hero.name}
                    </h2>

                    <p className="game-page__description">
                        {hero.description}
                    </p>

                    <dl className="game-page__stats">
                        <div className="game-page__stat">
                            <dt>Health</dt>
                            <dd>{hero.health}</dd>
                        </div>

                        <div className="game-page__stat">
                            <dt>Attack</dt>
                            <dd>{hero.attack}</dd>
                        </div>

                        <div className="game-page__stat">
                            <dt>Defense</dt>
                            <dd>{hero.defense}</dd>
                        </div>
                    </dl>

                    {hasActiveRun ? (
                        <div className="game-page__run">
                            <p className="game-page__status">
                                Your run has begun.
                            </p>

                            <p className="game-page__run-details">
                                Run #{runId}
                            </p>

                            {activeBattle ? (
                                <>
                                    <p>
                                        You have an active battle waiting for you.
                                    </p>

                                    <p>
                                        Battle #{activeBattle.id} against{' '}
                                        {activeBattle.enemyName}
                                    </p>
                                </>
                            ) : (
                                <p>
                                    Your run is ready. Enter the dungeon to begin
                                    your first battle.
                                </p>
                            )}

                            {battleError && (
                                <p className="game-page__error" role="alert">
                                    {battleError}
                                </p>
                            )}

                            <button
                                type="button"
                                className="game-page__start-button"
                                onClick={handleBattleEntry}
                                disabled={isStartingBattle}
                            >
                                {isStartingBattle ? 'Starting Battle...' : activeBattle
                                    ? 'Resume Battle' : 'Start Battle'}
                            </button>
                        </div>
                    ) : (
                        <>
                            {actionData?.error && (
                                <p
                                    className="game-page__error"
                                    role="alert"
                                >
                                    {actionData.error}
                                </p>
                            )}

                            <Form
                                method="post"
                                className="game-page__form"
                            >
                                <button
                                    className="game-page__start-button"
                                    type="submit"
                                    disabled={isStartingRun}
                                >
                                    {isStartingRun ? 'Starting Run...' : 'Start Run'}
                                </button>
                            </Form>
                        </>
                    )}
                </div>
            </section>
        </main>
    )
}

export default GamePage