import Die from "./Die.jsx"
import { useState } from "react"

const App = () => {

    const generateAllNewDice = () => {
        return new Array(10).fill(0).map(() => Math.ceil(Math.random() * 6))
    }

    const [dice, setDice] = useState(generateAllNewDice())

    const dieEls = dice.map(die => <Die value={die} />)


    const rollDice = () => {
        setDice(generateAllNewDice())
    }


    return (
        <main>
            <div className="container">
                {dieEls}
            </div>

            <button className="roll-dice" onClick={rollDice}>Roll</button>
        </main>
    )
}

export default App