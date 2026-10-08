import { Link } from 'react-router-dom'

import './BattleHeader.css'

interface BattleHeaderProps {
    battleNumber: number
    status: string
}

function BattleHeader({ battleNumber, status }: BattleHeaderProps) {
    return (
        <header className="battle-header">
            <Link
                className="battle-header__back"
                to="/game"
            >
                <span aria-hidden="true">←</span>
                Return to Run
            </Link>

            <div className="battle-header__title">
                <p>Dungeon Dice Duel</p>
                <h1>Battle {battleNumber}</h1>
                <span className="battle-header__status">
                    {status === 'active'
                        ? 'Battle in Progress'
                        : `Battle ${status}`}
                </span>
            </div>
        </header>
    )
}

export default BattleHeader