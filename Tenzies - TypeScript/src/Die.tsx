import type { JSX } from 'react'

type DiePropsType = {
    isHeld: boolean,
    hold: () => void,
    value: number
}

export default function Die({ isHeld, hold, value }: DiePropsType): JSX.Element {
    const styles = {
        backgroundColor: isHeld ? "#59E391" : "white"
    }

    return (
        <button
            style={styles}
            onClick={hold}
            aria-pressed={isHeld}
            aria-label={`Die with value ${value}, 
            ${isHeld ? "held" : "not held"}`}
        >{value}</button>
    )
}