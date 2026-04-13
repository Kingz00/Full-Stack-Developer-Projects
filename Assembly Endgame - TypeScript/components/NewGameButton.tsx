import type { JSX } from 'react'

type NewGameButtonPropTypes = {
    isGameOver: boolean
    isGameWon: boolean
    startNewGame: () => void
}
const NewGameButton = ({ isGameOver, isGameWon, startNewGame }: NewGameButtonPropTypes): JSX.Element | null => {
    if (isGameOver || isGameWon) {
        return (
            <button className="new-game" onClick={startNewGame}>NEW GAME</button>
        )
    } else {
        return null
    }
}

export default NewGameButton