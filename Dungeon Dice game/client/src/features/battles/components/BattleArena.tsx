import battleVersusEmblem from '../../../assets/decorations/battle-versus-emblem.png'
import type { Hero } from '../../heroes/loaders/heroesLoader'
import type { Battle, BattleState } from '../types'

import BattleFighterCard from './BattleFighterCard'

import './BattleArena.css'

interface BattleArenaProps {
    hero: Hero
    battle: Battle
    battleState: BattleState
    playerDamaged?: boolean
    enemyDamaged?: boolean
}

function BattleArena({
    hero,
    battle,
    battleState,
    playerDamaged = false,
    enemyDamaged = false,
}: BattleArenaProps) {
    return (
        <section
            className="battle-arena"
            aria-label="Battle arena"
        >
            <div className="battle-arena__fighters">
                <BattleFighterCard
                    name={hero.name}
                    imageUrl={hero.imageUrl}
                    role="hero"
                    health={battleState.player.health}
                    maxHealth={battleState.player.maxHealth}
                    attack={battleState.player.attack}
                    defense={battleState.player.defense}
                    isDamaged={playerDamaged}
                />

                <div
                    className="battle-arena__versus"
                    aria-hidden="true"
                >
                    <img
                        src={battleVersusEmblem}
                        alt=""
                    />
                </div>

                <BattleFighterCard
                    name={battle.enemyName}
                    imageUrl={battle.enemyImageUrl}
                    role="enemy"
                    health={battleState.enemy.health}
                    maxHealth={battleState.enemy.maxHealth}
                    attack={battleState.enemy.attack}
                    defense={battleState.enemy.defense}
                    isDamaged={enemyDamaged}
                />
            </div>
        </section>
    )
}

export default BattleArena