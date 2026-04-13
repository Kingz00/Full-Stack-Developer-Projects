import type { JSX } from 'react'

const Keyboard = ({ keyboardBtns }: { keyboardBtns: JSX.Element[] }): JSX.Element => {
    return (
        <section className="keyboard">
            {keyboardBtns}
        </section>
    )
}

export default Keyboard