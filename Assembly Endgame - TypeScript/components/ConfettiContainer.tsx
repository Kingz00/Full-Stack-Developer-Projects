import Confetti from "react-confetti"
import type { JSX } from 'react'

const ConfettiContainer = ({ isGameWon }: { isGameWon: boolean }): JSX.Element | null => {
    if (!isGameWon) {
        return null
    } else {
        return <Confetti recycle={false} numberOfPieces={1000} />
    }
}

export default ConfettiContainer