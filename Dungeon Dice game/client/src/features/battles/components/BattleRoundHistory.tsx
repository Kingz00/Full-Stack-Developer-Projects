import type { BattleRoundEntry } from './battlePresentationTypes'

import './BattleRoundHistory.css'

interface BattleRoundHistoryProps {
    rounds: BattleRoundEntry[]
}

function BattleRoundHistory({ rounds }: BattleRoundHistoryProps) {
    return (
        <section
            className="battle-round-history battle-panel"
            aria-labelledby="battle-round-history-title"
        >
            <h2
                id="battle-round-history-title"
                className="battle-support-panel__title"
            >
                Recent Rounds
            </h2>

            {rounds.length === 0 ? (
                <p className="battle-round-history__empty">
                    No rounds completed yet. Roll the dice to begin combat.
                </p>
            ) : (
                <ol className="battle-round-history__list">
                    {[...rounds].reverse().map(({ roundNumber, result }) => (
                        <li
                            className="battle-round-history__item"
                            key={roundNumber}
                        >
                            <div className="battle-round-history__heading">
                                <span>Round {roundNumber}</span>

                                <strong
                                    className={`battle-round-history__status battle-round-history__status--${result.status}`}
                                >
                                    {result.status === 'won'
                                        ? 'You won'
                                        : result.status === 'lost'
                                            ? 'Enemy won'
                                            : result.status === 'draw'
                                                ? 'Draw'
                                                : 'Ongoing'}
                                </strong>
                            </div>

                            <p>
                                You dealt {result.playerDamage} damage.
                            </p>

                            {result.enemyDamage > 0 && (
                                <p>
                                    You received {result.enemyDamage} damage.
                                </p>
                            )}
                        </li>
                    ))}
                </ol>
            )}
        </section>
    )
}

export default BattleRoundHistory