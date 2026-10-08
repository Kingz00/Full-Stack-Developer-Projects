import { useState } from 'react'

import './BattleFighterCard.css'

interface BattleFighterCardProps {
    name: string
    imageUrl: string
    role: 'hero' | 'enemy'
    health: number
    maxHealth: number
    attack: number
    defense: number
    isDamaged?: boolean
}

function BattleFighterCard({
    name,
    imageUrl,
    role,
    health,
    maxHealth,
    attack,
    defense,
    isDamaged = false,
}: BattleFighterCardProps) {
    const [imageFailed, setImageFailed] = useState(false)

    const healthPercentage = maxHealth > 0
        ? Math.min(100, Math.max(0, (health / maxHealth) * 100))
        : 0

    return (
        <article
            className={`battle-fighter battle-fighter--${role}${isDamaged ? ' battle-fighter--damaged' : ''}`}
            aria-label={`${name}, ${role === 'hero' ? 'your hero' : 'opponent'}`}
        >
            <div className="battle-fighter__portrait">
                {!imageFailed && imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={name}
                        onError={() => setImageFailed(true)}
                    />
                ) : (
                    <div
                        className="battle-fighter__image-fallback"
                        role="img"
                        aria-label={`${name} portrait unavailable`}
                    >
                        {name.slice(0, 1).toUpperCase()}
                    </div>
                )}
            </div>

            <div className="battle-fighter__content">
                <p className="battle-fighter__role">
                    {role === 'hero' ? 'Your Hero' : 'Opponent'}
                </p>

                <h2 className="battle-fighter__name">{name}</h2>

                <div className="battle-fighter__health">
                    <div
                        className="battle-fighter__health-track"
                        role="progressbar"
                        aria-label={`${name} health`}
                        aria-valuemin={0}
                        aria-valuemax={maxHealth}
                        aria-valuenow={health}
                    >
                        <span
                            className="battle-fighter__health-fill"
                            style={{ width: `${healthPercentage}%` }}
                        />
                    </div>

                    <strong>
                        {health} <span>/ {maxHealth}</span>
                    </strong>
                </div>

                <dl className="battle-fighter__stats">
                    <div>
                        <dt>Attack</dt>
                        <dd>{attack}</dd>
                    </div>

                    <div>
                        <dt>Defense</dt>
                        <dd>{defense}</dd>
                    </div>
                </dl>
            </div>
        </article>
    )
}

export default BattleFighterCard