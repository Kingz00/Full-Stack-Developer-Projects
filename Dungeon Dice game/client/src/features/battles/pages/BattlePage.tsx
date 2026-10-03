import { Link, useLoaderData, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import type { BattleState, RoundResult } from '../types'

import type { BattleLoaderData } from '../loaders/battleLoader'

import './BattlePage.css'

function getHealthPercentage(health: number, maxHealth: number) {
    if (maxHealth <= 0) {
        return 0
    }

    return Math.min(100, Math.max(0, (health / maxHealth) * 100))
}

function getBattleStatusLabel(status: string) {
    switch (status) {
        case 'active':
            return 'Active'
        case 'won':
            return 'Victory'
        case 'lost':
            return 'Defeat'
        case 'draw':
            return 'Draw'
        case 'abandoned':
            return 'Abandoned'
        default:
            return status
    }
}

function BattlePage() {
    // Hooks
    const { battle, hero } = useLoaderData() as BattleLoaderData
    const navigate = useNavigate()

    // States
    const [battleState, setBattleState] = useState<BattleState>({
        player: {
            health: battle.playerHealth,
            maxHealth: battle.playerMaxHealth,
            attack: hero.attack,
            defense: hero.defense
        },
        enemy: {
            health: battle.enemyHealth,
            maxHealth: battle.enemyMaxHealth,
            attack: battle.enemyAttack,
            defense: battle.enemyDefense
        },
        status: battle.status
    })

    const [lastRound, setLastRound] = useState<RoundResult | null>(null)
    const [isPlayingRound, setIsPlayingRound] = useState(false)
    const [roundError, setRoundError] = useState<string | null>(null)
    const [isProcessingLifecycle, setIsProcessingLifecycle] = useState(false)
    const [lifecycleError, setLifecycleError] = useState<string | null>(null)


    const isBattleResolved = battleState.status === 'won' || battleState.status === 'lost' || battleState.status === 'draw'

    const playerHealthPercentage =
        getHealthPercentage(
            battleState.player.health,
            battleState.player.maxHealth
        )

    const enemyHealthPercentage =
        getHealthPercentage(
            battleState.enemy.health,
            battleState.enemy.maxHealth
        )

    useEffect(() => {
        setBattleState({
            player: {
                health: battle.playerHealth,
                maxHealth: battle.playerMaxHealth,
                attack: hero.attack,
                defense: hero.defense
            },
            enemy: {
                health: battle.enemyHealth,
                maxHealth: battle.enemyMaxHealth,
                attack: battle.enemyAttack,
                defense: battle.enemyDefense
            },
            status: battle.status
        })

        setLastRound(null)
        setRoundError(null)
        setLifecycleError(null)
        setIsPlayingRound(false)
        setIsProcessingLifecycle(false)
    }, [
        battle.id,
        battle.playerHealth,
        battle.playerMaxHealth,
        battle.enemyHealth,
        battle.enemyMaxHealth,
        battle.enemyAttack,
        battle.enemyDefense,
        battle.status,
        hero.attack,
        hero.defense
    ])

    async function handlePlayRound() {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

        if (!apiBaseUrl) {
            setRoundError('VITE_API_BASE_URL is not configured.')
            return
        }

        if (battleState.status !== 'active') {
            return
        }

        setIsPlayingRound(true)
        setRoundError(null)

        try {
            const response = await fetch(`${apiBaseUrl}/battles/${battle.id}/rounds`,
                {
                    method: 'POST',
                    credentials: 'include'
                }
            )

            if (!response.ok) {
                let message =
                    'Unable to play the round.'

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

                setRoundError(message)
                return
            }

            const data: {
                state: BattleState
                round: RoundResult
            } = await response.json()

            setBattleState(data.state)
            setLastRound(data.round)
        } catch {
            setRoundError('Unable to connect to the server. Please try again.')
        } finally {
            setIsPlayingRound(false)
        }
    }

    async function handleStartNewBattle() {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

        if (!apiBaseUrl) {
            setLifecycleError('VITE_API_BASE_URL is not configured.')
            return
        }

        setIsProcessingLifecycle(true)
        setLifecycleError(null)

        try {
            const response = await fetch(`${apiBaseUrl}/runs/${battle.runId}/battles`,
                {
                    method: 'POST',
                    credentials: 'include'
                }
            )

            if (!response.ok) {
                let message = 'Unable to start a new battle.'

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

                setLifecycleError(message)
                return
            }

            const data = await response.json()

            navigate(
                `/game/battle?battleId=${data.battle.id}`
            )
        } catch {
            setLifecycleError(
                'Unable to connect to the server. Please try again.'
            )
        } finally {
            setIsProcessingLifecycle(false)
        }
    }

    async function handleRunLifecycle(action: 'complete' | 'abandon') {
        if (action === 'abandon') {
            const confirmed = window.confirm(
                'Abandoning this run will forfeit your current run and discard your progress. This action cannot be undone.'
            )

            if (!confirmed) {
                return
            }
        }

        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

        if (!apiBaseUrl) {
            setLifecycleError('VITE_API_BASE_URL is not configured.')
            return
        }

        setIsProcessingLifecycle(true)
        setLifecycleError(null)

        try {
            const response = await fetch(`${apiBaseUrl}/runs/${battle.runId}/${action}`,
                {
                    method: 'POST',
                    credentials: 'include'
                }
            )

            if (!response.ok) {
                let message = action === 'complete' ? 'Unable to complete the run.'
                    : 'Unable to abandon the run.'

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

                setLifecycleError(message)
                return
            }

            if (action === 'complete') {
                navigate('/statistics')
                return
            }

            navigate('/')
        } catch {
            setLifecycleError(
                'Unable to connect to the server. Please try again.'
            )
        } finally {
            setIsProcessingLifecycle(false)
        }
    }

    return (
        <main className="battle-page">
            <div className="battle-page__topbar">
                <Link
                    className="battle-page__back-link"
                    to="/game"
                >
                    ← Return to Run
                </Link>
            </div>

            <header className="battle-page__header">
                <p className="battle-page__eyebrow">
                    Dungeon Battle
                </p>

                <h1 className="battle-page__title">
                    Face Your Opponent
                </h1>

                <p className="battle-page__subtitle">
                    Prepare for battle and overcome your enemy.
                </p>
            </header>

            <section
                className="battle-page__arena"
                aria-label="Battle arena"
            >
                <article className="battle-page__fighter">
                    <div className="battle-page__image-wrapper">
                        <img
                            className="battle-page__image"
                            src={hero.imageUrl}
                            alt={hero.name}
                        />
                    </div>

                    <div className="battle-page__fighter-content">
                        <p className="battle-page__label">
                            Your Hero
                        </p>

                        <h2 className="battle-page__fighter-name">
                            {hero.name}
                        </h2>

                        <div className="battle-page__health">
                            <div className="battle-page__health-header">
                                <span>Health</span>

                                <strong>
                                    {battleState.player.health} /{' '}
                                    {battleState.player.maxHealth}
                                </strong>
                            </div>

                            <div
                                className="battle-page__health-bar"
                                role="progressbar"
                                aria-label={`${hero.name} health`}
                                aria-valuemin={0}
                                aria-valuemax={battleState.player.maxHealth}
                                aria-valuenow={battleState.player.health}
                            >
                                <span
                                    className="battle-page__health-fill battle-page__health-fill--player"
                                    style={{
                                        width: `${playerHealthPercentage}%`
                                    }}
                                />
                            </div>
                        </div>

                        <dl className="battle-page__stats">
                            <div className="battle-page__stat">
                                <dt>Health</dt>
                                <dd>{battleState.player.health}</dd>
                            </div>

                            <div className="battle-page__stat">
                                <dt>Attack</dt>
                                <dd>{hero.attack}</dd>
                            </div>

                            <div className="battle-page__stat">
                                <dt>Defense</dt>
                                <dd>{hero.defense}</dd>
                            </div>
                        </dl>
                    </div>
                </article>

                <div
                    className="battle-page__versus"
                    aria-hidden="true"
                >
                    <span>VS</span>
                </div>

                <article className="battle-page__fighter">
                    <div className="battle-page__image-wrapper">
                        <img
                            className="battle-page__image"
                            src={battle.enemyImageUrl}
                            alt={battle.enemyName}
                        />
                    </div>

                    <div className="battle-page__fighter-content">
                        <p className="battle-page__label">
                            Opponent
                        </p>

                        <h2 className="battle-page__fighter-name">
                            {battle.enemyName}
                        </h2>

                        <div className="battle-page__health">
                            <div className="battle-page__health-header">
                                <span>Health</span>

                                <strong>
                                    {battleState.enemy.health} /{' '}
                                    {battleState.enemy.maxHealth}
                                </strong>
                            </div>

                            <div
                                className="battle-page__health-bar"
                                role="progressbar"
                                aria-label={`${battle.enemyName} health`}
                                aria-valuemin={0}
                                aria-valuemax={battleState.enemy.maxHealth}
                                aria-valuenow={battleState.enemy.health}
                            >
                                <span
                                    className="battle-page__health-fill battle-page__health-fill--enemy"
                                    style={{
                                        width: `${enemyHealthPercentage}%`
                                    }}
                                />
                            </div>
                        </div>

                        <dl className="battle-page__stats">
                            <div className="battle-page__stat">
                                <dt>Health</dt>
                                <dd>{battleState.enemy.health}</dd>
                            </div>
                            <div className="battle-page__stat">
                                <dt>Attack</dt>
                                <dd>{battle.enemyAttack}</dd>
                            </div>

                            <div className="battle-page__stat">
                                <dt>Defense</dt>
                                <dd>{battle.enemyDefense}</dd>
                            </div>
                        </dl>
                    </div>
                </article>
            </section>

            <section
                className="battle-page__controls"
                aria-label="Battle controls"
            >
                {battleState.status === 'active' && (
                    <>
                        <button
                            type="button"
                            className="battle-page__roll-button"
                            onClick={handlePlayRound}
                            disabled={isPlayingRound}
                        >
                            {isPlayingRound ? 'Rolling...' : 'Roll Dice'}
                        </button>

                        {roundError && (
                            <p
                                className="battle-page__round-error"
                                role="alert"
                            >
                                {roundError}
                            </p>
                        )}
                    </>
                )}

                {isBattleResolved && (
                    <div
                        className="battle-page__resolution"
                        aria-label="Run options"
                    >
                        <h2 className="battle-page__resolution-title">
                            Battle Complete
                        </h2>

                        <p className="battle-page__resolution-text">
                            Choose what you want to do with your current run.
                        </p>

                        <div className="battle-page__resolution-actions">
                            <button
                                type="button"
                                className="battle-page__roll-button"
                                onClick={handleStartNewBattle}
                                disabled={isProcessingLifecycle}
                            >
                                {isProcessingLifecycle ? 'Processing...' : 'Start New Battle'}
                            </button>

                            <button
                                type="button"
                                className="battle-page__secondary-button"
                                onClick={() =>
                                    handleRunLifecycle('complete')
                                }
                                disabled={isProcessingLifecycle}
                            >
                                Complete Run
                            </button>

                            <button
                                type="button"
                                className="battle-page__danger-button"
                                onClick={() =>
                                    handleRunLifecycle('abandon')
                                }
                                disabled={isProcessingLifecycle}
                            >
                                Abandon Run
                            </button>
                        </div>

                        {lifecycleError && (
                            <p
                                className="battle-page__round-error"
                                role="alert"
                            >
                                {lifecycleError}
                            </p>
                        )}
                    </div>
                )}
            </section>

            {lastRound && (
                <section
                    className="battle-page__round-result"
                    aria-live="polite"
                >
                    <p className="battle-page__round-label">
                        Latest Round
                    </p>

                    <div className="battle-page__round-grid">
                        <div>
                            <span>Your Roll</span>
                            <strong>{lastRound.playerRoll}</strong>
                        </div>

                        <div>
                            <span>Enemy Roll</span>
                            <strong>{lastRound.enemyRoll}</strong>
                        </div>

                        <div>
                            <span>You Dealt</span>
                            <strong>{lastRound.playerDamage}</strong>
                        </div>

                        <div>
                            <span>You Took</span>
                            <strong>{lastRound.enemyDamage}</strong>
                        </div>
                    </div>
                </section>
            )}

            <section className="battle-page__footer">
                <div className="battle-page__status">
                    <span className="battle-page__status-label">
                        Battle #{battle.battleNumber}
                    </span>

                    <span
                        className={`battle-page__status-badge battle-page__status-badge--${battle.status}`}
                    >
                        {getBattleStatusLabel(battleState.status)}
                    </span>
                </div>

                <p className="battle-page__instruction">
                    {battleState.status === 'active' ? 'Choose your next action.'
                        : battleState.status === 'won' ? 'Victory! You defeated your opponent.'
                            : battleState.status === 'lost' ? 'Defeat. Your hero has fallen.'
                                : 'The battle ended in a draw.'}
                </p>
            </section>
        </main>
    )
}

export default BattlePage