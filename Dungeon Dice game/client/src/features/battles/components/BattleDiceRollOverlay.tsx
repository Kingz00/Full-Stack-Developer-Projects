import './BattleDiceRollOverlay.css'

type BattleDiceRollOverlayProps = {
    phase: 'idle' | 'rolling' | 'revealing' | 'impact'
    playerValue: number | null
    enemyValue: number | null
}

type BattleDieProps = {
    label: string
    value: number | null
    variant: 'player' | 'enemy'
    phase: 'rolling' | 'revealing' | 'impact'
}

type DieFaceProps = {
    value: number
    face: string
}

const pipPositions: Record<number, string[]> = {
    1: ['center'],
    2: ['top-left', 'bottom-right'],
    3: ['top-left', 'center', 'bottom-right'],
    4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    5: [
        'top-left',
        'top-right',
        'center',
        'bottom-left',
        'bottom-right',
    ],
    6: [
        'top-left',
        'top-right',
        'middle-left',
        'middle-right',
        'bottom-left',
        'bottom-right',
    ],
}

function DieFace({ value, face }: DieFaceProps) {
    const activePositions = pipPositions[value]

    return (
        <span
            className={`battle-roll__face battle-roll__face--${face}`}
            aria-hidden="true"
        >
            {Array.from({ length: 9 }, (_, index) => {
                const positions = [
                    'top-left',
                    'top-center',
                    'top-right',
                    'middle-left',
                    'center',
                    'middle-right',
                    'bottom-left',
                    'bottom-center',
                    'bottom-right',
                ]

                const position = positions[index]

                return (
                    <span
                        key={position}
                        className={[
                            'battle-roll__pip',
                            `battle-roll__pip--${position}`,
                            activePositions.includes(position)
                                ? 'battle-roll__pip--visible'
                                : '',
                        ].filter(Boolean).join(' ')}
                    />
                )
            })}
        </span>
    )
}

function BattleDie({
    label,
    value,
    variant,
    phase,
}: BattleDieProps) {
    const displayedValue = value ?? 6

    return (
        <div className={`battle-roll__die-group battle-roll__die-group--${variant}`}>
            <span className="battle-roll__label">{label}</span>

            <div
                className={`battle-roll__die battle-roll__die--${variant} battle-roll__die--${phase}`}
                aria-label={
                    value === null
                        ? `${label} die rolling`
                        : `${label} rolled ${value}`
                }
            >
                {/* <span className="battle-roll__face battle-roll__face--front">
                    {displayedValue}
                </span>
                <span className="battle-roll__face battle-roll__face--back">6</span>
                <span className="battle-roll__face battle-roll__face--right">3</span>
                <span className="battle-roll__face battle-roll__face--left">4</span>
                <span className="battle-roll__face battle-roll__face--top">2</span>
                <span className="battle-roll__face battle-roll__face--bottom">5</span> */}
                <DieFace value={displayedValue} face="front" />
                <DieFace value={6} face="back" />
                <DieFace value={3} face="right" />
                <DieFace value={4} face="left" />
                <DieFace value={2} face="top" />
                <DieFace value={5} face="bottom" />
            </div>

            {phase !== 'rolling' && value !== null && (
                <span className="battle-roll__result">{value}</span>
            )}
        </div>
    )
}

export default function BattleDiceRollOverlay({
    phase,
    playerValue,
    enemyValue,
}: BattleDiceRollOverlayProps) {
    if (phase === 'idle') {
        return null
    }

    return (
        <div
            className={`battle-roll-overlay battle-roll-overlay--${phase}`}
            role="status"
            aria-live="polite"
            aria-label="Dice roll in progress"
        >
            <div className="battle-roll">
                <p className="battle-roll__eyebrow">Dungeon Dice Duel</p>
                <h2 className="battle-roll__title">
                    {phase === 'rolling' ? 'Rolling for Combat' : 'The Roll Is Cast'}
                </h2>

                <div className="battle-roll__dice-row">
                    <BattleDie
                        label="YOU"
                        value={playerValue}
                        variant="player"
                        phase={phase}
                    />

                    <span className="battle-roll__versus" aria-hidden="true">
                        VS
                    </span>

                    <BattleDie
                        label="ENEMY"
                        value={enemyValue}
                        variant="enemy"
                        phase={phase}
                    />
                </div>

                <p className="battle-roll__hint">
                    {phase === 'rolling'
                        ? 'The fates are deciding your outcome…'
                        : 'Preparing combat results…'}
                </p>
            </div>
        </div>
    )
}