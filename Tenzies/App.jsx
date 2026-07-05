import Die from "./Die.jsx"
import { useState, useRef, useEffect } from "react"
import { nanoid } from "nanoid"
import ReactConfetti from "react-confetti"

const App = () => {

    const generateAllNewDice = () => {
        const diceArray = new Array(10).fill(0).map(() => Math.ceil(Math.random() * 6))
        return diceArray.map(die => (
            {
                id: nanoid(),
                value: die,
                isHeld: false
            }
        ))
    }

    const [dice, setDice] = useState(() => generateAllNewDice())

    const gameWon = dice.every(die => die.isHeld) && dice.every(die => die.value === dice[0].value)

    const setFocus = useRef(null)

    useEffect(() => {
        if (gameWon) {
            setFocus.current.focus()
        }
    }, [gameWon])

    const hold = (id) => {
        setDice(prevDice => {
            return prevDice.map(dieObj => {
                return dieObj.id === id ? { ...dieObj, isHeld: !dieObj.isHeld } : dieObj
            })
        })
    }

    const dieEls = dice.map(dieObj => (
        <Die
            key={dieObj.id}
            value={dieObj.value}
            isHeld={dieObj.isHeld}
            hold={() => hold(dieObj.id)}
        />
    ))


    const rollDice = () => {
        if (gameWon) {
            setDice(generateAllNewDice())
        } else {
            setDice(prevDice => {
                return prevDice.map(dieObj => {
                    return dieObj.isHeld ? dieObj : { ...dieObj, value: Math.ceil(Math.random() * 6) }
                })
            })
        }
    }


    return (
        <main>
            {gameWon && <ReactConfetti width={window.innerWidth} height={window.innerHeight} />}
            <div aria-live="polite" className="sr-only">
                {gameWon && <p>Congratulations! You won! Press "New Game" to start again.</p>}
            </div>
            <h1 className="title">Tenzies</h1>
            <p className="instructions">Roll until all dice are the same. Click each die to freeze it at its current value between rolls.</p>
            <div className="container">
                {dieEls}
            </div>

            <button ref={setFocus} className="roll-dice" onClick={rollDice}>{gameWon ? "New Game" : "Roll"}</button>
        </main>
    )
}

export default App