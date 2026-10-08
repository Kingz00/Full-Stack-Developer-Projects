import type { RoundResult } from '../types'
import type { CombatAnimationPhase } from '../pages/BattlePage'

import './BattleDicePanel.css'

interface BattleDicePanelProps {
    roundNumber: number
    lastRound: RoundResult | null
    isRolling: boolean
    animationPhase: CombatAnimationPhase
    isBattleActive: boolean
    error: string | null
    onRoll: () => void
}

function getOutcomeLabel(status: RoundResult['status']) {
    switch (status) {
        case 'won':
            return 'You won the round!'
        case 'lost':
            return 'Enemy won the round!'
        case 'draw':
            return 'The round ended in a draw.'
        case 'active':
            return 'The battle continues.'
    }
}

function BattleDicePanel({
    roundNumber,
    lastRound,
    isRolling,
    animationPhase,
    isBattleActive,
    error,
    onRoll,
}: BattleDicePanelProps) {
    return (
        <section
            className="battle-dice-panel battle-panel"
            aria-labelledby="battle-dice-panel-title"
        >
            <h2
                id="battle-dice-panel-title"
                className="battle-dice-panel__title"
            >
                {isRolling
                    ? 'Rolling the Dice'
                    : `Roll for Round ${roundNumber}`}
            </h2>

            <div
                className={`battle-dice-panel__dice ${animationPhase === 'rolling'
                    ? 'battle-dice-panel__dice--rolling' : ''} ${animationPhase === 'revealing'
                        ? 'battle-dice-panel__dice--revealing' : ''}`}
                aria-live="polite"
                aria-atomic="true"
            >
                <div className="battle-die">
                    <span className="battle-die__label">You</span>
                    <span className="battle-die__value">
                        {isRolling ? '?' : lastRound?.playerRoll ?? '—'}
                    </span>
                </div>

                <span className="battle-dice-panel__separator" aria-hidden="true">
                    vs
                </span>

                <div className="battle-die battle-die--enemy">
                    <span className="battle-die__label">Enemy</span>
                    <span className="battle-die__value">
                        {isRolling ? '?' : lastRound?.enemyRoll ?? '—'}
                    </span>
                </div>
            </div>

            {lastRound && animationPhase === 'idle' && (
                <div className="battle-dice-panel__result" aria-live="polite">
                    <p className={`battle-dice-panel__outcome battle-dice-panel__outcome--${lastRound.status}`}>
                        {getOutcomeLabel(lastRound.status)}
                    </p>

                    <p>
                        You dealt <strong>{lastRound.playerDamage}</strong> damage.
                        {' '}The enemy dealt <strong>{lastRound.enemyDamage}</strong> damage.
                    </p>
                </div>
            )}

            {error && (
                <p className="battle-dice-panel__error" role="alert">
                    {error}
                </p>
            )}

            <button
                className="battle-dice-panel__roll-button"
                type="button"
                onClick={onRoll}
                disabled={!isBattleActive || isRolling}
            >
                {isRolling ? 'Rolling…' : 'Roll Dice'}
            </button>

            {!isBattleActive && (
                <p className="battle-dice-panel__finished">
                    This battle has ended.
                </p>
            )}
        </section>
    )
}

export default BattleDicePanel