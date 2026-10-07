import { Form, useNavigate, useLoaderData, useActionData, useNavigation } from 'react-router-dom'
import { useState } from 'react'
import ConfirmationModal from '../../../components/ConfirmationModal'

import type { GameLoaderData } from '../loaders/gameLoader'
import type { GameRun } from '../types'

import healthIcon from '../../../assets/icons/health.svg'
import attackIcon from '../../../assets/icons/attack.svg'
import defenseIcon from '../../../assets/icons/defense.svg'

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

    const hasActiveRun = run !== null

    const runId = run?.id

    const isStartingRun =
        navigation.state === 'submitting' &&
        navigation.formMethod === 'POST'

    const [isProcessingBattle, setIsProcessingBattle] = useState(false)

    const [isProcessingRun, setIsProcessingRun] = useState(false)

    const [gameError, setGameError] = useState<string | null>(null)

    const [showAbandonConfirmation, setShowAbandonConfirmation] = useState(false)

    async function handleBattleEntry() {
        if (!runId) {
            return
        }

        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

        if (!apiBaseUrl) {
            setGameError('VITE_API_BASE_URL is not configured.')
            return
        }

        setGameError(null)
        setIsProcessingBattle(true)

        try {
            if (activeBattle) {
                navigate(
                    `/game/battle?battleId=${activeBattle.id}`
                )

                return
            }

            const response = await fetch(`${apiBaseUrl}/runs/${runId}/battles`,
                {
                    method: 'POST',
                    credentials: 'include',
                }
            )

            if (!response.ok) {
                let message =
                    'Unable to start the battle.'

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

                setGameError(message)
                return
            }

            const data = await response.json()

            navigate(
                `/game/battle?battleId=${data.battle.id}`
            )
        } catch {
            setGameError(
                'Unable to connect to the server. Please try again.'
            )
        } finally {
            setIsProcessingBattle(false)
        }
    }

    async function handleRunLifecycle(action: 'complete' | 'abandon') {
        if (!runId) {
            return
        }

        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

        if (!apiBaseUrl) {
            setGameError(
                'VITE_API_BASE_URL is not configured.'
            )
            return
        }

        setGameError(null)
        setIsProcessingRun(true)

        try {
            const response = await fetch(`${apiBaseUrl}/runs/${runId}/${action}`,
                {
                    method: 'POST',
                    credentials: 'include',
                }
            )

            if (!response.ok) {
                let message =
                    action === 'complete'
                        ? 'Unable to complete the run.'
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

                setGameError(message)
                return
            }

            if (action === 'complete') {
                navigate('/statistics')
                return
            }

            navigate('/')
        } catch {
            setGameError(
                'Unable to connect to the server. Please try again.'
            )
        } finally {
            setIsProcessingRun(false)
        }
    }

    function requestAbandonRun() {
        setShowAbandonConfirmation(true)
    }

    function cancelAbandonRun() {
        setShowAbandonConfirmation(false)
    }

    function confirmAbandonRun() {
        setShowAbandonConfirmation(false)
        void handleRunLifecycle('abandon')
    }

    const primaryBattleLabel = activeBattle ? 'Resume Battle' : 'Start New Battle'

    return (
        <main className={`game-page ${!run ? 'game-page--no-active-run' : ''}`}>
            <section
                className="game-page__layout"
                aria-label="Current dungeon run"
            >
                <article className="game-page__hero-card">
                    <div className="game-page__hero-image-wrapper">
                        <img
                            className="game-page__hero-image"
                            src={hero.imageUrl}
                            alt={hero.name}
                        />
                    </div>

                    <div className="game-page__hero-content">
                        <p className="game-page__hero-eyebrow">
                            Your Champion
                        </p>

                        <h1 className="game-page__hero-name">
                            {hero.name}
                        </h1>

                        <p className="game-page__hero-description">
                            {hero.description}
                        </p>

                        <dl className="game-page__stats">
                            <div className="game-page__stat">
                                <dt>
                                    <img
                                        src={healthIcon}
                                        alt=""
                                    />
                                    Health
                                </dt>

                                <dd>{hero.health}</dd>
                            </div>

                            <div className="game-page__stat">
                                <dt>
                                    <img
                                        src={attackIcon}
                                        alt=""
                                    />
                                    Attack
                                </dt>

                                <dd>{hero.attack}</dd>
                            </div>

                            <div className="game-page__stat">
                                <dt>
                                    <img
                                        src={defenseIcon}
                                        alt=""
                                    />
                                    Defense
                                </dt>

                                <dd>{hero.defense}</dd>
                            </div>
                        </dl>
                    </div>
                </article>

                <div className="game-page__main">
                    {hasActiveRun ? (
                        <>
                            <section
                                className="game-page__run-card"
                                aria-labelledby="run-heading"
                            >
                                <div className="game-page__run-heading">
                                    <span className="game-page__run-line" />

                                    <h2 id="run-heading">
                                        Run #{run.runNumber}
                                    </h2>

                                    <span className="game-page__run-line" />
                                </div>

                                <p className="game-page__run-status">
                                    In Progress
                                </p>

                                <dl className="game-page__run-summary">
                                    <div>
                                        <dt>Current Battle</dt>
                                        <dd>
                                            {activeBattle
                                                ? `Battle #${activeBattle.battleNumber}`
                                                : 'None'}
                                        </dd>
                                    </div>

                                    <div>
                                        <dt>Run State</dt>
                                        <dd>Active</dd>
                                    </div>
                                </dl>
                            </section>

                            <section
                                className="game-page__continue-card"
                                aria-labelledby="continue-heading"
                            >
                                <div className="game-page__continue-content">
                                    <p className="game-page__section-eyebrow">
                                        {activeBattle
                                            ? 'Continue Your Adventure'
                                            : 'Enter the Dungeon'}
                                    </p>

                                    <h2 id="continue-heading">
                                        {activeBattle
                                            ? 'Your battle awaits.'
                                            : 'Your first battle awaits.'}
                                    </h2>

                                    <p>
                                        {activeBattle
                                            ? `Continue Battle #${activeBattle.battleNumber} against ${activeBattle.enemyName}.`
                                            : 'Begin the next battle in your current run.'}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="game-page__primary-action"
                                    onClick={handleBattleEntry}
                                    disabled={
                                        isProcessingBattle ||
                                        isProcessingRun
                                    }
                                >
                                    <span aria-hidden="true">
                                        ⚔
                                    </span>

                                    {isProcessingBattle
                                        ? 'Entering Battle...'
                                        : primaryBattleLabel}

                                    <span
                                        aria-hidden="true"
                                        className="game-page__action-arrow"
                                    >
                                        ›
                                    </span>
                                </button>
                            </section>

                            <div
                                className="game-page__run-actions"
                                aria-label="Run actions"
                            >
                                <button
                                    type="button"
                                    className="game-page__secondary-action"
                                    onClick={() =>
                                        handleRunLifecycle('complete')
                                    }
                                    disabled={
                                        isProcessingBattle ||
                                        isProcessingRun
                                    }
                                >
                                    <span aria-hidden="true">
                                        ⚑
                                    </span>

                                    {isProcessingRun
                                        ? 'Processing...'
                                        : 'Complete Run'}

                                    <span aria-hidden="true">
                                        ›
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    className="game-page__danger-action"
                                    onClick={requestAbandonRun}
                                    disabled={
                                        isProcessingBattle ||
                                        isProcessingRun
                                    }
                                >
                                    <span aria-hidden="true">
                                        ☠
                                    </span>

                                    Abandon Run

                                    <span aria-hidden="true">
                                        ›
                                    </span>
                                </button>
                            </div>

                            {gameError && (
                                <p
                                    className="game-page__error"
                                    role="alert"
                                >
                                    {gameError}
                                </p>
                            )}
                        </>
                    ) : (
                        <>
                            <section
                                className="game-page__prepare-card"
                                aria-labelledby="prepare-heading"
                            >
                                <p className="game-page__section-eyebrow">
                                    Prepare for the Dungeon
                                </p>

                                <h2 id="prepare-heading">
                                    Your champion is ready.
                                </h2>

                                <p>
                                    Begin a new run with{' '}
                                    <strong>{hero.name}</strong>{' '}
                                    and enter the dungeon.
                                </p>

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
                                    className="game-page__start-form"
                                >
                                    <button
                                        className="game-page__primary-action"
                                        type="submit"
                                        disabled={isStartingRun}
                                    >
                                        <span aria-hidden="true">
                                            ⚔
                                        </span>

                                        {isStartingRun
                                            ? 'Starting Run...'
                                            : 'Start Run'}

                                        <span
                                            aria-hidden="true"
                                            className="game-page__action-arrow"
                                        >
                                            ›
                                        </span>
                                    </button>
                                </Form>
                            </section>
                        </>
                    )}
                </div>
            </section>
            <ConfirmationModal
                isOpen={showAbandonConfirmation}
                eyebrow="Abandon Run"
                title="Leave this run behind?"
                message="Abandoning this run will forfeit your current progress. This action cannot be undone."
                confirmLabel="Abandon Run"
                onCancel={cancelAbandonRun}
                onConfirm={confirmAbandonRun}
            />
        </main>
    )
}

export default GamePage