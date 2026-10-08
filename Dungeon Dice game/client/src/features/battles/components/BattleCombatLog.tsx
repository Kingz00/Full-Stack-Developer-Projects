import type { BattleRoundEntry } from './battlePresentationTypes'

import './BattleCombatLog.css'

interface BattleCombatLogProps {
    rounds: BattleRoundEntry[]
}

function BattleCombatLog({ rounds }: BattleCombatLogProps) {
    return (
        <section
            className="battle-combat-log battle-panel"
            aria-labelledby="battle-combat-log-title"
        >
            <h2
                id="battle-combat-log-title"
                className="battle-support-panel__title"
            >
                Combat Log
            </h2>

            {rounds.length === 0 ? (
                <p className="battle-combat-log__empty">
                    Combat events will appear here after the first roll.
                </p>
            ) : (
                <ol className="battle-combat-log__list">
                    {[...rounds].reverse().map(({ roundNumber, result }) => (
                        <li
                            className="battle-combat-log__entry"
                            key={roundNumber}
                        >
                            <h3>Round {roundNumber}</h3>

                            <p>
                                You rolled <strong>{result.playerRoll}</strong>.
                                {' '}Enemy rolled <strong>{result.enemyRoll}</strong>.
                            </p>

                            <p>
                                You dealt <strong>{result.playerDamage}</strong>
                                {' '}damage.
                            </p>

                            <p>
                                Enemy dealt <strong>{result.enemyDamage}</strong>
                                {' '}damage.
                            </p>

                            <p
                                className={`battle-combat-log__outcome battle-combat-log__outcome--${result.status}`}
                            >
                                {result.status === 'won'
                                    ? 'You won the round!'
                                    : result.status === 'lost'
                                        ? 'Enemy won the round!'
                                        : result.status === 'draw'
                                            ? 'The battle ended in a draw.'
                                            : 'The battle continues.'}
                            </p>
                        </li>
                    ))}
                </ol>
            )}
        </section>
    )
}

export default BattleCombatLog