import { useEffect, useState } from 'react'
import { useLoaderData, useNavigate } from 'react-router-dom'

import ConfirmationModal from '../../../components/ConfirmationModal'
import BattleActions from '../components/BattleActions'
import BattleArena from '../components/BattleArena'
import BattleCombatLog from '../components/BattleCombatLog'
import BattleDicePanel from '../components/BattleDicePanel'
import BattleHeader from '../components/BattleHeader'
import BattleRoundHistory from '../components/BattleRoundHistory'
import BattleDiceRollOverlay from '../components/BattleDiceRollOverlay'
import type { BattleRoundEntry } from '../components/battlePresentationTypes'
import type { BattleLoaderData } from '../loaders/battleLoader'
import type { BattleState, RoundResult } from '../types'

import './BattlePage.css'


export type CombatAnimationPhase = 'idle' | 'rolling' | 'revealing' | 'impact'

const delay = (milliseconds: number) => new Promise<void>(resolve => {
    window.setTimeout(resolve, milliseconds)
})

function BattlePage() {
    const { battle, hero } = useLoaderData() as BattleLoaderData
    const navigate = useNavigate()

    const [battleState, setBattleState] = useState<BattleState>({
        player: {
            health: battle.playerHealth,
            maxHealth: battle.playerMaxHealth,
            attack: hero.attack,
            defense: hero.defense,
        },
        enemy: {
            health: battle.enemyHealth,
            maxHealth: battle.enemyMaxHealth,
            attack: battle.enemyAttack,
            defense: battle.enemyDefense,
        },
        status: battle.status,
    })

    const [lastRound, setLastRound] = useState<RoundResult | null>(null)
    const [rounds, setRounds] = useState<BattleRoundEntry[]>([])
    const [isPlayingRound, setIsPlayingRound] = useState(false)
    const [animationPhase, setAnimationPhase] = useState<CombatAnimationPhase>('idle')
    const [roundError, setRoundError] = useState<string | null>(null)
    const [isProcessingLifecycle, setIsProcessingLifecycle] = useState(false)
    const [lifecycleError, setLifecycleError] = useState<string | null>(null)
    const [isAbandonModalOpen, setIsAbandonModalOpen] = useState(false)

    const isBattleResolved =
        battleState.status === 'won' ||
        battleState.status === 'lost' ||
        battleState.status === 'draw'

    useEffect(() => {
        setBattleState({
            player: {
                health: battle.playerHealth,
                maxHealth: battle.playerMaxHealth,
                attack: hero.attack,
                defense: hero.defense,
            },
            enemy: {
                health: battle.enemyHealth,
                maxHealth: battle.enemyMaxHealth,
                attack: battle.enemyAttack,
                defense: battle.enemyDefense,
            },
            status: battle.status,
        })

        setLastRound(null)
        setRounds([])
        setRoundError(null)
        setLifecycleError(null)
        setIsPlayingRound(false)
        setAnimationPhase('idle')
        setIsProcessingLifecycle(false)
        setIsAbandonModalOpen(false)
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
        hero.defense,
    ])

    async function handlePlayRound() {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

        if (!apiBaseUrl) {
            setRoundError('VITE_API_BASE_URL is not configured.')
            return
        }

        if (
            battleState.status !== 'active' ||
            isPlayingRound
        ) {
            return
        }

        setIsPlayingRound(true)
        setAnimationPhase('rolling')
        setRoundError(null)

        // Start the animation clock independently of the API request.
        const rollMinimum = delay(1800)

        try {
            const response = await fetch(`${apiBaseUrl}/battles/${battle.id}/rounds`,
                {
                    method: 'POST',
                    credentials: 'include',
                },
            )

            if (!response.ok) {
                let message = 'Unable to play the round.'

                try {
                    const data = await response.json()

                    if (typeof data.error === 'string') {
                        message = data.error
                    }
                } catch {
                    // Keep the default message.
                }

                // Even a fast error should not abruptly cut off the roll.
                await rollMinimum
                setRoundError(message)
                return
            }

            const data: {
                state: BattleState
                round: RoundResult
            } = await response.json()

            // Fast responses wait for the roll animation.
            // Slow responses naturally take longer than this minimum.
            await rollMinimum

            // Reveal the final dice values before showing damage.
            setLastRound(data.round)
            setAnimationPhase('revealing')
            await delay(1450)

            // Apply the authoritative server state when the hit lands.
            setAnimationPhase('impact')
            setBattleState(data.state)

            setRounds(previousRounds => [
                ...previousRounds,
                {
                    roundNumber: previousRounds.length + 1,
                    result: data.round,
                },
            ])

            // Allow the hit reaction and health-bar transition to finish.
            await delay(1150)

            setAnimationPhase('idle')
        } catch {
            // If the request fails, never fabricate a result or damage.
            await rollMinimum

            setRoundError(
                'Unable to connect to the server. Please try again.',
            )
        } finally {
            setAnimationPhase('idle')
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
            const response = await fetch(
                `${apiBaseUrl}/runs/${battle.runId}/battles`,
                {
                    method: 'POST',
                    credentials: 'include',
                },
            )

            if (!response.ok) {
                let message = 'Unable to start a new battle.'

                try {
                    const data = await response.json()

                    if (typeof data.error === 'string') {
                        message = data.error
                    }
                } catch {
                    // Keep the default message.
                }

                setLifecycleError(message)
                return
            }

            const data: { battle: { id: number } } =
                await response.json()

            navigate(`/game/battle?battleId=${data.battle.id}`)
        } catch {
            setLifecycleError(
                'Unable to connect to the server. Please try again.',
            )
        } finally {
            setIsProcessingLifecycle(false)
        }
    }

    async function handleRunLifecycle(action: 'complete' | 'abandon') {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

        if (!apiBaseUrl) {
            setLifecycleError('VITE_API_BASE_URL is not configured.')
            return
        }

        setIsProcessingLifecycle(true)
        setLifecycleError(null)

        try {
            const response = await fetch(
                `${apiBaseUrl}/runs/${battle.runId}/${action}`,
                {
                    method: 'POST',
                    credentials: 'include',
                },
            )

            if (!response.ok) {
                let message =
                    action === 'complete'
                        ? 'Unable to complete the run.'
                        : 'Unable to abandon the run.'

                try {
                    const data = await response.json()

                    if (typeof data.error === 'string') {
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
                'Unable to connect to the server. Please try again.',
            )
        } finally {
            setIsProcessingLifecycle(false)
        }
    }

    function handleConfirmAbandon() {
        setIsAbandonModalOpen(false)
        void handleRunLifecycle('abandon')
    }

    const nextRoundNumber = rounds.length + 1

    return (
        <main className="battle-page">
            <div
                className="battle-page__background"
                aria-hidden="true"
            />

            <div className="battle-page__content">
                <BattleHeader
                    battleNumber={battle.battleNumber}
                    status={battleState.status}
                />

                <BattleArena
                    hero={hero}
                    battle={battle}
                    battleState={battleState}
                    playerDamaged={
                        animationPhase === 'impact' &&
                        lastRound !== null &&
                        lastRound.enemyDamage > 0
                    }
                    enemyDamaged={
                        animationPhase === 'impact' &&
                        lastRound !== null &&
                        lastRound.playerDamage > 0
                    }
                />

                {!isBattleResolved && (
                    <div className="battle-page__lower-grid">
                        <BattleRoundHistory rounds={rounds} />

                        <BattleDicePanel
                            roundNumber={nextRoundNumber}
                            lastRound={lastRound}
                            isRolling={isPlayingRound}
                            animationPhase={animationPhase}
                            isBattleActive={battleState.status === 'active'}
                            error={roundError}
                            onRoll={() => void handlePlayRound()}
                        />

                        <BattleCombatLog rounds={rounds} />
                    </div>
                )}

                {isBattleResolved ? (
                    <section className="battle-page__completion">
                        <section
                            className={`battle-page__resolution battle-page__resolution--${battleState.status}`}
                            aria-live="polite"
                        >
                            <span className="battle-page__completion-eyebrow">
                                Battle concluded
                            </span>

                            <h2>
                                {battleState.status === 'won'
                                    ? 'Victory!'
                                    : battleState.status === 'lost'
                                        ? 'Defeat'
                                        : 'Draw'}
                            </h2>

                            <p>
                                {battleState.status === 'won'
                                    ? 'You defeated your opponent. Continue your run or complete it.'
                                    : battleState.status === 'lost'
                                        ? 'Your hero has fallen. You can start another battle or end this run.'
                                        : 'The battle ended in a draw. Decide how you want to continue.'}
                            </p>
                        </section>

                        <BattleActions
                            isBattleResolved={isBattleResolved}
                            isProcessing={isProcessingLifecycle}
                            error={lifecycleError}
                            onStartNewBattle={() => void handleStartNewBattle()}
                            onCompleteRun={() => void handleRunLifecycle('complete')}
                            onAbandonRun={() => setIsAbandonModalOpen(true)}
                        />
                    </section>
                ) : (
                    <BattleActions
                        isBattleResolved={isBattleResolved}
                        isProcessing={isProcessingLifecycle}
                        error={lifecycleError}
                        onStartNewBattle={() => void handleStartNewBattle()}
                        onCompleteRun={() => void handleRunLifecycle('complete')}
                        onAbandonRun={() => setIsAbandonModalOpen(true)}
                    />
                )}
            </div>

            <BattleDiceRollOverlay
                phase={animationPhase}
                playerValue={lastRound?.playerRoll ?? null}
                enemyValue={lastRound?.enemyRoll ?? null}
            />

            <ConfirmationModal
                isOpen={isAbandonModalOpen}
                eyebrow="Abandon Run"
                title="Leave this run behind?"
                message="Abandoning this run will forfeit your current run and discard its progress. This action cannot be undone."
                confirmLabel="Abandon Run"
                cancelLabel="Keep Playing"
                onConfirm={handleConfirmAbandon}
                onCancel={() => setIsAbandonModalOpen(false)}
            />
        </main>
    )
}

export default BattlePage